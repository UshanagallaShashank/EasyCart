// Configures environment variables and exports application settings.
import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT || 5000);
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easycart';
export const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/easycart_test';
export const JWT_SECRET = process.env.JWT_SECRET || 'easycart_dev_secret_key_12345';
