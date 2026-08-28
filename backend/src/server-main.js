// Sets up Express and starts the server.
import cors from 'cors';
import express from 'express';
import { connect_db } from './platform/db/db.js';
import { PORT } from './env.js';
import { error_handler } from './platform/shared/error-handler.js';
import { auth_router } from './modules/auth/auth-route.js';
import { health_router } from './platform/health/health-route.js';
import { store_router } from './modules/stores/routes/store-route.js';
import { category_router } from './modules/categories/routes/category-route.js';
import { product_router } from './modules/products/routes/product-route.js';

export function create_express_app() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', health_router);
  app.use('/api', auth_router);
  app.use('/api', store_router);
  app.use('/api', category_router);
  app.use('/api', product_router);
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
