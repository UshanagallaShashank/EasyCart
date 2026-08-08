// Sets up Express and starts the server.
import express from 'express';
import cors from 'cors';
import { PORT } from './env.js';
import { connect_db } from './db/db.js';
import { health_router } from './routes/health-route.js';

export function create_express_app() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', health_router);
  return app;
}

export const app = create_express_app();

export async function start_server_main() {
  await connect_db();
  app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT}\n`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start_server_main();
}
