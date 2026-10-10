// Removes ONLY the fake data that the automated tests created. Real accounts are never touched.
//
//   node scripts/clear-test-data.js            -> dry run: shows what would be deleted, deletes nothing
//   node scripts/clear-test-data.js --delete   -> really deletes it
//   (with npm: npm run db:clear-test-data -- --delete)
//
// A user counts as test data only when BOTH their username and email look exactly like the test generators:
//   username "owner_" + 8 characters   and   email "owner-" + a 36 character id + "@example.com"
// (the same for the prefixes cust, user, login, admin, and the short o and c used by a one-off probe).
import { get_supabase } from '../src/platform/db/db.js';
import { chunk_array } from '../src/platform/shared/chunk-array.js';
import { select_all_rows } from '../src/platform/shared/select-all-rows.js';

const TEST_PREFIXES = ['owner', 'cust', 'user', 'login', 'o', 'c'];
const ID_LENGTH = 36;
const SHORT_LENGTH = 8;
const TEST_EMAIL_END = '@example.com';
const BATCH_SIZE = 100;

function is_test_user(user) {
  return TEST_PREFIXES.some((prefix) => {
    const username_matches = user.username.startsWith(`${prefix}_`) && user.username.length === prefix.length + 1 + SHORT_LENGTH;
    const email_matches =
      user.email.startsWith(`${prefix}-`) &&
      user.email.endsWith(TEST_EMAIL_END) &&
      user.email.length === prefix.length + 1 + ID_LENGTH + TEST_EMAIL_END.length;
    return username_matches && email_matches;
  });
}

// Finds every row of a table whose column is in the list of ids.
async function find_rows(supabase, table, column, ids) {
  const rows = [];
  for (const batch of chunk_array(ids, BATCH_SIZE)) {
    const found = await select_all_rows(() => supabase.from(table).select('id').in(column, batch));
    rows.push(...found);
  }
  return rows;
}

async function delete_rows(supabase, table, column, ids) {
  for (const batch of chunk_array(ids, BATCH_SIZE)) {
    const { error } = await supabase.from(table).delete().in(column, batch);
    if (error) throw new Error(`Could not delete from ${table}: ${error.message}`);
  }
}

async function delete_storage_folders(supabase, bucket, folder_names) {
  for (const folder of folder_names) {
    const { data: files } = await supabase.storage.from(bucket).list(folder);
    if (!files || files.length === 0) continue;
    await supabase.storage.from(bucket).remove(files.map((file) => `${folder}/${file.name}`));
  }
}

async function main() {
  // npm swallows a flag typed as "npm run x --delete" and exposes it as npm_config_delete, so accept both ways.
  const should_delete = process.argv.includes('--delete') || process.env.npm_config_delete === 'true';
  const supabase = get_supabase();
  if (!supabase) {
    console.error('Supabase is not configured. Check backend/.env');
    process.exit(1);
  }

  const users = await select_all_rows(() => supabase.from('users').select('id, username, email, role'));
  const test_users = users.filter(is_test_user);
  const test_user_ids = test_users.map((user) => user.id);

  const tenants = await find_rows(supabase, 'tenants', 'owner_id', test_user_ids);
  const test_tenant_ids = tenants.map((tenant) => tenant.id);

  const found = {
    notifications: await find_rows(supabase, 'notifications', 'tenant_id', test_tenant_ids),
    orders_in_test_stores: await find_rows(supabase, 'orders', 'tenant_id', test_tenant_ids),
    orders_by_test_customers: await find_rows(supabase, 'orders', 'customer_id', test_user_ids),
    coupons: await find_rows(supabase, 'coupons', 'tenant_id', test_tenant_ids),
    products: await find_rows(supabase, 'products', 'tenant_id', test_tenant_ids),
    categories: await find_rows(supabase, 'categories', 'tenant_id', test_tenant_ids),
    stores: await find_rows(supabase, 'stores', 'tenant_id', test_tenant_ids),
    tenants,
    users: test_users
  };

  console.log(should_delete ? 'DELETING test data:' : 'DRY RUN (nothing is deleted). Test data found:');
  for (const [name, rows] of Object.entries(found)) {
    console.log(`  ${name.padEnd(26)} ${rows.length}`);
  }
  console.log(`\nReal users that will be kept: ${users.length - test_users.length}`);
  console.log('Sample test users:', test_users.slice(0, 5).map((user) => `${user.username} <${user.email}>`).join('\n                  '));

  if (!should_delete) {
    console.log('\nRun again with --delete to remove these.');
    return;
  }

  // Children first, so no row is deleted while another row still points to it.
  await delete_rows(supabase, 'notifications', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'orders', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'orders', 'customer_id', test_user_ids);
  await delete_rows(supabase, 'coupons', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'products', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'categories', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'stores', 'tenant_id', test_tenant_ids);
  await delete_rows(supabase, 'tenants', 'id', test_tenant_ids);
  await delete_rows(supabase, 'users', 'id', test_user_ids);

  // Uploaded files are kept in one folder per user.
  await delete_storage_folders(supabase, 'store-assets', test_user_ids);
  await delete_storage_folders(supabase, 'store-request-docs', test_user_ids);

  console.log('\nDone. Test data removed.');
}

main().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
