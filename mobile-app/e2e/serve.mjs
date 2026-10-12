// Serves the exported web build for the Playwright tests. Every address falls back to index.html, like the real app.
import http from 'node:http';
import handler from 'serve-handler';

const PORT = Number(process.env.E2E_PORT ?? 8099);

http
  .createServer((req, res) => handler(req, res, { public: 'e2e/.web-build', rewrites: [{ source: '**', destination: '/index.html' }] }))
  .listen(PORT, () => process.stdout.write(`e2e web build on http://localhost:${PORT}\n`));
