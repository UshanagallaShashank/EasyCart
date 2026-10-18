import { get_supabase } from '../../../platform/db/db.js';

const CATEGORIES_PATH = 'system/store_categories.json';

const DEFAULT_CATEGORIES = [
  'Others',
  'Grocery & Supermarket',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Home & Living / Furniture',
  'Jewelry & Accessories',
  'Books & Stationery',
  'Artisanal & Handicrafts',
  'Restaurant & Food',
  'Bakery',
  'General Retail'
];

let in_memory_categories = [...DEFAULT_CATEGORIES];

export async function get_store_categories() {
  const supabase = get_supabase();
  let categories = in_memory_categories;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from('store-request-docs').download(CATEGORIES_PATH);
      if (!error && data) {
        const parsed = JSON.parse(await data.text());
        if (Array.isArray(parsed) && parsed.length > 0) {
          categories = parsed;
        }
      }
    } catch { /* use fallback */ }
  }

  // Ensure "Others" is always present as the 1st category
  const otherCategories = categories.filter((c) => String(c).toLowerCase().trim() !== 'others' && String(c).toLowerCase().trim() !== 'other' && c !== 'General Retail / Other');
  const othersItem = categories.find((c) => String(c).toLowerCase().trim() === 'others' || String(c).toLowerCase().trim() === 'other') || 'Others';

  categories = [othersItem, ...otherCategories];
  in_memory_categories = categories;
  return categories;
}

export async function save_store_categories(categories) {
  in_memory_categories = categories;
  const supabase = get_supabase();
  if (!supabase) return categories;

  try {
    const file = Buffer.from(JSON.stringify(categories), 'utf-8');
    await supabase.storage.from('store-request-docs').upload(CATEGORIES_PATH, file, { contentType: 'application/json', upsert: true });
  } catch (err) {
    console.error('Failed to persist store categories:', err.message);
  }
  return categories;
}

export async function add_store_category(category_name) {
  const name = String(category_name || '').trim();
  if (!name) throw new Error('Category name cannot be empty');

  const current = await get_store_categories();
  const exists = current.some((c) => c.toLowerCase() === name.toLowerCase());
  if (exists) return current;

  const updated = [...current, name];
  await save_store_categories(updated);
  return updated;
}

export async function remove_store_category(category_name) {
  const name = String(category_name || '').trim();
  if (name.toLowerCase() === 'others' || name.toLowerCase() === 'other') {
    const err = new Error('"Others" is a permanent store category and cannot be deleted.');
    err.status = 400;
    throw err;
  }

  const current = await get_store_categories();
  const updated = current.filter((c) => c.toLowerCase() !== name.toLowerCase());
  await save_store_categories(updated);
  return updated;
}
