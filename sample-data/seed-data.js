/**
 * MongoDB Atlas Database Seeder
 * Seeds the E-Commerce database with sample data
 *
 * Run with: node seed-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database and Collection names
const DATABASE_NAME = 'ecommerce';
const COLLECTIONS = {
  users: 'users',
  categories: 'categories',
  products: 'products',
  coupons: 'coupons',
  orders: 'orders',
  reviews: 'reviews',
  addresses: 'addresses',
};

// MongoDB Atlas Connection String
const MONGODB_URI =
  'mongodb+srv://admin:admin@cluster0.wei5wdz.mongodb.net/ecommerce?appName=Cluster0';

// Read JSON file and parse MongoDB extended JSON format
function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Convert MongoDB extended JSON format to regular objects
  return data.map((item) => {
    const converted = {};
    for (const [key, value] of Object.entries(item)) {
      if (value && typeof value === 'object') {
        if (value.$oid) {
          // Convert $oid to proper MongoDB ObjectId
          converted[key] = new ObjectId(value.$oid);
        } else if (value.$date) {
          converted[key] = new Date(value.$date);
        } else if (Array.isArray(value)) {
          converted[key] = value.map((v) => {
            if (v && typeof v === 'object' && v.$oid) {
              return new ObjectId(v.$oid);
            }
            return v;
          });
        } else {
          converted[key] = convertNestedObject(value);
        }
      } else {
        converted[key] = value;
      }
    }
    return converted;
  });
}

// Convert nested objects with MongoDB extended JSON
function convertNestedObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj.$oid) {
    return new ObjectId(obj.$oid);
  }

  if (obj.$date) {
    return new Date(obj.$date);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertNestedObject(item));
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertNestedObject(value);
  }
  return converted;
}

async function seedDatabase() {
  let client;

  try {
    console.log('Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB Atlas\n');

    const db = client.db(DATABASE_NAME);

    // Drop existing collections (optional - for clean seed)
    console.log('🗑️  Dropping existing collections...');
    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        await db.collection(collectionName).drop();
        console.log(`   Dropped: ${collectionName}`);
      } catch (err) {
        if (err.code !== 26) {
          // 26 = NamespaceNotFound
          console.log(`   Skipped: ${collectionName} (not found)`);
        }
      }
    }

    // Seed Users
    console.log('📦 Seeding collections...\n');

    const users = readJsonFile('users.json');
    await db.collection(COLLECTIONS.users).insertMany(users);
    console.log(`Users: ${users.length} documents inserted`);

    // Seed Categories
    const categories = readJsonFile('categories.json');
    await db.collection(COLLECTIONS.categories).insertMany(categories);
    console.log(`Categories: ${categories.length} documents inserted`);

    // Seed Products
    const products = readJsonFile('products.json');
    await db.collection(COLLECTIONS.products).insertMany(products);
    console.log(`Products: ${products.length} documents inserted`);

    // Seed Coupons
    const coupons = readJsonFile('coupons.json');
    await db.collection(COLLECTIONS.coupons).insertMany(coupons);
    console.log(`Coupons: ${coupons.length} documents inserted`);

    // Seed Orders
    const orders = readJsonFile('orders.json');
    await db.collection(COLLECTIONS.orders).insertMany(orders);
    console.log(`Orders: ${orders.length} documents inserted`);

    // Seed Reviews
    const reviews = readJsonFile('reviews.json');
    await db.collection(COLLECTIONS.reviews).insertMany(reviews);
    console.log(`Reviews: ${reviews.length} documents inserted`);

    // Seed Addresses
    const addresses = readJsonFile('addresses.json');
    await db.collection(COLLECTIONS.addresses).insertMany(addresses);
    console.log(`Addresses: ${addresses.length} documents inserted`);

    // Create indexes for better performance
    console.log('\nCreating indexes...');

    // Users indexes
    await db.collection(COLLECTIONS.users).createIndex({ email: 1 }, { unique: true });
    await db.collection(COLLECTIONS.users).createIndex({ role: 1 });
    console.log('Users indexes created');

    // Categories indexes
    await db.collection(COLLECTIONS.categories).createIndex({ slug: 1 }, { unique: true });
    await db.collection(COLLECTIONS.categories).createIndex({ isActive: 1 });
    console.log('Categories indexes created');

    // Products indexes
    await db.collection(COLLECTIONS.products).createIndex({ sellerId: 1 });
    await db.collection(COLLECTIONS.products).createIndex({ category: 1 });
    await db.collection(COLLECTIONS.products).createIndex({ isActive: 1 });
    await db.collection(COLLECTIONS.products).createIndex({ name: 'text', description: 'text' });
    console.log('Products indexes created');

    // Coupons indexes
    await db.collection(COLLECTIONS.coupons).createIndex({ code: 1 }, { unique: true });
    await db.collection(COLLECTIONS.coupons).createIndex({ isActive: 1 });
    console.log('Coupons indexes created');

    // Orders indexes
    await db.collection(COLLECTIONS.orders).createIndex({ customerId: 1 });
    await db.collection(COLLECTIONS.orders).createIndex({ sellerId: 1 });
    await db.collection(COLLECTIONS.orders).createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection(COLLECTIONS.orders).createIndex({ orderStatus: 1 });
    console.log('Orders indexes created');

    // Reviews indexes
    await db.collection(COLLECTIONS.reviews).createIndex({ productId: 1 });
    await db.collection(COLLECTIONS.reviews).createIndex({ userId: 1 });
    console.log('Reviews indexes created');

    // Addresses indexes
    await db.collection(COLLECTIONS.addresses).createIndex({ userId: 1 });
    console.log('Addresses indexes created');

    // Print summary
    console.log('                 DATABASE SEEDING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Database: ${DATABASE_NAME}`);
    console.log('\n📋 Collections seeded:');
    console.log(`   • Users:      ${users.length} documents`);
    console.log(`   • Categories: ${categories.length} documents`);
    console.log(`   • Products:   ${products.length} documents`);
    console.log(`   • Coupons:    ${coupons.length} documents`);
    console.log(`   • Orders:     ${orders.length} documents`);
    console.log(`   • Reviews:    ${reviews.length} documents`);
    console.log(`   • Addresses:  ${addresses.length} documents`);

    console.log('\n🔐 Test Credentials:');
    console.log('   Admin:    admin1@ecommerce.com    / Admin@123');
    console.log('   Seller:   seller1@marketplace.com / Seller@123');
    console.log('   Customer: customer1@email.com     / User@123');

    console.log('\n═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB Atlas');
    }
  }
}

seedDatabase().catch(console.error);
