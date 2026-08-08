// Manages MongoDB database connection using Mongoose.
import mongoose from 'mongoose';
import { MONGODB_URI, MONGODB_TEST_URI } from '../config/env-config.js';

export async function connect_mongodb_database(is_test_env = false) {
  const target_uri = is_test_env ? MONGODB_TEST_URI : MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(target_uri);
  }
}

export async function disconnect_mongodb_database() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
