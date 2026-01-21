import { createServer } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';
import handler from './server/entry.preview.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = createServer((req, res) => {
  // Trust proxy headers
  if (req.headers['x-forwarded-proto'] === 'https') {
    req.connection.encrypted = true;
  }
  
  handler(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}/`);
});
