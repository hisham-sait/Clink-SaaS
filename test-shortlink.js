// Script to test the shortlink redirection
const http = require('http');
const https = require('https');

// Function to make a GET request and follow redirects
function followRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    // Choose the appropriate protocol
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      console.log(`Status Code: ${response.statusCode}`);
      console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
      // If we get a redirect status code and we haven't exceeded the max redirects
      if ((response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) && maxRedirects > 0) {
        const location = response.headers.location;
        console.log(`Redirecting to: ${location}`);
        
        // Follow the redirect
        followRedirects(location, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
      } else {
        // We've reached the final destination or exceeded max redirects
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: data
          });
        });
      }
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.end();
  });
}

// Test the shortlink
async function testShortlink() {
  try {
    console.log('Testing shortlink redirection...');
    const result = await followRedirects('http://localhost:5173/s/WMsCoX');
    console.log('Final destination:');
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Headers: ${JSON.stringify(result.headers, null, 2)}`);
    console.log(`Data length: ${result.data.length} bytes`);
  } catch (error) {
    console.error('Error testing shortlink:', error);
  }
}

testShortlink();
