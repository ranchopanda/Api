# Plant Saathi AI - Plant Disease Detection API

A comprehensive SaaS platform for plant disease detection using advanced AI technology, with a complete admin dashboard for managing companies, API keys, usage analytics, and customer support.

## Features

- **Plant Saathi AI** - Advanced plant disease detection using Gemini 2.0 Flash
- **Company Management**: Create and manage API clients
- **API Key Generation**: Secure API key generation and management
- **Usage Analytics**: Track API usage, success rates, and billing
- **Complaints Management**: Handle customer support tickets
- **Real-time Monitoring**: Monitor API performance and usage
- **Dual Upload Support**: Accept both base64 JSON and direct file uploads

## API Testing

### Quick Test with cURL

Replace `YOUR_API_KEY` with an actual API key from the dashboard. Multiple authentication methods are supported:

#### Method 1: Base64 JSON with API Key in Request Body (Recommended)
```bash
curl -X POST "https://your-supabase-url.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

#### Method 1b: Direct File Upload (New Feature)
```bash
curl -X POST "https://your-supabase-url.supabase.co/functions/v1/analyze-disease" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "image=@/path/to/your/plant_image.jpg" \
  -F "crop=tomato" \
  -F "location=California, USA" \
  -F "symptoms=yellowing leaves, brown spots"
```

> **New!** Plant Saathi AI now supports direct file uploads using multipart/form-data, making integration easier for mobile apps and web forms.

#### Method 2: API Key in Authorization Header
```bash
curl -X POST "https://your-supabase-url.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

#### Method 3: API Key in x-api-key Header (Original)
```bash
curl -X POST "https://your-supabase-url.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

### Postman Collection

Import this JSON into Postman:

```json
{
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
            "value": "YOUR_API_KEY"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"image\": \"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...\",\n  \"crop\": \"tomato\",\n  \"location\": \"California, USA\",\n  \"symptoms\": \"yellowing leaves, brown spots\"\n}"
        },
        "url": {
          "raw": "https://your-supabase-url.supabase.co/functions/v1/analyze-disease",
          "protocol": "https",
          "host": ["your-supabase-url", "supabase", "co"],
          "path": ["functions", "v1", "analyze-disease"]
        }
      }
    }
  ]
}
```

### JavaScript Example

```javascript
const response = await fetch('https://your-supabase-url.supabase.co/functions/v1/analyze-disease', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    crop: 'tomato',
    location: 'California, USA',
    symptoms: 'yellowing leaves, brown spots'
  })
});

const result = await response.json();
console.log(result);
```

### Python Example

```python
import requests
import base64

# Read and encode image
with open('plant_image.jpg', 'rb') as image_file:
    image_data = base64.b64encode(image_file.read()).decode('utf-8')

response = requests.post(
    'https://your-supabase-url.supabase.co/functions/v1/analyze-disease',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY'
    },
    json={
        'image': f'data:image/jpeg;base64,{image_data}',
        'crop': 'tomato',
        'location': 'California, USA',
        'symptoms': 'yellowing leaves, brown spots'
    }
)

result = response.json()
print(result)
```

## API Response Format

```json
{
  "disease_name": "Tomato Early Blight",
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
  "branding": "Powered by Plant Saathi AI"
}
```

> **Note**: All responses are powered by Plant Saathi AI using the latest Gemini 2.0 Flash model for enhanced accuracy and detailed analysis.

## Error Codes

- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid API key)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase environment variables
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses the following main tables:
- `companies` - API client companies
- `usage_logs` - API usage tracking
- `complaints` - Customer support tickets
- `admins` - Admin user accounts

## Plant Saathi AI Features

- **Advanced AI Analysis**: Uses Gemini 2.0 Flash for superior plant disease detection
- **Comprehensive Reports**: Detailed symptoms, treatments, and recovery guidance
- **Multiple Upload Methods**: Support for both base64 JSON and direct file uploads
- **Professional Branding**: Clean, branded responses for white-label integration
- **High Accuracy**: Enhanced prompting and AI model for better disease identification

## License

MIT License# Force redeploy - Tue Aug  5 00:00:43 IST 2025
