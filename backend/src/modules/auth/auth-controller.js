import { create_user, login_user } from './auth-service.js';
import { create_platform_admin } from './admin-signup-service.js';

export async function handle_signup(req, res, next) {
  try {
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
