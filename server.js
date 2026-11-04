const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
  let fp = path.join('.', req.url === '/' ? '/index.html' : req.url);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(fp).slice(1);
    const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', json: 'application/json', ico: 'image/x-icon' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(data);
  });
});
server.listen(8765, '0.0.0.0', () => console.log('Servidor em http://0.0.0.0:8765'));
