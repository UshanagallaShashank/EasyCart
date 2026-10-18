// One-off script to create the first platform_admin user. Run manually:
//   node scripts/seed-admin.js <email> <password> <username>
import { randomUUID } from 'node:crypto';
import { connect_db } from '../src/platform/db/db.js';
import { hash_password } from '../src/platform/shared/hash.js';
import { find_user_by_email, save_user } from '../src/modules/users/repositories/user-repository.js';

async function main() {
  const [email, password, username] = process.argv.slice(2);
  if (!email || !password || !username) {
    console.error('Usage: node scripts/seed-admin.js <email> <password> <username>');
    process.exit(1);
  }

  await connect_db();

  const existing = await find_user_by_email(email);
  if (existing) {
    console.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  const password_hash = await hash_password(password);
  await save_user({
    id: randomUUID(),
    username,
    email,
    phone_number: '0000000000',
    password_hash,
    role: 'platform_admin',
    tenant_id: null
  });

  console.log(`Created platform_admin user: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
