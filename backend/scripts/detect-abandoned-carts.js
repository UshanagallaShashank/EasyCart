// Flags customers who haven't ordered recently from a tenant they've bought from before,
// and raises one cart_abandoned notification per flagged customer. Meant to run on a
// schedule (e.g. daily cron) — not a real-time job queue. Run manually:
//   node scripts/detect-abandoned-carts.js [days]
import { connect_db } from '../src/platform/db/db.js';
import { find_all_tenants } from '../src/modules/tenants/repositories/tenant-repository.js';
import { find_customers_with_no_recent_orders } from '../src/modules/tenant-customers/services/tenant-customer-service.js';
import { notify_cart_abandoned } from '../src/modules/notifications/services/notification-service.js';

const DEFAULT_DAYS = 7;

async function main() {
  const days = Number(process.argv[2]) || DEFAULT_DAYS;
  await connect_db();

  const tenants = await find_all_tenants();
  let flagged_count = 0;

  for (const tenant of tenants) {
    const stale_customers = await find_customers_with_no_recent_orders(tenant.id, days);
    for (const customer of stale_customers) {
      await notify_cart_abandoned(tenant.id, customer.username ?? customer.email ?? customer.customer_id);
      flagged_count += 1;
    }
  }

  console.log(`Checked ${tenants.length} tenants, flagged ${flagged_count} customer(s) with no orders in the last ${days} day(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
