const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiKey() {
  const apiKey = 'AIzaSyCIBfxO0ucbAZXYE73P-vvTQFcCjn52y8w';
  
  console.log('🔑 Testing Gemini API Key');
  console.log('==========================');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('🤖 Testing simple text generation...');
    
    const result = await model.generateContent("Hello, this is a test message. Please respond with 'Test successful' if you can read this.");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Test Successful!');
    console.log('📝 Response:', text);
    console.log('');
    
    // Test image analysis
    console.log('🖼️ Testing image analysis capability...');
    
    const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a simple test image (1x1 pixel)
    const testImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    const imageResult = await imageModel.generateContent([
      "Analyze this image and tell me what you see. If you can see an image, respond with 'Image analysis successful'.",
      {
        inlineData: {
          data: testImageData.split(',')[1], // Remove data:image/png;base64, prefix
          mimeType: "image/png"
        }
      }
    ]);
    
    const imageResponse = await imageResult.response;
    const imageText = imageResponse.text();
    
    console.log('✅ Image Analysis Test Successful!');
    console.log('📝 Response:', imageText);
    
  } catch (error) {
    console.log('❌ Gemini API Test Failed:');
    console.log('🚨 Error:', error.message);
    console.log('📊 Error Code:', error.code);
    console.log('🔍 Error Details:', error.details);
  }
}

testGeminiKey(); 