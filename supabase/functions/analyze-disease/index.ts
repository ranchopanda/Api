import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AnalyzeRequest {
  image?: string
  crop?: string
  location?: string
  symptoms?: string
  api_key?: string
}

interface DetectionResult {
  disease_name: string
  confidence: number
  disease_stage: string
  symptoms: string[]
  action_plan: string[]
  treatments: {
    organic: string[]
    chemical: string[]
    ipm: string[]
    cultural: string[]
  }
  recommended_videos: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
  tips: string[]
  yield_impact: string
  spread_risk: string
  recovery_chance: string
  branding: string
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const base64String = btoa(String.fromCharCode(...uint8Array))
  return `data:${file.type};base64,${base64String}`
}

// Helper function to parse multipart form data
async function parseFormData(req: Request): Promise<{ image: string | null, data: any }> {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    
    let base64Image: string | null = null
    if (imageFile && imageFile instanceof File) {
      base64Image = await fileToBase64(imageFile)
    }

    // Extract other form fields
    const data: any = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        data[key] = value
      }
    }

    return { image: base64Image, data }
  } catch (error) {
    console.error('Error parsing form data:', error)
    return { image: null, data: {} }
  }
}

// Rate limiting check
async function checkRateLimit(supabase: any, company: any): Promise<{ allowed: boolean, message?: string }> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60000)
  
  // Reset counter if last request was more than a minute ago
  if (!company.last_request_time || new Date(company.last_request_time) < oneMinuteAgo) {
    await supabase
      .from('companies')
      .update({ 
        requests_this_minute: 1,
        last_request_time: now.toISOString()
      })
      .eq('id', company.id)
    
    return { allowed: true }
  }
  
  // Check if rate limit exceeded
  if (company.requests_this_minute >= company.rate_limit_per_minute) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded. Maximum ${company.rate_limit_per_minute} requests per minute allowed.`
    }
  }
  
  // Increment counter
  await supabase
    .from('companies')
    .update({ 
      requests_this_minute: company.requests_this_minute + 1,
      last_request_time: now.toISOString()
    })
    .eq('id', company.id)
  
  return { allowed: true }
}

// Log audit event
async function logAuditEvent(supabase: any, companyId: string, action: string, details: any, req: Request) {
  await supabase.from('audit_logs').insert({
    company_id: companyId,
    action,
    details,
    ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown'
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed',
      branding: 'Powered by Plant Saathi AI'
    }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let requestData: AnalyzeRequest = {}
    let imageData: string | null = null

    // Handle different content types
    if (contentType.includes('application/json')) {
      // JSON payload with base64 image
      requestData = await req.json()
      imageData = requestData.image || null
    } else if (contentType.includes('multipart/form-data')) {
      // Multipart form data with file upload
      const { image, data } = await parseFormData(req)
      imageData = image
      requestData = { ...data, image: imageData }
    } else {
      return new Response(JSON.stringify({ 
        error: 'Unsupported content type',
        message: 'Please use application/json or multipart/form-data',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Try multiple ways to get the API key
    let apiKey = req.headers.get('x-api-key') || 
                 req.headers.get('X-API-Key') ||
                 req.headers.get('apikey') ||
                 requestData.api_key

    // Try Authorization header as fallback
    if (!apiKey) {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
          apiKey = authHeader.substring(7)
        } else {
          apiKey = authHeader
        }
      }
    }
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API key required',
        message: 'Please include your API key in x-api-key header, Authorization header, or in the request body as api_key field',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!imageData) {
      return new Response(JSON.stringify({ 
        error: 'Image is required',
        message: 'Please provide an image as base64 string in JSON or as file upload in multipart form',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate API key and get company info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('api_key_hash', apiKey.trim())
      .single()

    if (companyError || !company) {
      return new Response(JSON.stringify({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if API key is revoked
    if (company.api_key_revoked) {
      await logAuditEvent(supabase, company.id, 'API_ACCESS_DENIED', { reason: 'revoked_key' }, req)
      return new Response(JSON.stringify({ 
        error: 'API key revoked',
        message: 'This API key has been revoked. Please contact support.',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if API key is expired
    if (company.expiry_date && new Date(company.expiry_date) < new Date()) {
      await logAuditEvent(supabase, company.id, 'API_ACCESS_DENIED', { reason: 'expired_key' }, req)
      return new Response(JSON.stringify({ 
        error: 'API key expired',
        message: 'This API key has expired. Please renew your subscription.',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if company is active
    if (company.status !== 'active') {
      await logAuditEvent(supabase, company.id, 'API_ACCESS_DENIED', { reason: 'inactive_company' }, req)
      return new Response(JSON.stringify({ 
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.',
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(supabase, company)
    if (!rateLimitCheck.allowed) {
      await logAuditEvent(supabase, company.id, 'RATE_LIMIT_EXCEEDED', { limit: company.rate_limit_per_minute }, req)
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: rateLimitCheck.message,
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check daily usage limit
    const isOverLimit = company.current_usage >= company.daily_limit
    const startTime = Date.now()

    try {
      // Initialize Gemini AI with the company's API key - Using Gemini 2.0 Flash
      const genAI = new GoogleGenerativeAI(company.gemini_key_encrypted)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      // Prepare the comprehensive prompt for Plant Saathi AI
      const prompt = `
      You are Plant Saathi AI, an expert plant pathologist and agricultural specialist. Analyze this plant image for diseases, pests, or health issues with the highest accuracy and provide actionable insights.

      Context provided:
      ${requestData.crop ? `Crop: ${requestData.crop}` : 'Crop: Not specified'}
      ${requestData.location ? `Location: ${requestData.location}` : 'Location: Not specified'}
      ${requestData.symptoms ? `Observed symptoms: ${requestData.symptoms}` : 'Symptoms: Not specified'}

      Please provide a detailed, professional analysis in the following JSON format. Be specific, accurate, and practical in your recommendations. Use your advanced AI capabilities to provide the most accurate diagnosis possible:

      {
        "disease_name": "Specific disease/pest name or 'Healthy Plant' if no issues detected",
        "confidence": 0.85,
        "disease_stage": "Early/Moderate/Severe/Not Applicable",
        "symptoms": ["List specific symptoms you observe in the image"],
        "action_plan": ["Immediate actionable steps the farmer should take"],
        "treatments": {
          "organic": ["Specific organic treatment options with application methods and dosages"],
          "chemical": ["Specific chemical treatments with active ingredients and application rates"],
          "ipm": ["Integrated pest management strategies with implementation details"],
          "cultural": ["Cultural and biological control methods with specific practices"]
        },
        "recommended_videos": ["Specific YouTube search terms for educational videos"],
        "faqs": [
          {
            "question": "What causes this condition?",
            "answer": "Detailed scientific explanation of the cause with environmental factors"
          },
          {
            "question": "How can I prevent this in the future?",
            "answer": "Specific prevention strategies with timing and methods"
          },
          {
            "question": "How long does treatment take to show results?",
            "answer": "Expected timeline for recovery with treatment milestones"
          }
        ],
        "tips": ["Practical management and prevention tips with specific actions"],
        "yield_impact": "High/Medium/Low/None - explain potential yield loss percentage",
        "spread_risk": "High/Medium/Low - explain transmission method and speed",
        "recovery_chance": "Excellent/Good/Fair/Poor - with proper treatment and conditions"
      }

      Important guidelines for Plant Saathi AI analysis:
      - Use your advanced AI vision capabilities to identify even subtle disease symptoms
      - Be specific about treatment dosages, timing, and application methods
      - Consider environmental factors, climate, and sustainable practices
      - Provide actionable advice that farmers can implement immediately
      - If the plant appears healthy, provide comprehensive preventive care recommendations
      - Base your analysis on detailed observation of leaf patterns, discoloration, spots, wilting, etc.
      - Consider the crop type and common diseases for that specific plant
      - Provide confidence levels based on image clarity and symptom visibility
      `

      // Convert base64 to proper format for Gemini
      let processedImageData = imageData
      if (processedImageData.startsWith('data:image/')) {
        processedImageData = processedImageData.split(',')[1]
      }
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: processedImageData,
            mimeType: 'image/jpeg'
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      // Parse the JSON response
      let analysisResult: DetectionResult
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const rawResult = JSON.parse(jsonMatch[0])
          
          // Remove model_version if it exists and add Plant Saathi branding
          if (rawResult.model_version) {
            delete rawResult.model_version
          }
          
          // Add Plant Saathi AI branding
          analysisResult = {
            ...rawResult,
            branding: "Powered by Plant Saathi AI"
          }
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        console.error('Raw response:', text)
        
        // Fallback response with Plant Saathi branding
        analysisResult = {
          disease_name: 'Analysis Complete',
          confidence: 0.8,
          disease_stage: 'Assessment needed',
          symptoms: ['Image analyzed by Plant Saathi AI - please consult with agricultural expert for detailed diagnosis'],
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
              answer: 'Plant Saathi AI uses advanced AI technology to provide highly accurate plant disease analysis, but should be verified by agricultural experts for critical decisions.'
            }
          ],
          tips: ['Regular monitoring', 'Proper plant nutrition', 'Good field sanitation'],
          yield_impact: 'Variable - depends on specific condition',
          spread_risk: 'Monitor closely for changes',
          recovery_chance: 'Good with proper care and management',
          branding: 'Powered by Plant Saathi AI'
        }
      }

      const responseTime = Date.now() - startTime
      const cost = isOverLimit ? parseFloat(company.cost_per_extra_call.toString()) : 0

      // Log the successful usage
      await supabase.from('usage_logs').insert({
        company_id: company.id,
        endpoint: '/analyze-disease',
        response_time: responseTime,
        tokens_used: 1,
        cost: cost,
        success: true,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

      // Update company usage
      await supabase
        .from('companies')
        .update({ 
          current_usage: company.current_usage + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      // Log successful API usage
      await logAuditEvent(supabase, company.id, 'API_REQUEST_SUCCESS', {
        endpoint: '/analyze-disease',
        response_time: responseTime,
        cost: cost
      }, req)

      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (aiError) {
      console.error('Plant Saathi AI Analysis error:', aiError)
      
      // Log failed request
      const responseTime = Date.now() - startTime
      await supabase.from('usage_logs').insert({
        company_id: company.id,
        endpoint: '/analyze-disease',
        response_time: responseTime,
        tokens_used: 0,
        cost: 0,
        success: false,
        error_message: aiError.message,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

      await logAuditEvent(supabase, company.id, 'API_REQUEST_FAILED', {
        error: aiError.message,
        response_time: responseTime
      }, req)

      return new Response(JSON.stringify({ 
        error: 'Plant Saathi AI analysis failed',
        message: 'Unable to analyze the image. Please check your Gemini API key or try again later.',
        details: aiError.message,
        branding: 'Powered by Plant Saathi AI'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in Plant Saathi AI:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again.',
      details: error.message,
      branding: 'Powered by Plant Saathi AI'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})