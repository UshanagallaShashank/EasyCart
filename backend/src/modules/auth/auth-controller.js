import { create_user, login_user, get_current_profile, update_current_profile } from './auth-service.js';
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

export async function handle_get_profile(req, res, next) {
  try {
    const user = await get_current_profile(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_profile(req, res, next) {
  try {
    const user = await update_current_profile(req.user.id, req.body);
    res.status(200).json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function handle_upload_avatar(req, res, next) {
  try {
    const { file } = req.body;
    if (!file) throw new AppError('Image file data is required', 400);
    const { upload_store_asset_to_supabase } = await import('../stores/services/store-storage-service.js');
    const result = await upload_store_asset_to_supabase({
      user_id: req.user.id,
      file,
      type: 'avatar'
    });
    const user = await update_current_profile(req.user.id, { avatar_url: result.url });
    if (req.user?.role === 'delivery_partner') {
      try {
        const { find_rider_by_user_id, update_rider } = await import('../delivery/repositories/rider-repository.js');
        const rider = await find_rider_by_user_id(req.user.id);
        if (rider) {
          const documents = { ...(rider.documents ?? {}) };
          documents.partner_photo = result.url;
          await update_rider(rider.id, { documents });
        }
      } catch (_) {}
    }
    res.status(200).json({ url: result.url, user, message: 'Avatar uploaded successfully' });
  } catch (err) {
    next(err);
  }
}

