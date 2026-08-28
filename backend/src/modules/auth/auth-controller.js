import { create_user, login_user } from './auth-service.js';

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
