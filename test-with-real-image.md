# Testing Plant Saathi AI with Real Plant Images

## Step 1: Get a Plant Image

You can use any plant image. For testing, you can:
1. Take a photo of a plant with your phone
2. Download a sample plant disease image from the internet
3. Use this sample tomato leaf image URL: https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg

## Step 2: Convert Image to Base64

### Method 1: Using Online Tool
1. Go to https://www.base64-image.de/
2. Upload your plant image
3. Copy the base64 string (it will start with `data:image/jpeg;base64,`)

### Method 2: Using Command Line (macOS/Linux)
```bash
# Convert image to base64
base64 -i your_plant_image.jpg | tr -d '\n' > image_base64.txt

# Then add the data URL prefix
echo "data:image/jpeg;base64,$(cat image_base64.txt)" > full_image_data.txt
```

### Method 3: Using Python
```python
import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded_string}"

# Usage
base64_image = image_to_base64("your_plant_image.jpg")
print(base64_image)
```

## Step 3: Test with Real Image

### Method 1: Base64 JSON (Traditional)
Once you have the base64 string, test it with JSON:

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,YOUR_BASE64_STRING_HERE",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves with brown spots"
  }'
```

### Method 2: Direct File Upload (New!)
Test with direct file upload (no base64 conversion needed):

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -F "image=@/path/to/your/plant_image.jpg" \
  -F "crop=tomato" \
  -F "location=California, USA" \
  -F "symptoms=yellowing leaves with brown spots"
```

> **Tip**: Direct file upload is easier for mobile apps and doesn't require base64 conversion!

## Step 4: Expected Response

You should get a detailed Plant Saathi AI response like:

```json
{
  "disease_name": "Tomato Early Blight",
  "confidence": 0.92,
  "disease_stage": "Moderate",
  "symptoms": ["Dark brown spots with concentric rings", "Yellowing around lesions"],
  "action_plan": ["Remove affected leaves immediately", "Apply copper-based fungicide"],
  "treatments": {
    "organic": ["Neem oil spray every 7-10 days", "Copper sulfate solution"],
    "chemical": ["Chlorothalonil fungicide", "Mancozeb application"],
    "ipm": ["Crop rotation with non-solanaceous crops", "Resistant varieties"],
    "cultural": ["Improve air circulation", "Avoid overhead watering"]
  },
  "recommended_videos": ["tomato early blight treatment", "fungicide application techniques"],
  "faqs": [
    {
      "question": "What causes early blight?",
      "answer": "Early blight is caused by the fungus Alternaria solani, favored by warm, humid conditions."
    }
  ],
  "tips": ["Water at soil level to avoid leaf wetness", "Mulch to prevent soil splash"],
  "yield_impact": "Medium - can reduce yield by 20-30% if untreated",
  "spread_risk": "High - spreads rapidly in humid conditions",
  "recovery_chance": "Good with immediate treatment and proper management",
  "branding": "Powered by Plant Saathi AI"
}
```

## Plant Saathi AI Advantages

- **Gemini 2.0 Flash**: Uses the latest AI model for better accuracy
- **Detailed Analysis**: More comprehensive disease information
- **Professional Branding**: Clean, branded responses
- **Dual Upload Support**: Both base64 and direct file upload
- **Enhanced Prompting**: Better AI instructions for accurate diagnosis

## Troubleshooting

### If you get "Invalid Gemini API key" error:
- The company's Gemini API key in the database might be invalid
- Check the admin dashboard to verify the Gemini key is correctly set

### If you get "Image too large" error:
- Resize your image to be smaller (max 4MB for Gemini)
- Use JPEG format for better compression

### If analysis seems inaccurate:
- Provide more context in the `crop`, `location`, and `symptoms` fields
- Use higher quality, well-lit images
- Focus on the affected parts of the plant

## Sample Test Images

You can test with these sample plant disease images:

1. **Tomato Late Blight**: https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg
2. **Healthy Plant**: https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg

**For Base64 method**: Convert these to base64 before testing
**For File Upload method**: Download and upload directly - no conversion needed!