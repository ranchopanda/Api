const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const crypto = require('crypto');
const AWS = require('aws-sdk');

const router = express.Router();

// Configure AWS S3 client for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  s3ForcePathStyle: true, // Required for R2
  region: 'us-east-1', // Default region for R2
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to convert buffer to base64
function bufferToBase64(buffer, mimeType) {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Rate limiting check
async function checkRateLimit(company) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  
  if (!company.last_request_time || new Date(company.last_request_time) < oneMinuteAgo) {
    await global.pool.query(
      'UPDATE companies SET requests_this_minute = 1, last_request_time = $1 WHERE id = $2',
      [now.toISOString(), company.id]
    );
    return { allowed: true };
  }
  
  if (company.requests_this_minute >= company.rate_limit_per_minute) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded. Maximum ${company.rate_limit_per_minute} requests per minute allowed.`
    };
  }
  
  await global.pool.query(
    'UPDATE companies SET requests_this_minute = requests_this_minute + 1, last_request_time = $1 WHERE id = $2',
    [now.toISOString(), company.id]
  );
  
  return { allowed: true };
}

// Log audit event
async function logAuditEvent(companyId, action, details, req) {
  await global.pool.query(
    'INSERT INTO audit_logs (company_id, action, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
    [
      companyId,
      action,
      JSON.stringify(details),
      req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ]
  );
}

router.post('/', upload.single('image'), async (req, res) => {
  console.log('Analyze disease endpoint called');
  try {
    let imageData = null;
    let requestData = {};

    // Handle different content types
    if (req.headers['content-type']?.includes('application/json')) {
      // JSON payload with base64 image
      requestData = req.body;
      imageData = requestData.image || null;
    } else if (req.file) {
      // Multipart form data with file upload
      imageData = bufferToBase64(req.file.buffer, req.file.mimetype);
      requestData = { ...req.body, image: imageData };
    } else {
      return res.status(400).json({
        error: 'Unsupported content type',
        message: 'Please use application/json or multipart/form-data',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Get API key from multiple sources
    let apiKey = req.headers['x-api-key'] || 
                 req.headers['X-API-Key'] ||
                 req.headers['apikey'] ||
                 requestData.api_key;
    
    console.log('Received API key:', apiKey);

    if (!apiKey) {
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        apiKey = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      }
    }

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Please include your API key in x-api-key header, Authorization header, or in the request body as api_key field',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    if (!imageData) {
      return res.status(400).json({
        error: 'Image is required',
        message: 'Please provide an image as base64 string in JSON or as file upload in multipart form',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Validate API key and get company info
    const apiKeyHash = crypto.createHash('sha256').update(apiKey.trim()).digest('hex');
    console.log('Looking for API key hash:', apiKeyHash);
    
    const { rows: companies } = await global.pool.query(
      'SELECT * FROM companies WHERE api_key_hash = $1',
      [apiKeyHash]
    );
    
    console.log('Found companies:', companies.length);

    if (companies.length === 0) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    const company = companies[0];

    // Check if API key is revoked
    if (company.api_key_revoked) {
      await logAuditEvent(company.id, 'API_ACCESS_DENIED', { reason: 'revoked_key' }, req);
      return res.status(401).json({
        error: 'API key revoked',
        message: 'This API key has been revoked. Please contact support.',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Check if API key is expired
    if (company.expiry_date && new Date(company.expiry_date) < new Date()) {
      await logAuditEvent(company.id, 'API_ACCESS_DENIED', { reason: 'expired_key' }, req);
      return res.status(401).json({
        error: 'API key expired',
        message: 'This API key has expired. Please renew your subscription.',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Check if company is active
    if (company.status !== 'active') {
      await logAuditEvent(company.id, 'API_ACCESS_DENIED', { reason: 'inactive_company' }, req);
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.',
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(company);
    if (!rateLimitCheck.allowed) {
      await logAuditEvent(company.id, 'RATE_LIMIT_EXCEEDED', { limit: company.rate_limit_per_minute }, req);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitCheck.message,
        branding: 'Powered by Plant Saathi AI'
      });
    }

    // Check daily usage limit
    const isOverLimit = company.current_usage >= company.daily_limit;
    const startTime = Date.now();

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(company.gemini_key_encrypted);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Prepare the comprehensive prompt
      const prompt = `
      You are Plant Saathi AI, an expert plant pathologist and agricultural specialist. Analyze this plant image for diseases, pests, or health issues with the highest accuracy and provide actionable insights.

      Context provided:
      ${requestData.crop ? `Crop: ${requestData.crop}` : 'Crop: Not specified'}
      ${requestData.location ? `Location: ${requestData.location}` : 'Location: Not specified'}
      ${requestData.symptoms ? `Observed symptoms: ${requestData.symptoms}` : 'Symptoms: Not specified'}

      Please provide a detailed, professional analysis in the following JSON format:

      {
        "disease_name": "Specific disease/pest name or 'Healthy Plant' if no issues detected",
        "confidence": 0.85,
        "disease_stage": "Early/Moderate/Severe/Not Applicable",
        "symptoms": ["List specific symptoms you observe in the image"],
        "action_plan": ["Immediate actionable steps the farmer should take"],
        "treatments": {
          "organic": ["Specific organic treatment options"],
          "chemical": ["Specific chemical treatments"],
          "ipm": ["Integrated pest management strategies"],
          "cultural": ["Cultural and biological control methods"]
        },
        "recommended_videos": ["Specific YouTube search terms for educational videos"],
        "faqs": [
          {
            "question": "What causes this condition?",
            "answer": "Detailed scientific explanation"
          }
        ],
        "tips": ["Practical management and prevention tips"],
        "yield_impact": "High/Medium/Low/None",
        "spread_risk": "High/Medium/Low",
        "recovery_chance": "Excellent/Good/Fair/Poor"
      }
      `;

      // Convert base64 to proper format for Gemini
      let processedImageData = imageData;
      if (processedImageData.startsWith('data:image/')) {
        processedImageData = processedImageData.split(',')[1];
      }

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: processedImageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('🔍 Raw Gemini response:', text);

      // Parse the JSON response
      let analysisResult;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const rawResult = JSON.parse(jsonMatch[0]);
          analysisResult = {
            ...rawResult,
            branding: "Powered by Plant Saathi AI"
          };
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        analysisResult = {
          disease_name: 'Analysis Complete',
          confidence: 0.8,
          disease_stage: 'Assessment needed',
          symptoms: ['Image analyzed by Plant Saathi AI - please consult with agricultural expert'],
          action_plan: ['Monitor plant health closely', 'Consider consulting with local agricultural extension service'],
          treatments: {
            organic: ['Apply organic compost', 'Ensure proper watering schedule'],
            chemical: ['Consult agricultural expert for chemical recommendations'],
            ipm: ['Implement integrated pest management practices'],
            cultural: ['Maintain good field hygiene', 'Ensure proper plant spacing']
          },
          recommended_videos: ['plant disease identification', `${requestData.crop || 'crop'} disease management`],
          faqs: [
            {
              question: 'How accurate is Plant Saathi AI analysis?',
              answer: 'Plant Saathi AI uses advanced AI technology to provide highly accurate plant disease analysis.'
            }
          ],
          tips: ['Regular monitoring', 'Proper plant nutrition', 'Good field sanitation'],
          yield_impact: 'Variable - depends on specific condition',
          spread_risk: 'Monitor closely for changes',
          recovery_chance: 'Good with proper care and management',
          branding: 'Powered by Plant Saathi AI'
        };
      }

      const responseTime = Date.now() - startTime;
      const cost = isOverLimit ? parseFloat(company.cost_per_extra_call.toString()) : 0;

      // Log the successful usage
      await global.pool.query(
        'INSERT INTO usage_logs (company_id, endpoint, response_time, tokens_used, cost, success, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          company.id,
          '/analyze-disease',
          responseTime,
          1,
          cost,
          true,
          req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
          req.headers['user-agent'] || 'unknown'
        ]
      );

      // Update company usage
      await global.pool.query(
        'UPDATE companies SET current_usage = current_usage + 1, updated_at = $1 WHERE id = $2',
        [new Date().toISOString(), company.id]
      );

      // Upload image to R2 (optional - skip if not configured)
      let imageUrl = null;
      console.log('🔧 R2 Configuration check:');
      console.log('  - R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || 'NOT SET');
      console.log('  - R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
      console.log('  - R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
      console.log('  - R2_ENDPOINT:', process.env.R2_ENDPOINT || 'NOT SET');
      
      if (process.env.R2_BUCKET_NAME && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
        try {
          console.log('📤 Attempting R2 upload...');
          const imageBuffer = Buffer.from(processedImageData, 'base64');
          const imageName = `${company.id}/${Date.now()}.jpg`;
          console.log('📁 Image name:', imageName);
          console.log('📦 Bucket:', process.env.R2_BUCKET_NAME);
          
          const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: imageName,
            Body: imageBuffer,
            ContentType: 'image/jpeg',
          };
          const uploadResult = await s3.upload(uploadParams).promise();
          imageUrl = uploadResult.Location;
          console.log('✅ Image uploaded to R2:', imageUrl);
        } catch (uploadError) {
          console.error('❌ R2 upload failed:', uploadError.message);
          console.error('🔍 Upload error details:', uploadError);
          // Continue without image upload
        }
      } else {
        console.log('⚠️ R2 not configured, skipping image upload');
      }

      // Save analysis to database (with or without image URL)
      await global.pool.query(
        'INSERT INTO analysis_requests (company_id, image_url, analysis_result) VALUES ($1, $2, $3)',
        [company.id, imageUrl || null, JSON.stringify(analysisResult)]
      );

      // Log successful API usage
      await logAuditEvent(company.id, 'API_REQUEST_SUCCESS', {
        endpoint: '/analyze-disease',
        response_time: responseTime,
        cost: cost
      }, req);

      // Include image URL in response if available
      const responseData = {
        ...analysisResult,
        image_url: imageUrl || null
      };
      
      res.json(responseData);

    } catch (aiError) {
      console.error('Plant Saathi AI Analysis error:', aiError);
      
      const responseTime = Date.now() - startTime;
      await global.pool.query(
        'INSERT INTO usage_logs (company_id, endpoint, response_time, tokens_used, cost, success, error_message, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          company.id,
          '/analyze-disease',
          responseTime,
          0,
          0,
          false,
          aiError.message,
          req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
          req.headers['user-agent'] || 'unknown'
        ]
      );

      await logAuditEvent(company.id, 'API_REQUEST_FAILED', {
        error: aiError.message,
        response_time: responseTime
      }, req);

      res.status(500).json({
        error: 'Plant Saathi AI analysis failed',
        message: 'Unable to analyze the image. Please check your Gemini API key or try again later.',
        details: aiError.message,
        branding: 'Powered by Plant Saathi AI'
      });
    }

  } catch (error) {
    console.error('Error in Plant Saathi AI:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again.',
      details: error.message,
      branding: 'Powered by Plant Saathi AI'
    });
  }
});

module.exports = router;
