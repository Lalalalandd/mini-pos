import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import * as schema from './schema';

dotenv.config({ path: '../../.env' });

async function main() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://pos_admin:pos_secret_password@localhost:5432/mini_pos_db';

  console.log('Connecting to database:', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding initial data...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const seededUsers = await db
    .insert(schema.users)
    .values([
      {
        name: 'System Administrator',
        email: 'admin@minipos.local',
        passwordHash,
        role: 'ADMIN',
      },
      {
        name: 'Cashier Terminal 1',
        email: 'cashier@minipos.local',
        passwordHash,
        role: 'CASHIER',
      },
      {
        name: 'John Customer',
        email: 'customer@minipos.local',
        passwordHash,
        role: 'CUSTOMER',
      },
    ])
    .onConflictDoNothing({ target: schema.users.email })
    .returning();

  console.log(`Users seeded: ${seededUsers.length}`);

  // 2. Seed Categories
  const seededCategories = await db
    .insert(schema.categories)
    .values([
      {
        name: 'Beverages & Coffee',
        slug: 'beverages-coffee',
        description: 'Specialty coffee, teas, cold brews, and artisan drinks',
      },
      {
        name: 'Bakery & Pastries',
        slug: 'bakery-pastries',
        description: 'Freshly baked croissants, sourdough breads, and sweet treats',
      },
      {
        name: 'Main Dishes & Meals',
        slug: 'main-dishes-meals',
        description: 'Nutritious meals, artisanal sandwiches, and quick bites',
      },
      {
        name: 'Snacks & Confectionery',
        slug: 'snacks-confectionery',
        description: 'Organic cookies, trail mixes, and chips',
      },
    ])
    .onConflictDoNothing({ target: schema.categories.slug })
    .returning();

  console.log(`Categories seeded: ${seededCategories.length}`);

  // 3. Seed Products if categories exist
  const existingCategories = await db.select().from(schema.categories);
  if (existingCategories.length > 0) {
    const bevCat = existingCategories.find((c) => c.slug === 'beverages-coffee') || existingCategories[0];
    const bakeryCat = existingCategories.find((c) => c.slug === 'bakery-pastries') || existingCategories[0];
    const mealsCat = existingCategories.find((c) => c.slug === 'main-dishes-meals') || existingCategories[0];

    await db
      .insert(schema.products)
      .values([
        {
          name: 'Single Origin Espresso',
          sku: 'BEV-ESP-001',
          barcode: '899100100001',
          description: 'Double shot rich Ethiopian Yirgacheffe espresso',
          price: '28000.00',
          costPrice: '12000.00',
          stock: 120,
          minStockAlert: 15,
          categoryId: bevCat.id,
          status: 'ACTIVE',
        },
        {
          name: 'Iced Oat Caramel Macchiato',
          sku: 'BEV-MAC-002',
          barcode: '899100100002',
          description: 'Creamy oat milk layered with rich espresso and house vanilla-caramel syrup',
          price: '38000.00',
          costPrice: '18000.00',
          stock: 85,
          minStockAlert: 10,
          categoryId: bevCat.id,
          status: 'ACTIVE',
        },
        {
          name: 'Butter Croissant Premium',
          sku: 'BAK-CRS-001',
          barcode: '899100100003',
          description: 'Flaky, golden French butter croissant baked fresh every morning',
          price: '24000.00',
          costPrice: '10000.00',
          stock: 45,
          minStockAlert: 8,
          categoryId: bakeryCat.id,
          status: 'ACTIVE',
        },
        {
          name: 'Smoked Beef Brioche Sandwich',
          sku: 'MEA-SND-001',
          barcode: '899100100004',
          description: 'Smoked beef brisket, cheddar melt, arugula, and honey mustard in brioche bun',
          price: '48000.00',
          costPrice: '25000.00',
          stock: 30,
          minStockAlert: 5,
          categoryId: mealsCat.id,
          status: 'ACTIVE',
        },
        {
          name: 'Matcha Green Tea Latte',
          sku: 'BEV-MTC-003',
          barcode: '899100100005',
          description: 'Authentic Uji ceremonial matcha whisked with velvety steamed milk',
          price: '35000.00',
          costPrice: '16000.00',
          stock: 90,
          minStockAlert: 10,
          categoryId: bevCat.id,
          status: 'ACTIVE',
        },
      ])
      .onConflictDoNothing({ target: schema.products.sku });

    console.log('Sample products seeded successfully.');
  }

  console.log('Database seeding complete!');
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
