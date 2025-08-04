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

// Function to test API with image
async function testPlantDiseaseAPI(imagePath, crop = 'tomato', location = 'California, USA', symptoms = '') {
  const apiKey = '24d816d605247bde849f68867077b56d62c3958bf05664ce555296af06f1d10f';
  const base64Image = imageToBase64(imagePath);
  
  if (!base64Image) {
    console.error('Failed to convert image to base64');
    return;
  }

  const requestBody = {
    image: base64Image,
    crop: crop,
    location: location,
    symptoms: symptoms
  };

  try {
    console.log('Testing Plant Saathi AI with image:', imagePath);
    console.log('Crop:', crop);
    console.log('Location:', location);
    console.log('Symptoms:', symptoms || 'None specified');
    console.log('Image size:', Math.round(base64Image.length / 1024), 'KB');
    console.log('---');

    const response = await fetch('http://localhost:3001/api/analyze-disease', {
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
      console.log('Disease:', result.disease_name);
      console.log('Confidence:', result.confidence);
      console.log('Stage:', result.disease_stage);
      console.log('Symptoms:', result.symptoms.join(', '));
      console.log('Action Plan:', result.action_plan.join(', '));
      console.log('Yield Impact:', result.yield_impact);
      console.log('Recovery Chance:', result.recovery_chance);
      console.log('---');
      console.log('Full Response:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Analysis Failed:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
      console.log('Message:', result.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Usage instructions
console.log('🌿 Plant Saathi AI - Real Image Test');
console.log('=====================================');
console.log('');
console.log('To test with a real image:');
console.log('1. Place your plant image in this directory');
console.log('2. Run: node test-real-image.js <image-path>');
console.log('');
console.log('Example:');
console.log('  node test-real-image.js my-plant.jpg');
console.log('  node test-real-image.js tomato-leaves.png');
console.log('');

// If image path is provided as argument
const imagePath = process.argv[2];
if (imagePath) {
  if (fs.existsSync(imagePath)) {
    testPlantDiseaseAPI(imagePath);
  } else {
    console.error('❌ Image file not found:', imagePath);
    console.log('Please provide a valid image path.');
  }
} else {
  console.log('No image path provided. Please run with an image path:');
  console.log('  node test-real-image.js <image-path>');
} 