import { createServer } from 'node:http';
import { createMetaApiHandler } from './api.js';

const port = Number(process.env.PORT || 3001);
const handler = createMetaApiHandler();
const server = createServer((req, res) => handler(req, res, () => {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not found.' }));
}));

server.listen(port, '0.0.0.0', () => console.info(`TakeApart Meta API listening on 0.0.0.0:${port}`));
