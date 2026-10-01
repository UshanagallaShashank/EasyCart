// HTTP handlers for platform admin stats and the user directory.
import { get_platform_stats } from '../services/platform-stats-service.js';
import { list_platform_users } from '../services/admin-user-service.js';

export async function handle_get_platform_stats(req, res, next) {
  try {
    res.status(200).json(await get_platform_stats());
  } catch (err) {
    next(err);
  }
}

export async function handle_list_platform_users(req, res, next) {
  try {
    res.status(200).json({ users: await list_platform_users() });
  } catch (err) {
    next(err);
  }
}
