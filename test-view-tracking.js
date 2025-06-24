const https = require('http');

// Function to make a request with session cookies
async function makeRequestWithSession(articleId, sessionCookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/articles/${articleId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'View-Tracking-Test/1.0',
      }
    };

    if (sessionCookie) {
      options.headers.Cookie = sessionCookie;
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const sessionCookie = res.headers['set-cookie'];
          resolve({
            ...response,
            sessionCookie: sessionCookie ? sessionCookie[0].split(';')[0] : null
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testViewTracking() {
  console.log('🧪 Testing session-based view tracking...\n');

  try {
    // First request - should create new session and count view
    console.log('1️⃣ First request (new session):');
    const firstResponse = await makeRequestWithSession(1);
    console.log(`   Views: ${firstResponse.data.views}`);
    console.log(`   View Counted: ${firstResponse.viewCounted}`);
    console.log(`   Session Cookie: ${firstResponse.sessionCookie ? 'Present' : 'Missing'}\n`);

    // Second request with same session - should NOT count view
    console.log('2️⃣ Second request (same session):');
    const secondResponse = await makeRequestWithSession(1, firstResponse.sessionCookie);
    console.log(`   Views: ${secondResponse.data.views}`);
    console.log(`   View Counted: ${secondResponse.viewCounted}`);
    console.log(`   Expected: View count should stay the same\n`);

    // Third request with new session - should count view
    console.log('3️⃣ Third request (new session):');
    const thirdResponse = await makeRequestWithSession(1);
    console.log(`   Views: ${thirdResponse.data.views}`);
    console.log(`   View Counted: ${thirdResponse.viewCounted}`);
    console.log(`   Expected: View count should increase\n`);

    // Summary
    console.log('📊 Test Summary:');
    console.log(`   Initial views: ${firstResponse.data.views}`);
    console.log(`   After same session: ${secondResponse.data.views} (should be same)`);
    console.log(`   After new session: ${thirdResponse.data.views} (should be +1)`);
    
    const viewIncreaseCorrect = thirdResponse.data.views > secondResponse.data.views;
    const sessionTrackingCorrect = secondResponse.data.views === firstResponse.data.views;
    
    console.log(`\n✅ Session tracking working: ${sessionTrackingCorrect}`);
    console.log(`✅ New session counting working: ${viewIncreaseCorrect}`);
    
    if (sessionTrackingCorrect && viewIncreaseCorrect) {
      console.log('\n🎉 All tests passed! Session-based view tracking is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testViewTracking(); 