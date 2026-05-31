const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9018;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
};

const server = http.createServer((req, res) => {
    let pathname = '/';
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        pathname = decodeURIComponent(url.pathname || '/');
    } catch {
        pathname = '/';
    }

    if (pathname === '/') pathname = '/index.html';
    const relativePath = pathname.replace(/^\/+/, '');
    const filePath = path.resolve(ROOT_DIR, relativePath);
    if (!filePath.startsWith(path.resolve(ROOT_DIR))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
});
