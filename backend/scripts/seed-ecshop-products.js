import { get_supabase } from '../src/platform/db/db.js';
import { randomUUID } from 'node:crypto';

const TARGET_EMAIL = 'ecshop@gmail.com';

const PRODUCTS = [
  {
    name: 'Dove Beauty Moisture Bar Soap (100g)',
    description: 'Classic moisturizing cream formula with 1/4 moisturizing cream for soft, smooth, radiant skin.',
    price: 65.00,
    stock_quantity: 85,
    images: ['https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: 'Single Bar 100g', sku: 'DOVE-100G-SGL', price: 65.00, stock: 50 },
      { label: 'Pack of 3 (3x100g)', sku: 'DOVE-100G-P3', price: 180.00, stock: 35 }
    ]
  },
  {
    name: 'Fresh Organic Alphonso Mangoes (1kg)',
    description: 'Farm-fresh, naturally ripened Ratnagiri Alphonso mangoes. Rich aroma, sweet taste, and creamy texture.',
    price: 350.00,
    stock_quantity: 40,
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 kg Pack', sku: 'MNG-ALF-1KG', price: 350.00, stock: 25 },
      { label: '3 kg Box', sku: 'MNG-ALF-3KG', price: 990.00, stock: 15 }
    ]
  },
  {
    name: 'Amul Taaza Toned Milk (1L)',
    description: 'Pasteurised toned milk with 3.0% fat and 8.5% SNF. Rich in calcium and nutrients.',
    price: 54.00,
    stock_quantity: 120,
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 Litre Pouch', sku: 'AMUL-TZ-1L', price: 54.00, stock: 120 }
    ]
  },
  {
    name: 'Fortune Sunlite Refined Sunflower Oil (1L)',
    description: 'Light and healthy refined sunflower oil enriched with Vitamin A & D for everyday cooking.',
    price: 145.00,
    stock_quantity: 75,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 Litre Pouch', sku: 'FRTN-SUN-1L', price: 145.00, stock: 50 },
      { label: '5 Litre Can', sku: 'FRTN-SUN-5L', price: 699.00, stock: 25 }
    ]
  },
  {
    name: 'Aashirvaad Shuddh Chakki Atta (5kg)',
    description: '100% pure whole wheat flour ground from premium wheat grains. Makes soft and fluffy rotis.',
    price: 240.00,
    stock_quantity: 60,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '5 kg Bag', sku: 'AASH-ATTA-5KG', price: 240.00, stock: 40 },
      { label: '10 kg Bag', sku: 'AASH-ATTA-10KG', price: 465.00, stock: 20 }
    ]
  },
  {
    name: 'Tata Salt Vacuum Evaporated Iodized Salt (1kg)',
    description: 'Purity guaranteed vacuum evaporated iodized salt essential for balanced daily diet.',
    price: 28.00,
    stock_quantity: 200,
    images: ['https://images.unsplash.com/photo-1518110165385-07f91fd989aa?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 kg Pack', sku: 'TATA-SALT-1KG', price: 28.00, stock: 200 }
    ]
  },
  {
    name: 'Cadbury Dairy Milk Silk Chocolate (150g)',
    description: 'Smooth and creamy milk chocolate crafted for pure indulgence. Rich cocoa flavor.',
    price: 175.00,
    stock_quantity: 90,
    images: ['https://images.unsplash.com/photo-1582176647444-ac30b42d3c9e?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: 'Single 150g Bar', sku: 'CAD-SILK-150G', price: 175.00, stock: 60 },
      { label: 'Twin Pack 2x150g', sku: 'CAD-SILK-TWIN', price: 330.00, stock: 30 }
    ]
  },
  {
    name: 'Nescafe Classic Instant Coffee Powder (100g)',
    description: '100% pure natural coffee beans roasted to perfection. Delivers rich and aromatic coffee flavor.',
    price: 320.00,
    stock_quantity: 50,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '100g Jar', sku: 'NES-CLAS-100G', price: 320.00, stock: 35 },
      { label: '200g Jar', sku: 'NES-CLAS-200G', price: 599.00, stock: 15 }
    ]
  },
  {
    name: 'Taj Mahal Tea Premium Leaf Granules (500g)',
    description: 'Fine tea leaves blended for strong taste, rich color, and refreshing flavor.',
    price: 380.00,
    stock_quantity: 45,
    images: ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '500g Pack', sku: 'TAJ-TEA-500G', price: 380.00, stock: 30 },
      { label: '1kg Pack', sku: 'TAJ-TEA-1KG', price: 720.00, stock: 15 }
    ]
  },
  {
    name: 'Lays India\'s Magic Masala Potato Chips (52g)',
    description: 'Crispy sliced potato chips coated with authentic Indian spices and herbs.',
    price: 20.00,
    stock_quantity: 150,
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '52g Pack', sku: 'LAYS-MASALA-52G', price: 20.00, stock: 150 }
    ]
  },
  {
    name: 'Dettol Antiseptic Liquid (250ml)',
    description: 'Trusted germ protection formula for personal hygiene, wound cleaning, and household disinfection.',
    price: 135.00,
    stock_quantity: 65,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '250ml Bottle', sku: 'DET-ANT-250ML', price: 135.00, stock: 45 },
      { label: '500ml Bottle', sku: 'DET-ANT-500ML', price: 245.00, stock: 20 }
    ]
  },
  {
    name: 'Colgate MaxFresh Red Gel Toothpaste (150g)',
    description: 'Infused with cooling crystals for intense freshness and cavity protection.',
    price: 110.00,
    stock_quantity: 80,
    images: ['https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '150g Tube', sku: 'COLG-MAX-150G', price: 110.00, stock: 80 }
    ]
  },
  {
    name: 'Head & Shoulders Smooth & Silky Shampoo (340ml)',
    description: 'Anti-dandruff shampoo that tames frizz for smooth, shiny, and flake-free hair.',
    price: 285.00,
    stock_quantity: 55,
    images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '340ml Bottle', sku: 'HS-SHAMP-340ML', price: 285.00, stock: 35 },
      { label: '650ml Pump Bottle', sku: 'HS-SHAMP-650ML', price: 499.00, stock: 20 }
    ]
  },
  {
    name: 'Nivea Soft Refreshing Moisturiser Cream (100ml)',
    description: 'Light non-greasy moisturizing cream with Vitamin E & Jojoba Oil for soft skin.',
    price: 199.00,
    stock_quantity: 70,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '100ml Tub', sku: 'NIV-SOFT-100ML', price: 199.00, stock: 70 }
    ]
  },
  {
    name: 'Surf Excel Easy Wash Detergent Powder (1kg)',
    description: 'Superior stain removal technology for clean and bright clothes in a single wash.',
    price: 140.00,
    stock_quantity: 60,
    images: ['https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 kg Pack', sku: 'SURF-EASY-1KG', price: 140.00, stock: 40 },
      { label: '3 kg Pack', sku: 'SURF-EASY-3KG', price: 399.00, stock: 20 }
    ]
  },
  {
    name: 'Vim Dishwash Liquid Lemon Gel (500ml)',
    description: 'Concentrated dishwashing gel with real lemon juice. Removes tough grease easily.',
    price: 125.00,
    stock_quantity: 85,
    images: ['https://images.unsplash.com/photo-1603533867307-b354255e3c30?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '500ml Bottle', sku: 'VIM-GEL-500ML', price: 125.00, stock: 85 }
    ]
  },
  {
    name: 'Lizol Disinfectant Surface Cleaner Citrus (1L)',
    description: 'Kills 99.9% germs, removes tough stains, and leaves a pleasant citrus scent.',
    price: 215.00,
    stock_quantity: 50,
    images: ['https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 Litre Bottle', sku: 'LIZOL-CIT-1L', price: 215.00, stock: 50 }
    ]
  },
  {
    name: 'Britannia Good Day Cashew Cookies (200g)',
    description: 'Deliciously crunchy butter cookies filled with real cashew nuts for tea time.',
    price: 45.00,
    stock_quantity: 110,
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '200g Pack', sku: 'BRIT-GD-200G', price: 45.00, stock: 110 }
    ]
  },
  {
    name: 'Real Fruit Power Mixed Fruit Juice (1L)',
    description: '100% real fruit juice blend with rich vitamins and natural fruit energy.',
    price: 115.00,
    stock_quantity: 65,
    images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '1 Litre Tetra Pack', sku: 'REAL-MIX-1L', price: 115.00, stock: 65 }
    ]
  },
  {
    name: 'Nutella Hazelnut Spread with Cocoa (350g)',
    description: 'Original creamy hazelnut cocoa spread made with roasted hazelnuts and skimmed milk.',
    price: 399.00,
    stock_quantity: 45,
    images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80'],
    variants: [
      { label: '350g Jar', sku: 'NUT-SPREAD-350G', price: 399.00, stock: 30 },
      { label: '750g Family Jar', sku: 'NUT-SPREAD-750G', price: 799.00, stock: 15 }
    ]
  }
];

