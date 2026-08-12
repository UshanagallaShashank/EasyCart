import { create_user } from '../services/auth-service.js';

export async function handle_signup(req, res, next) {
  try {
    const result = await create_user(req.body);
    res.status(201).json({ message: 'User created successfully', ...result });
  } catch (err) {
    next(err);
  }
}
