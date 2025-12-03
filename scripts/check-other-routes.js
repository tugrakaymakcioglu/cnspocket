const http = require('http');

function checkPath(path) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {}
    };

    const req = http.request(options, (res) => {
        console.log(`Checking ${path} - STATUS: ${res.statusCode}`);
        if (res.statusCode === 307 || res.statusCode === 302) {
            console.log(`✅ ${path} is protected (Redirects).`);
        } else if (res.statusCode === 200) {
            console.log(`⚠️ ${path} is accessible (Status 200).`);
        } else {
            console.log(`❓ ${path} returned status ${res.statusCode}`);
        }
    });
    req.end();
}

checkPath('/admin');
checkPath('/contact');
