const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/profile/testuser',
    method: 'GET',
    headers: {
        // No cookie
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    if (res.statusCode === 307 || res.statusCode === 302) {
        console.log("✅ Middleware is redirecting unauthenticated request.");
    } else if (res.statusCode === 200) {
        console.log("❌ Middleware FAILED to redirect. Page is accessible without auth.");
    } else {
        console.log(`❓ Unexpected status code: ${res.statusCode}`);
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
