const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/settings',
    method: 'GET',
    headers: {
        // No cookie
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    if (res.statusCode === 307 || res.statusCode === 302) {
        console.log("✅ Middleware is redirecting unauthenticated request to /settings.");
    } else if (res.statusCode === 200) {
        console.log("❌ Middleware FAILED to redirect /settings. Page is accessible without auth.");
    } else {
        console.log(`❓ Unexpected status code: ${res.statusCode}`);
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
