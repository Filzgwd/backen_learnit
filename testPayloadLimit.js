const http = require('http');

// Test 1: Simple JSON payload
const testData = JSON.stringify({
  title: 'Test Material',
  description: 'Testing payload limit',
  category_id: 1,
});

console.log('Testing material creation API...');
console.log('Payload size:', Buffer.byteLength(testData), 'bytes');

const options = {
  hostname: 'backenlearnit-production.up.railway.app',
  port: 443,
  path: '/api/materials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
    'Authorization': 'Bearer test-token'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(testData);
req.end();
