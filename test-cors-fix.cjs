async function testCORSFix() {
  const testDomains = [
    'https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app',
    'https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app',
    'https://apinew4aug-hqa00jg4b-ranchopandas-projects.vercel.app',
    'https://apinew4aug-p5ihzqbvo-ranchopandas-projects.vercel.app',
    'https://apinew4aug-mh0l32eph-ranchopandas-projects.vercel.app'
  ];

  console.log('🌱 Testing CORS Fix for Multiple Domains');
  console.log('=========================================');
  console.log('');

  for (const domain of testDomains) {
    try {
      console.log(`🔍 Testing domain: ${domain}`);
      
      const response = await fetch('https://plant-saathi-api.onrender.com/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': domain
        }
      });

      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ CORS: Allowed');
        const corsHeader = response.headers.get('access-control-allow-origin');
        console.log(`🌐 CORS Header: ${corsHeader}`);
      } else {
        console.log('❌ CORS: Blocked');
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---');
    }
  }

  console.log('🎯 CORS Test Complete!');
}

testCORSFix(); 