const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'browser_console.log');

// Clear existing log
fs.writeFileSync(logFile, '=== BROWSER CONSOLE LOGS ===\n');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [${payload.type.toUpperCase()}] ${payload.message}\n`;
        fs.appendFileSync(logFile, logLine);
      } catch (e) {
        fs.appendFileSync(logFile, `[ERROR PARSING PAYLOAD] ${body}\n`);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Log server running on http://localhost:3000');
});
