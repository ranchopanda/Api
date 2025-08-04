# Plant Saathi AI API Documentation

## 🌱 Plant Disease Detection API

**Base URL**: `https://plant-saathi-api.onrender.com`

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Cost**: Free to use (with rate limits)

---

## 🔑 Authentication

All API requests require an API key. Include it in the request header:

```bash
x-api-key: YOUR_API_KEY
```

**Example API Key**: `75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8`

---

## 📋 Available Endpoints

### 1. **Health Check**
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-04T14:05:06.582Z",
  "uptime": 70.09379121,
  "environment": "production",
  "database": "connected"
}
```

### 2. **API Information**
```bash
GET /api
```

**Response:**
```json
{
  "name": "Plant Saathi AI API",
  "version": "1.0.0",
  "status": "operational",
  "documentation": "/api/docs"
}
```

### 3. **Plant Disease Detection** ⭐
```bash
POST /api/analyze-disease
```

**Headers:**
```bash
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "crop": "tomato",
  "location": "California, USA",
  "symptoms": "yellowing leaves, brown spots"
}
```

**Response:**
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

### 4. **Company Management**
```bash
GET /api/companies
```

**Response:**
```json
[
  {
    "id": "a2ff1c40-a481-4aaa-91ae-2ed91c19b47c",
    "name": "Company Name",
    "email": "company@example.com",
    "daily_limit": 100,
    "current_usage": 5,
    "status": "active",
    "api_key": "75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8"
  }
]
```

### 5. **Usage Analytics**
```bash
GET /api/usage-tracking
```

**Response:**
```json
{
  "stats": {
    "total_requests": "16",
    "successful_requests": "14",
    "failed_requests": "2",
    "avg_response_time": "10050.375",
    "total_cost": "5.0000"
  },
  "company_summary": [...],
  "daily_usage": [...],
  "endpoint_usage": [...]
}
```

### 6. **Complaints Management**
```bash
GET /api/complaints
POST /api/complaints
```

---

## 🚀 Quick Start Examples

### **cURL Example**
```bash
curl -X POST "https://plant-saathi-api.onrender.com/api/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

### **JavaScript Example**
```javascript
const response = await fetch('https://plant-saathi-api.onrender.com/api/analyze-disease', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8'
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

### **Python Example**
```python
import requests
import base64

# Read and encode image
with open('plant_image.jpg', 'rb') as image_file:
    image_data = base64.b64encode(image_file.read()).decode('utf-8')

response = requests.post(
    'https://plant-saathi-api.onrender.com/api/analyze-disease',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': '75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8'
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

---

## 📊 Rate Limits & Pricing

### **Free Tier Limits**
- **Daily Requests**: 100 per API key
- **Rate Limit**: 60 requests per minute
- **Cost**: $0 (Free)

### **Response Times**
- **Average**: 10-15 seconds
- **Cold Start**: 10-30 seconds (after inactivity)
- **Warm Start**: 1-3 seconds

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request (missing or invalid parameters) |
| `401` | Unauthorized (invalid API key) |
| `429` | Rate Limit Exceeded |
| `500` | Internal Server Error |

**Example Error Response:**
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid",
  "branding": "Powered by Plant Saathi AI"
}
```

---

## 🔧 Supported Crops

The API supports analysis for various crops including:
- **Vegetables**: Tomato, Potato, Pepper, Cucumber, etc.
- **Fruits**: Apple, Orange, Grape, Strawberry, etc.
- **Grains**: Rice, Wheat, Corn, etc.
- **And many more...**

---

## 📱 Integration Tips

### **Image Requirements**
- **Format**: JPEG, PNG, WebP
- **Size**: Up to 10MB
- **Encoding**: Base64 with data URL prefix
- **Quality**: Clear, well-lit images work best

### **Best Practices**
1. **Use clear, high-quality images**
2. **Include crop type for better accuracy**
3. **Describe symptoms when possible**
4. **Handle rate limits gracefully**
5. **Implement error handling**

---

## 🌐 Live Demo

**Frontend Dashboard**: https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app/

**API Health Check**: https://plant-saathi-api.onrender.com/health

---

## 📞 Support

- **Documentation**: This file
- **GitHub**: https://github.com/ranchopanda/Api
- **Health Status**: https://plant-saathi-api.onrender.com/health

---

**Powered by Plant Saathi AI** 🌱✨ 