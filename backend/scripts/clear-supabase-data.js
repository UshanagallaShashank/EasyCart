// Clears all data from all EasyCart Supabase tables and storage
import { get_supabase } from '../src/platform/db/db.js';

async function clear_all_supabase_data() {
  const supabase = get_supabase();
  if (!supabase) {
    console.error('Supabase client could not be initialized. Check backend/.env');
    process.exit(1);
  }

  console.log('Clearing Supabase data...');

  // Delete from dependent tables first to respect foreign key constraints
  const tables = [
    'notifications',
    'orders',
    'products',
    'categories',
    'coupons',
    'stores',
    'tenants',
    'users'
  ];

  for (const table of tables) {
    try {
      // In Supabase PostgREST, delete().neq('id', '') deletes all rows
      const { error } = await supabase.from(table).delete().neq('id', '');
      if (error) {
        console.warn(`Warning deleting from ${table}:`, error.message);
      } else {
        console.log(`✓ Cleared table: ${table}`);
      }
    } catch (err) {
      console.warn(`Error on ${table}:`, err?.message || err);
    }
  }

  // Also clean up uploaded assets in storage if any
  try {
    const { data: files } = await supabase.storage.from('store-assets').list();
    if (files && files.length > 0) {
      for (const item of files) {
        // If it's a folder (e.g. user ID folder), list and delete contents
        const { data: userFiles } = await supabase.storage.from('store-assets').list(item.name);
        if (userFiles && userFiles.length > 0) {
          const paths = userFiles.map((f) => `${item.name}/${f.name}`);
          await supabase.storage.from('store-assets').remove(paths);
        }
        await supabase.storage.from('store-assets').remove([item.name]);
      }
      console.log('✓ Cleared store-assets storage bucket');
    }
  } catch (err) {
    console.warn('Note on storage clearing:', err?.message || err);
  }

  console.log('All Supabase data has been cleared successfully.');
}

clear_all_supabase_data();
