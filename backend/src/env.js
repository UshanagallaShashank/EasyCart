// All environment variables the app needs, read once from here.
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'easycart_dev_secret_key_12345';

// Which database to use: "mongodb" or "supabase"
export const DB_PROVIDER = process.env.DB_PROVIDER || 'mongodb';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easycart';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
