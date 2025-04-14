import dotenv from 'dotenv';
dotenv.config();

import { server } from './infrastructure/http/server';

async function start(): Promise<void> {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
    console.log('Documentation available on http://localhost:3000/documentation');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();