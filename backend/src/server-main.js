// Sets up Express and starts the server.
import cors from 'cors';
import express from 'express';
import { connect_db } from './db/db.js';
import { PORT } from './env.js';
import { error_handler } from './middleware/error-handler.js';
import { auth_router } from './routes/auth-route.js';
import { health_router } from './routes/health-route.js';

export function create_express_app() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', health_router);
  app.use('/api', auth_router); //merge 14,15 lines
  app.use(error_handler);
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
