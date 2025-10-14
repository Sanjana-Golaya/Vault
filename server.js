const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 4200;
const root = path.resolve(__dirname);

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf'
    };
    const contentType = map[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(root, urlPath);
  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // fallback to index.html for SPA routes
      const indexPath = path.join(root, 'index.html');
      fs.access(indexPath, fs.constants.R_OK, (ie) => {
        if (ie) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          sendFile(indexPath, res);
        }
      });
      return;
    }
    if (stats.isDirectory()) {
      sendFile(path.join(filePath, 'index.html'), res);
    } else {
      sendFile(filePath, res);
    }
  });
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}/`);
});
