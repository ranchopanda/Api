const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Error reading image:', error.message);
    return null;
  }
}

// Function to test API with small image
async function testSmallImage() {
  const apiKey = '59b3fe106e621ef92ef3bbf4f9ab798d8ad3f41d5bf33b5d7575f270270c5e4b';
  
  // Create a small test image (1x1 pixel)
  const smallImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  const requestBody = {
    image: smallImageData,
    crop: 'tomato',
    location: 'California, USA',
    symptoms: 'test symptoms'
  };

  try {
    console.log('🌱 Testing Plant Saathi AI with small image');
    console.log('🌾 Crop: tomato');
    console.log('📍 Location: California, USA');
    console.log('🔍 Symptoms: test symptoms');
    console.log('📊 Image size: ~1 KB (1x1 pixel)');
    console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
    console.log('🌐 API URL: https://plant-saathi-api.onrender.com/api/analyze-disease');
    console.log('---');

    const response = await fetch('https://plant-saathi-api.onrender.com/api/analyze-disease', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Analysis Successful!');
      console.log('🦠 Disease:', result.disease_name);
      console.log('📈 Confidence:', result.confidence);
      console.log('📊 Stage:', result.disease_stage);
      console.log('🔍 Symptoms:', result.symptoms.join(', '));
      console.log('📋 Action Plan:', result.action_plan.join(', '));
      console.log('📉 Yield Impact:', result.yield_impact);
      console.log('🔄 Recovery Chance:', result.recovery_chance);
      console.log('---');
      console.log('📄 Full Response:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Analysis Failed:');
      console.log('📊 Status:', response.status);
      console.log('🚨 Error:', result.error);
      console.log('💬 Message:', result.message);
      console.log('🔍 Details:', result.details);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

console.log('🌿 Plant Saathi AI - Small Image Test');
console.log('=====================================');
console.log('');

testSmallImage(); 