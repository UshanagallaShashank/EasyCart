import { register_customer, login_customer } from './customer-service.js';

export async function handle_customer_signup(req, res, next) {
  try {
    const result = await register_customer(req.body);
    res.status(201).json({ message: 'Customer created successfully', ...result });
  } catch (err) {
    next(err);
  }
}

export async function handle_customer_login(req, res, next) {
  try {
    const result = await login_customer(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    next(err);
  }
}