async function seed() {
  const supabase = get_supabase();
  if (!supabase) {
    console.error('Supabase client not initialized');
    process.exit(1);
  }

  console.log(`Searching for user/tenant associated with "${TARGET_EMAIL}"...`);

  // 1. Find user by email
  let { data: user } = await supabase.from('users').select('*').eq('email', TARGET_EMAIL).maybeSingle();
  let tenantId = user?.tenant_id;

  if (!tenantId) {
    // 2. Check stores table directly
    const { data: storeByEmail } = await supabase.from('stores').select('*').ilike('name', '%easycart%').maybeSingle();
    if (storeByEmail) {
      tenantId = storeByEmail.tenant_id;
    }
  }

  if (!tenantId) {
    // 3. Fallback: check any store with slug easycart
    const { data: storeBySlug } = await supabase.from('stores').select('*').eq('slug', 'easycart').maybeSingle();
    if (storeBySlug) {
      tenantId = storeBySlug.tenant_id;
    }
  }

  if (!tenantId) {
    console.log(`User/tenant for "${TARGET_EMAIL}" not found. Creating tenant and user...`);
    const newUserId = randomUUID();
    tenantId = randomUUID();

    const { data: newUser, error: userError } = await supabase.from('users').insert([{
      id: newUserId,
      username: 'EasyCart Store Owner',
      email: TARGET_EMAIL,
      phone_number: '9876543210',
      password_hash: '$2b$10$e8p2u7sU00/X.G6tUq4X3.1.ZzK8/2g5q8W2Zz.ZzK8/2g5q8W2Zz',
      role: 'store_owner',
      tenant_id: tenantId,
      created_at: new Date().toISOString()
    }]).select().single();

    if (userError) {
      console.error('Failed to create user:', userError.message);
      process.exit(1);
    }
    user = newUser;

    // Create Tenant
    await supabase.from('tenants').insert([{
      id: tenantId,
      name: 'EasyCart Store',
      slug: 'easycart',
      owner_id: newUserId,
      status: 'active',
      created_at: new Date().toISOString()
    }]);

    // Create Store
    await supabase.from('stores').insert([{
      id: randomUUID(),
      tenant_id: tenantId,
      name: 'EasyCart Superstore',
      slug: 'easycart',
      is_published: true,
      description: 'Your one-stop shop for fresh groceries, daily essentials, personal care, and household items.',
      created_at: new Date().toISOString()
    }]);

    console.log(`Created store & tenant (${tenantId}) for "${TARGET_EMAIL}".`);
  } else {
    console.log(`Found tenant (${tenantId}) for "${TARGET_EMAIL}".`);
  }

  // Ensure store exists and is published
  const { data: existingStore } = await supabase.from('stores').select('*').eq('tenant_id', tenantId).maybeSingle();
  if (!existingStore) {
    await supabase.from('stores').insert([{
      id: randomUUID(),
      tenant_id: tenantId,
      name: 'EasyCart Superstore',
      slug: 'easycart',
      is_published: true,
      description: 'Your one-stop shop for fresh groceries, daily essentials, personal care, and household items.',
      created_at: new Date().toISOString()
    }]);
    console.log('Created store entity for tenant.');
  } else if (!existingStore.is_published) {
    await supabase.from('stores').update({ is_published: true }).eq('id', existingStore.id);
    console.log('Set store status to published.');
  }

  // Remove old products for this tenant to ensure clean set of 20 products
  console.log(`Clearing old products for tenant ${tenantId}...`);
  await supabase.from('products').delete().eq('tenant_id', tenantId);

  console.log(`Inserting ${PRODUCTS.length} new products for EasyCart store...`);
  const now = new Date().toISOString();

  for (const prod of PRODUCTS) {
    const sku = prod.variants[0]?.sku || `EC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const productPayload = {
      id: randomUUID(),
      tenant_id: tenantId,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      sku: sku,
      stock_quantity: prod.stock_quantity,
      low_stock_threshold: 5,
      is_active: true,
      images: prod.images,
      variants: prod.variants,
      created_at: now,
      updated_at: now
    };

    const { error: insertError } = await supabase.from('products').insert([productPayload]);
    if (insertError) {
      console.error(`Failed to insert product "${prod.name}":`, insertError.message);
    } else {
      console.log(`+ Added "${prod.name}" (Rs. ${prod.price})`);
    }
  }

  console.log(`\nSuccessfully seeded ${PRODUCTS.length} products for EasyCart store (${TARGET_EMAIL})!`);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
