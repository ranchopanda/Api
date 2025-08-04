# 🚀 Plant Saathi AI - Quick Demo Guide

## 📋 **5-Minute Demo Setup**

### **Step 1: Get Your API Key**
```bash
curl -X POST https://plant-saathi-api.onrender.com/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Company",
    "email": "demo@company.com",
    "daily_limit": 1000,
    "cost_per_extra_call": 0.10
  }'
```

**Response:**
```json
{
  "id": "company-uuid",
  "name": "Demo Company",
  "api_key": "your-api-key-here",
  "daily_limit": 1000,
  "status": "active"
}
```

### **Step 2: Test Disease Detection**
```bash
curl -X POST https://plant-saathi-api.onrender.com/api/analyze-disease \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves"
  }'
```

### **Step 3: Check API Health**
```bash
curl https://plant-saathi-api.onrender.com/health
```

---

## 🎯 **Live Demo URLs**

### **Production Frontend**
- **URL**: https://apinew4aug-mh0l32eph-ranchopandas-projects.vercel.app/
- **Features**: Full admin dashboard, API testing, analytics

### **API Documentation**
- **Health Check**: https://plant-saathi-api.onrender.com/health
- **API Info**: https://plant-saathi-api.onrender.com/api

---

## 📊 **Demo Test Cases**

### **Test Case 1: Tomato Early Blight**
```bash
# Use the image from your desktop
curl -X POST https://plant-saathi-api.onrender.com/api/analyze-disease \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "image": "BASE64_IMAGE_DATA",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves with brown spots"
  }'
```

**Expected Response:**
```json
{
  "disease_name": "Early Blight",
  "confidence": 0.9,
  "disease_stage": "Moderate",
  "symptoms": [
    "Yellowing of leaves, especially older ones",
    "Dark brown to black circular spots with target pattern"
  ],
  "action_plan": [
    "Immediately remove and destroy affected leaves",
    "Apply appropriate fungicide treatment promptly"
  ],
  "yield_impact": "Medium",
  "recovery_chance": "Good"
}
```

### **Test Case 2: Check Usage Analytics**
```bash
curl -X GET https://plant-saathi-api.onrender.com/api/usage-tracking?period=7d \
  -H "Content-Type: application/json"
```

---

## 🔧 **Integration Examples**

### **JavaScript Integration**
```javascript
// Simple fetch example
const analyzePlant = async (imageFile, apiKey) => {
  const base64Image = await fileToBase64(imageFile);
  
  const response = await fetch('https://plant-saathi-api.onrender.com/api/analyze-disease', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      image: base64Image,
      crop: 'tomato',
      location: 'California, USA',
      symptoms: 'yellowing leaves'
    })
  });
  
  return await response.json();
};

// Usage
const result = await analyzePlant(imageFile, 'YOUR_API_KEY');
console.log('Disease:', result.disease_name);
console.log('Confidence:', result.confidence);
```

### **Python Integration**
```python
import requests
import base64

def analyze_plant(image_path, api_key):
    # Convert image to base64
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Make API request
    response = requests.post(
        'https://plant-saathi-api.onrender.com/api/analyze-disease',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': api_key
        },
        json={
            'image': f'data:image/jpeg;base64,{image_data}',
            'crop': 'tomato',
            'location': 'California, USA',
            'symptoms': 'yellowing leaves'
        }
    )
    
    return response.json()

# Usage
result = analyze_plant('plant_image.jpg', 'YOUR_API_KEY')
print(f"Disease: {result['disease_name']}")
print(f"Confidence: {result['confidence']}")
```

---

## 📈 **Performance Demo**

### **Response Time Test**
```bash
time curl -X POST https://plant-saathi-api.onrender.com/api/analyze-disease \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"image":"BASE64_DATA","crop":"tomato"}'
```

### **Concurrent Request Test**
```bash
# Test 5 concurrent requests
for i in {1..5}; do
  curl -X POST https://plant-saathi-api.onrender.com/api/analyze-disease \
    -H "Content-Type: application/json" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{"image":"BASE64_DATA","crop":"tomato"}' &
done
wait
```

---

## 🎯 **Demo Checklist**

### **Technical Demo**
- [ ] **API Key Generation**: Create company account
- [ ] **Health Check**: Verify system status
- [ ] **Image Analysis**: Test disease detection
- [ ] **Response Time**: Measure performance
- [ ] **Error Handling**: Test invalid requests
- [ ] **Rate Limiting**: Test request limits

### **Business Demo**
- [ ] **Admin Dashboard**: Show company management
- [ ] **Usage Analytics**: Display metrics
- [ ] **API Documentation**: Show integration ease
- [ ] **Multi-tenant**: Demonstrate scalability
- [ ] **Security Features**: Explain compliance

---

## 📞 **Support During Demo**

### **Technical Support**
- **Real-time Monitoring**: https://plant-saathi-api.onrender.com/health
- **Error Logs**: Available in Render dashboard
- **API Documentation**: Complete endpoint docs
- **Response Time**: < 3 seconds average

### **Demo Tips**
1. **Prepare Images**: Have plant disease images ready
2. **Test API Key**: Verify access before demo
3. **Show Dashboard**: Demonstrate admin features
4. **Explain Architecture**: Highlight scalability
5. **Discuss Integration**: Show implementation ease

---

**🌱 Ready to transform agriculture with AI!** 