import { create_user, login_user } from './auth-service.js';
import { create_platform_admin } from './admin-signup-service.js';
import { AppError } from '../../platform/shared/app-error.js';

// Store owners are created by an admin approving a store request, not by signing up with a store.
// The direct sign-up only works when ALLOW_DIRECT_STORE_SIGNUP=true, which only the automated tests turn on.
function is_direct_store_signup_allowed() {
  return process.env.ALLOW_DIRECT_STORE_SIGNUP === 'true';
}

export async function handle_signup(req, res, next) {
  try {
    if (!is_direct_store_signup_allowed()) {
      throw new AppError('Stores are created by request. Sign up as a user, then request a store.', 403);
    }
    const result = await create_user(req.body);
    res.status(201).json({ message: 'User created successfully', ...result });
  } catch (err) {
    next(err);
  }
}

export async function handle_login(req, res, next) {
  try {
    const result = await login_user(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    next(err);
  }
}

export async function handle_admin_signup(req, res, next) {
  try {
    const result = await create_platform_admin(req.body);
    res.status(201).json({ message: 'Admin created successfully', ...result });
  } catch (err) {
    next(err);
  }
}
