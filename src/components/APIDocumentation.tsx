import React, { useState } from 'react';
import { Code, Key, Database, AlertTriangle, Copy, CheckCircle } from 'lucide-react';
import { getApiBaseUrl } from '../utils/config';

interface APIDocumentationProps {
  apiKey: string;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ apiKey }) => {
  const [copied, setCopied] = useState<string>('');
  const baseURL = getApiBaseUrl();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST "${baseURL}/analyze-disease" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'`,
    
    javascript: `const response = await fetch('${baseURL}/analyze-disease', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    crop: 'tomato',
    location: 'California, USA',
    symptoms: 'yellowing leaves, brown spots'
  })
});

const result = await response.json();
console.log(result);`,
    
    python: `import requests
import base64

# Read and encode image
with open('plant_image.jpg', 'rb') as image_file:
    image_data = base64.b64encode(image_file.read()).decode('utf-8')

response = requests.post(
    '${baseURL}/analyze-disease',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}'
    },
    json={
        'image': f'data:image/jpeg;base64,{image_data}',
        'crop': 'tomato',
        'location': 'California, USA',
        'symptoms': 'yellowing leaves, brown spots'
    }
)

result = response.json()
print(result)`,

    postman: `{
  "info": {
    "name": "Plant Disease API",
    "description": "API for plant disease detection"
  },
  "item": [
    {
      "name": "Analyze Plant Disease",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-api-key",
            "value": "${apiKey}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"image\\": \\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...\\",\\n  \\"crop\\": \\"tomato\\",\\n  \\"location\\": \\"California, USA\\",\\n  \\"symptoms\\": \\"yellowing leaves, brown spots\\"\\n}"
        },
        "url": {
          "raw": "${baseURL}/analyze-disease",
          "host": ["${baseURL.replace('https://', '').replace('http://', '')}"],
          "path": ["analyze-disease"]
        }
      }
    }
  ]
}`
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Disease API Documentation</h1>
        <p className="text-gray-600">Integrate AI-powered plant disease detection into your applications</p>
      </div>

      {/* API Key Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Key className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-blue-900">Your API Key</h2>
          </div>
          <button
            onClick={() => copyToClipboard(apiKey, 'apikey')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            {copied === 'apikey' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied === 'apikey' ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <div className="bg-white p-3 rounded border font-mono text-sm break-all">
          {apiKey}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Keep this key secure and never share it publicly. Include it in the x-api-key header for all requests.
        </p>
      </div>

      {/* Quick Test Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Quick Test</h2>
        <p className="text-sm text-green-700 mb-3">Test your API key with this simple curl command:</p>
        <div className="bg-white p-3 rounded border font-mono text-sm overflow-x-auto relative">
          <button
            onClick={() => copyToClipboard(codeExamples.curl, 'quicktest')}
            className="absolute top-2 right-2 p-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {copied === 'quicktest' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <pre className="pr-8">{codeExamples.curl}</pre>
        </div>
      </div>

      {/* Endpoint Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoint</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Analyze Plant Disease</h3>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              POST {baseURL}/analyze-disease
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Request Headers</h3>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              Content-Type: application/json<br />
              x-api-key: {apiKey}
            </div>
          </div>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Format</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Required Parameters</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li><code>image</code> - Base64 encoded image data (required)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Optional Parameters</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li><code>crop</code> - Type of crop (e.g., "tomato", "wheat", "corn")</li>
              <li><code>location</code> - Geographic location for context</li>
              <li><code>symptoms</code> - Observed symptoms description</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Response Format */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
          <pre>{`{
  "disease_name": "Early Blight",
  "confidence": 0.95,
  "disease_stage": "Moderate",
  "symptoms": ["Dark spots on leaves", "Yellowing around spots"],
  "action_plan": ["Remove affected leaves", "Apply fungicide"],
  "treatments": {
    "organic": ["Neem oil spray", "Copper fungicide"],
    "chemical": ["Chlorothalonil", "Mancozeb"],
    "ipm": ["Crop rotation", "Resistant varieties"],
    "cultural": ["Proper spacing", "Good air circulation"]
  },
  "recommended_videos": ["tomato early blight treatment"],
  "faqs": [
    {
      "question": "What causes early blight?",
      "answer": "Early blight is caused by the fungus Alternaria solani..."
    }
  ],
  "tips": ["Water at soil level", "Mulch around plants"],
  "yield_impact": "Medium",
  "spread_risk": "High",
  "recovery_chance": "Good",
  "model_version": "gemini-1.5-flash"
}`}</pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Code className="w-6 h-6 text-gray-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Code Examples</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">cURL</h3>
              <button
                onClick={() => copyToClipboard(codeExamples.curl, 'curl')}
                className="flex items-center space-x-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                {copied === 'curl' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'curl' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{codeExamples.curl}</pre>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">JavaScript</h3>
              <button
                onClick={() => copyToClipboard(codeExamples.javascript, 'javascript')}
                className="flex items-center space-x-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                {copied === 'javascript' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'javascript' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{codeExamples.javascript}</pre>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Python</h3>
              <button
                onClick={() => copyToClipboard(codeExamples.python, 'python')}
                className="flex items-center space-x-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                {copied === 'python' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'python' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{codeExamples.python}</pre>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Postman Collection</h3>
              <button
                onClick={() => copyToClipboard(codeExamples.postman, 'postman')}
                className="flex items-center space-x-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                {copied === 'postman' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'postman' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{codeExamples.postman}</pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Copy this JSON and import it into Postman to get started quickly.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
          <h2 className="text-xl font-semibold text-yellow-900">Rate Limits & Billing</h2>
        </div>
        <div className="space-y-2 text-sm text-yellow-800">
          <p>• Each API key has a daily request limit</p>
          <p>• Requests beyond the daily limit incur additional charges</p>
          <p>• Failed requests do not count toward your limit</p>
          <p>• Rate limits reset daily at midnight UTC</p>
        </div>
      </div>

      {/* Error Handling */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Handling</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Common Error Codes</h3>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              <pre>{`400 - Bad Request (missing or invalid parameters)
401 - Unauthorized (invalid API key)
429 - Rate Limit Exceeded
500 - Internal Server Error

Example error response:
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid"
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;