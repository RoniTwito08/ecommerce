'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Catalogue Data ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Books', slug: 'books' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
  { name: 'Beauty & Health', slug: 'beauty-health' },
];

const img = (text, bg = '1a1a2e') =>
  `https://placehold.co/800x600/${bg}/ffffff?font=montserrat&text=${encodeURIComponent(text.replace(/\+/g, ' '))}`;

const PRODUCTS = [
  // ── Electronics ───────────────────────────────────────────────────────────
  {
    categorySlug: 'electronics',
    name: 'Wireless Noise-Cancelling Headphones',
    description:
      'Experience crystal-clear audio with premium over-ear headphones featuring active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cups. Perfect for work, travel, and audiophiles.',
    price: '299.99',
    stockQuantity: 45,
    images: [
      { imageUrl: img('Headphones'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Headphones+Side', '2d2d44'), isPrimary: false, sortOrder: 1 },
      { imageUrl: img('Headphones+Case', '1f1f35'), isPrimary: false, sortOrder: 2 },
    ],
  },
  {
    categorySlug: 'electronics',
    name: 'Smart Watch Pro',
    description:
      'Track fitness goals, receive notifications, and monitor your health with this sleek smartwatch. Features GPS, heart rate monitoring, sleep tracking, and a 5-day battery life in a premium stainless steel case.',
    price: '249.99',
    stockQuantity: 60,
    images: [
      { imageUrl: img('Smart+Watch'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Watch+Face', '2d2d44'), isPrimary: false, sortOrder: 1 },
      { imageUrl: img('Watch+Band', '1f1f35'), isPrimary: false, sortOrder: 2 },
    ],
  },
  {
    categorySlug: 'electronics',
    name: 'Portable Bluetooth Speaker',
    description:
      'Powerful 360° surround sound in a compact, waterproof (IPX7) design. With 20 hours of playtime it is the perfect companion for outdoor adventures, beach trips, and backyard gatherings.',
    price: '89.99',
    stockQuantity: 120,
    images: [
      { imageUrl: img('BT+Speaker'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Speaker+Outdoor', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'electronics',
    name: 'Ergonomic Laptop Stand',
    description:
      'Adjustable aluminium laptop stand with six height settings designed to reduce neck strain and improve posture. Compatible with laptops from 10 to 17 inches. Folds flat for easy storage.',
    price: '49.99',
    stockQuantity: 200,
    images: [
      { imageUrl: img('Laptop+Stand'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Stand+Folded', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    categorySlug: 'clothing',
    name: 'Premium Organic Cotton T-Shirt',
    description:
      'Made from 100% organic pima cotton, this classic crewneck t-shirt delivers exceptional softness and durability. Pre-shrunk, reinforced stitching, available in 12 colours.',
    price: '34.99',
    stockQuantity: 300,
    images: [
      { imageUrl: img('Cotton+Tee'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Tee+Detail', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'clothing',
    name: 'Classic Denim Jacket',
    description:
      'Timeless denim jacket crafted from heavyweight cotton denim with a relaxed fit. Button closure, two chest pockets, two side pockets. A wardrobe staple that never goes out of style.',
    price: '89.99',
    stockQuantity: 80,
    images: [
      { imageUrl: img('Denim+Jacket'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Jacket+Back', '2d2d44'), isPrimary: false, sortOrder: 1 },
      { imageUrl: img('Jacket+Detail', '1f1f35'), isPrimary: false, sortOrder: 2 },
    ],
  },
  {
    categorySlug: 'clothing',
    name: 'Performance Running Shorts',
    description:
      'Ultra-lightweight running shorts with built-in liner and reflective details. Moisture-wicking quick-dry fabric, comfortable elastic waistband, and a rear zip pocket.',
    price: '44.99',
    stockQuantity: 150,
    images: [
      { imageUrl: img('Running+Shorts'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Shorts+Pocket', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'clothing',
    name: 'Genuine Leather Dress Belt',
    description:
      'Hand-crafted full-grain leather belt with a brushed nickel buckle. The finishing touch for business or smart-casual attire. Available in sizes 28 to 48.',
    price: '59.99',
    stockQuantity: 90,
    images: [
      { imageUrl: img('Leather+Belt'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Belt+Buckle', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  // ── Books ─────────────────────────────────────────────────────────────────
  {
    categorySlug: 'books',
    name: 'Clean Code',
    description:
      'A handbook of agile software craftsmanship by Robert C. Martin. Learn to write clean, maintainable code. Covers naming, functions, comments, formatting, error handling, and more.',
    price: '39.99',
    stockQuantity: 75,
    images: [
      { imageUrl: img('Clean+Code'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Book+Pages', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'books',
    name: 'Design Patterns',
    description:
      'The classic Gang of Four reference on software design patterns. An essential guide introducing 23 patterns that solve common object-oriented design problems with elegance.',
    price: '49.99',
    stockQuantity: 60,
    images: [
      { imageUrl: img('Design+Patterns'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Patterns+Inside', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'books',
    name: 'Atomic Habits',
    description:
      'An easy and proven way to build good habits and break bad ones by James Clear. Backed by science, this guide reveals how tiny 1% improvements compound into extraordinary results.',
    price: '27.99',
    stockQuantity: 100,
    images: [
      { imageUrl: img('Atomic+Habits'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Book+Detail', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  // ── Home & Kitchen ────────────────────────────────────────────────────────
  {
    categorySlug: 'home-kitchen',
    name: 'French Press Coffee Maker',
    description:
      'Brew a rich, full-bodied coffee with this double-walled stainless steel French press. Keeps coffee hot for an hour. 34 oz capacity for 4 to 5 cups.',
    price: '59.99',
    stockQuantity: 85,
    images: [
      { imageUrl: img('French+Press'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Coffee+Pour', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'home-kitchen',
    name: 'Bamboo Cutting Board Set',
    description:
      'Set of 3 premium bamboo boards in graduated sizes. Naturally antimicrobial, gentle on knife edges, with built-in juice grooves and easy-grip handles. Dishwasher safe.',
    price: '44.99',
    stockQuantity: 110,
    images: [
      { imageUrl: img('Cutting+Board'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Board+Set', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'home-kitchen',
    name: 'Ceramic Mug Set (4-Pack)',
    description:
      'Elegant stoneware mugs with a matte finish and comfortable handle. Each mug holds 14 oz and is microwave and dishwasher safe. Four complementary earth-tone colours.',
    price: '36.99',
    stockQuantity: 140,
    images: [
      { imageUrl: img('Ceramic+Mugs'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Mug+Texture', '2d2d44'), isPrimary: false, sortOrder: 1 },
      { imageUrl: img('Mugs+Colours', '1f1f35'), isPrimary: false, sortOrder: 2 },
    ],
  },
  {
    categorySlug: 'home-kitchen',
    name: 'Pre-Seasoned Cast Iron Skillet',
    description:
      'A 12-inch cast iron skillet with superior heat retention and even distribution. Ideal for searing, baking, broiling, and frying. Compatible with all cooktops including induction.',
    price: '69.99',
    stockQuantity: 55,
    images: [
      { imageUrl: img('Cast+Iron'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Skillet+In+Use', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  // ── Sports & Outdoors ─────────────────────────────────────────────────────
  {
    categorySlug: 'sports-outdoors',
    name: 'Premium Yoga Mat',
    description:
      'Extra-thick 6mm non-slip mat made from eco-friendly natural rubber. Features alignment lines, excellent grip when wet, and includes a carrying strap. 72 × 24 inches.',
    price: '79.99',
    stockQuantity: 95,
    images: [
      { imageUrl: img('Yoga+Mat'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Mat+Detail', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'sports-outdoors',
    name: 'Insulated Stainless Water Bottle',
    description:
      'Double-wall vacuum insulation keeps drinks cold 24 hours, hot 12 hours. 32 oz capacity, leak-proof lid, wide mouth for easy filling and cleaning.',
    price: '34.99',
    stockQuantity: 180,
    images: [
      { imageUrl: img('Water+Bottle'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Bottle+Lid', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'sports-outdoors',
    name: 'Speed Jump Rope',
    description:
      'Professional-grade speed rope with adjustable cable length (up to 11 ft) and ergonomic ball-bearing handles for smooth, fast rotation. Great for CrossFit, cardio, and boxing.',
    price: '24.99',
    stockQuantity: 220,
    images: [
      { imageUrl: img('Jump+Rope'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Rope+Handle', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  // ── Beauty & Health ───────────────────────────────────────────────────────
  {
    categorySlug: 'beauty-health',
    name: 'Natural Hydrating Face Moisturiser',
    description:
      'Lightweight daily moisturiser with hyaluronic acid, aloe vera, and vitamin E. Provides 24-hour hydration without clogging pores. All skin types, fragrance-free, dermatologist tested.',
    price: '42.99',
    stockQuantity: 130,
    images: [
      { imageUrl: img('Face+Moisturiser'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Moisturiser+Texture', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
  {
    categorySlug: 'beauty-health',
    name: 'Vitamin C Brightening Serum',
    description:
      'Potent 20% vitamin C serum enhanced with vitamin E and ferulic acid to brighten skin tone, reduce dark spots, and boost collagen. Lightweight formula, absorbs quickly, no residue.',
    price: '54.99',
    stockQuantity: 100,
    images: [
      { imageUrl: img('Vitamin+C+Serum'), isPrimary: true, sortOrder: 0 },
      { imageUrl: img('Serum+Dropper', '2d2d44'), isPrimary: false, sortOrder: 1 },
    ],
  },
];

// ─── Seed Runner ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Categories – upsert so re-runs are idempotent
  console.log('📁 Seeding categories...');
  const categoryMap = {};

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap[cat.slug] = category.id;
    console.log(`   ✓ ${cat.name}`);
  }

  // Products – skip existing by name to allow partial re-seeds
  console.log('\n📦 Seeding products...');

  for (const product of PRODUCTS) {
    const { categorySlug, images, price, ...rest } = product;

    const exists = await prisma.product.findFirst({ where: { name: rest.name } });

    if (exists) {
      console.log(`   ~ Skipped (exists): ${rest.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        ...rest,
        price,
        categoryId: categoryMap[categorySlug],
        images: { create: images },
      },
    });
    console.log(`   ✓ ${rest.name}`);
  }

  console.log('\n✅ Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
