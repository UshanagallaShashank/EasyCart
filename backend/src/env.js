// All environment variables the app needs, read once from here.
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const DEV_JWT_SECRET = 'easycart_dev_secret_key_12345';
export const JWT_SECRET = process.env.JWT_SECRET || DEV_JWT_SECRET;

// Which database to use: "mongodb" or "supabase"
export const DB_PROVIDER = process.env.DB_PROVIDER || 'mongodb';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easycart';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Passcode required to create a platform admin via POST /api/admin/register. Empty disables admin sign-up.
export function get_admin_signup_passcode() {
  return process.env.ADMIN_SIGNUP_PASSCODE || '';
}

// Websites allowed to call this API from a browser, e.g. "https://shop.example.com,https://admin.example.com".
// Empty means "anyone" (fine for local development, refused in production).
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin !== '');

// How many proxies sit in front of the server (hosting platforms use 1). Needed so rate limits see the real visitor address.
export const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY || (IS_PRODUCTION ? 1 : 0));

// Returns a list of settings that are unsafe or missing for a production run. Empty list means good to go.
export function find_production_env_problems(env = process.env) {
  const problems = [];
  const jwt_secret = env.JWT_SECRET || '';
  const db_provider = env.DB_PROVIDER || 'mongodb';

  if (jwt_secret === '' || jwt_secret === DEV_JWT_SECRET) {
    problems.push('JWT_SECRET must be set to your own secret (not the built-in development one)');
  } else if (jwt_secret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters long');
  }

  if (!env.CORS_ORIGIN) {
    problems.push('CORS_ORIGIN must list the website address(es) allowed to use this API');
  }

  if (db_provider === 'supabase' && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
    problems.push('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set when DB_PROVIDER=supabase');
  }
  if (db_provider === 'mongodb' && !env.MONGODB_URI) {
    problems.push('MONGODB_URI must be set when DB_PROVIDER=mongodb');
  }

  return problems;
}

// Stops the server from starting in production with unsafe settings.
export function assert_production_env(env = process.env) {
  const problems = find_production_env_problems(env);
  if (problems.length === 0) return;
  throw new Error(`Cannot start in production:\n - ${problems.join('\n - ')}`);
}
