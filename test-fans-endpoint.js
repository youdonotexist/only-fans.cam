// Script to test the /fans endpoint
const http = require('http');

function testFansEndpoint() {
  console.log('Making request to http://localhost:3000/fans...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/fans',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('Response received successfully:');
        console.log(JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.error('Error parsing JSON:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error making request:', error.message);
  });

  req.end();
}

// Execute the test function
testFansEndpoint();
