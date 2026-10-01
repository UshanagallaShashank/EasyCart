import { register_customer, login_customer, request_store_creation, get_customer_store_request } from './customer-service.js';

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

export async function handle_request_store(req, res, next) {
  try {
    const request = await request_store_creation(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Store request submitted successfully', request });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_my_store_request(req, res, next) {
  try {
    const request = await get_customer_store_request(req.user.id);
    res.status(200).json({ request });
  } catch (err) {
    next(err);
  }
}
