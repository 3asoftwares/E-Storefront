/**
 * Sample Data Generator for E-Commerce Platform
 * Run with: node generate-data.js
 */

const recordCount = {
  users: {
    admins: 10,
    sellers: 20,
    customers: 70,
  },
  categories: 20,
  products: {
    total: 300,
    perCategory: 15,
  },
  coupons: 20,
  orders: 50,
  reviews: 100,
  addresses: 100,
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  hashPassword,
  PASSWORDS,
  USER_ROLES,
  ID_PREFIX,
  FIRST_NAMES,
  LAST_NAMES,
  PRODUCT_TEMPLATES,
  CATEGORIES,
  COUPON_CODES,
  CITIES,
  STATES,
  STREETS,
  REVIEW_TITLES,
  REVIEW_COMMENTS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from './data-constants.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-computed hashed passwords (initialized in main)
let HASHED_PASSWORDS = {};

// Helper to generate MongoDB ObjectId format (24 hex chars)
const generateObjectId = (prefix, index) => {
  const hexIndex = index.toString(16).padStart(24 - prefix.length, '0');
  return `${prefix}${hexIndex}`;
};

// Generate date within range
const generateDate = (startYear, endYear) => {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
};

// Generate slug from name
const slugify = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Storage for generated data (for cross-referencing)
let users = [];
let sellers = [];
let customers = [];
let categories = [];
let products = [];
let coupons = [];
let orders = [];
let reviews = [];
let addresses = [];

// Generate Users (100 total: 10 admins, 20 sellers, 70 customers)
function generateUsers() {
  let userIndex = 1;

  // Generate admins (10)
  for (let i = 0; i < recordCount.users.admins; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];
    const createdAt = generateDate(2024, 2024);

    users.push({
      _id: { $oid: generateObjectId(ID_PREFIX.USER, userIndex) },
      email: `admin${i + 1}@yopmail.com`,
      password: HASHED_PASSWORDS.ADMIN, // 'Admin@123'
      name: `${firstName} ${lastName}`,
      role: USER_ROLES.ADMIN,
      isActive: true,
      emailVerified: true,
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
    userIndex++;
  }

  // Generate sellers (20)
  for (let i = 0; i < recordCount.users.sellers; i++) {
    const firstName = FIRST_NAMES[10 + i];
    const lastName = LAST_NAMES[10 + i];
    const createdAt = generateDate(2024, 2024);

    const seller = {
      _id: { $oid: generateObjectId(ID_PREFIX.USER, userIndex) },
      email: `seller${i + 1}@yopmail.com`,
      password: HASHED_PASSWORDS.SELLER, // 'Seller@123'
      name: `${firstName} ${lastName}`,
      role: USER_ROLES.SELLER,
      isActive: true,
      emailVerified: true,
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    };
    users.push(seller);
    sellers.push(seller);
    userIndex++;
  }

  // Generate customers (70)
  for (let i = 0; i < recordCount.users.customers; i++) {
    const firstName = FIRST_NAMES[(30 + i) % 50];
    const lastName = LAST_NAMES[(30 + i) % 50];
    const createdAt = generateDate(2024, 2025);

    const customer = {
      _id: { $oid: generateObjectId(ID_PREFIX.USER, userIndex) },
      email: `customer${i + 1}@yopmail.com`,
      password: HASHED_PASSWORDS.CUSTOMER, // 'User@123'
      name: `${firstName} ${lastName}`,
      role: USER_ROLES.CUSTOMER,
      isActive: i < 65, // 5 inactive customers
      emailVerified: i < 60, // 10 unverified customers
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    };
    users.push(customer);
    customers.push(customer);
    userIndex++;
  }

  return users;
}

// Generate Categories (20) - matches ICategory model
function generateCategories() {
  CATEGORIES.forEach((cat, index) => {
    const createdAt = generateDate(2024, 2024);

    categories.push({
      _id: { $oid: generateObjectId(ID_PREFIX.CATEGORY, index + 1) },
      name: cat.name,
      slug: slugify(cat.name),
      description: cat.description,
      icon: cat.icon,
      isActive: true,
      productCount: 15, // 15 products per category
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
  });

  return categories;
}

// Generate Products (300) - matches IProduct model
function generateProducts() {
  let productIndex = 1;

  categories.forEach((category, catIndex) => {
    const templates = PRODUCT_TEMPLATES[catIndex] || PRODUCT_TEMPLATES[0];

    // 15 products per category = 300 total
    for (let i = 0; i < recordCount.products.perCategory; i++) {
      // Assign seller (rotating through 20 sellers)
      const seller = sellers[productIndex % sellers.length];
      const templateName = templates[i % templates.length];
      const variant = [
        'Pro',
        'Plus',
        'Max',
        'Lite',
        'Ultra',
        'Basic',
        'Premium',
        'Standard',
        'Elite',
        'Classic',
      ][i % 10];
      const productName = `${templateName} ${variant}`;
      const price = Math.floor(Math.random() * 500 + 20) + 0.99;
      const createdAt = generateDate(2024, 2025);

      products.push({
        _id: { $oid: generateObjectId(ID_PREFIX.PRODUCT, productIndex) },
        name: productName,
        description: `High quality ${templateName.toLowerCase()} from ${
          category.name
        } category. Perfect for everyday use with premium features and excellent durability. This product has been carefully designed to meet all your needs.`,
        price: price,
        category: category.name, // Category name as string (per IProduct model)
        stock: Math.floor(Math.random() * 100 + 10),
        imageUrl: `https://picsum.photos/seed/${productIndex}/400/400`,
        sellerId: seller._id.$oid, // Link to seller
        isActive: productIndex % 20 !== 0, // 95% active
        tags: [slugify(category.name), slugify(templateName), variant.toLowerCase()],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 50),
        createdAt: { $date: createdAt },
        updatedAt: { $date: generateDate(2025, 2025) },
      });
      productIndex++;
    }
  });

  return products;
}

// Generate Coupons (20) - matches ICoupon model
function generateCoupons() {
  COUPON_CODES.forEach((code, index) => {
    const isPercentage = index % 2 === 0;
    const createdAt = generateDate(2024, 2024);

    coupons.push({
      _id: { $oid: generateObjectId(ID_PREFIX.COUPON, index + 1) },
      code: code,
      description: `Save with ${code} - ${isPercentage ? 'Percentage' : 'Fixed amount'} discount`,
      discountType: isPercentage ? 'percentage' : 'fixed',
      discount: isPercentage ? 10 + index * 2 : 50 + index * 10,
      minPurchase: 50 + index * 10,
      maxDiscount: isPercentage ? 100 + index * 20 : null,
      validFrom: { $date: '2025-01-01T00:00:00.000Z' },
      validTo: { $date: '2026-12-31T23:59:59.000Z' },
      usageLimit: 100 + index * 50,
      usageCount: Math.floor(Math.random() * 50),
      isActive: index < 18, // 18 active, 2 inactive
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
  });

  return coupons;
}

// Generate Orders (50) - matches IOrder model
function generateOrders() {
  for (let i = 0; i < recordCount.orders; i++) {
    // Pick a customer
    const customer = customers[i % customers.length];
    const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
    const orderItems = [];
    let subtotal = 0;

    // Track seller for this order (single seller order for simplicity)
    // Or we can have multi-seller orders
    const orderProducts = [];

    // Pick random products
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      // Avoid duplicates
      if (orderProducts.find((p) => p._id.$oid === product._id.$oid)) continue;
      orderProducts.push(product);
    }

    // If we got at least one product
    if (orderProducts.length === 0) {
      orderProducts.push(products[i % products.length]);
    }

    // Determine if single seller or multi-seller
    const sellerIds = [...new Set(orderProducts.map((p) => p.sellerId))];
    const primarySellerId = sellerIds[0]; // First seller as order's sellerId

    // Build order items - matches OrderItem interface
    for (const product of orderProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemSubtotal = Math.round(product.price * quantity * 100) / 100;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id.$oid,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        sellerId: product.sellerId, // Link item to seller
        subtotal: itemSubtotal,
      });
    }

    // Apply coupon to some orders
    const hasCoupon = i % 3 === 0;
    const coupon = hasCoupon ? coupons[i % coupons.length] : null;
    let discount = 0;

    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discount = Math.round(subtotal * (coupon.discount / 100) * 100) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discount;
      }
    }

    const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = Math.round((subtotal - discount + tax + shipping) * 100) / 100;

    const cityIndex = i % CITIES.length;
    const createdAt = generateDate(2025, 2025);

    orders.push({
      _id: { $oid: generateObjectId(ID_PREFIX.ORDER, i + 1) },
      orderNumber: `ORD-${Date.now()}-${i + 1}`,
      customerId: customer._id.$oid, // Link to customer (not userId!)
      customerEmail: customer.email,
      sellerId: primarySellerId, // Link order to primary seller
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: tax,
      shipping: shipping,
      discount: discount,
      couponCode: coupon ? coupon.code : null,
      total: total,
      orderStatus: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
      paymentStatus: i % 5 === 0 ? PAYMENT_STATUSES[0] : PAYMENT_STATUSES[1], // Mostly completed
      paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      shippingAddress: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${STREETS[i % STREETS.length]}`,
        city: CITIES[cityIndex],
        state: STATES[cityIndex],
        zip: String(10000 + Math.floor(Math.random() * 90000)),
        country: 'USA',
      },
      notes: i % 4 === 0 ? 'Please handle with care' : null,
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
  }

  return orders;
}

// Generate Reviews (100) - matches Review interface from user.types
function generateReviews() {
  for (let i = 0; i < recordCount.reviews; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];
    const titleIndex = i % REVIEW_TITLES.length;
    const createdAt = generateDate(2025, 2025);

    reviews.push({
      _id: { $oid: generateObjectId(ID_PREFIX.REVIEW, i + 1) },
      productId: product._id.$oid, // Link to product
      userId: customer._id.$oid, // Link to customer
      userName: customer.name,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
      title: REVIEW_TITLES[titleIndex],
      comment: REVIEW_COMMENTS[titleIndex],
      images: i % 5 === 0 ? [`https://picsum.photos/seed/review${i}/200/200`] : [],
      helpful: Math.floor(Math.random() * 20),
      verified: i < 80, // 80% verified purchases
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
  }

  return reviews;
}

// Generate Addresses (100) - linked to users
function generateAddresses() {
  for (let i = 0; i < recordCount.addresses; i++) {
    const user = users[i % users.length];
    const cityIndex = i % CITIES.length;
    const createdAt = generateDate(2024, 2025);

    addresses.push({
      _id: { $oid: generateObjectId(ID_PREFIX.ADDRESS, i + 1) },
      userId: user._id.$oid, // Link to user
      street: `${Math.floor(Math.random() * 9999) + 1} ${STREETS[i % STREETS.length]}`,
      city: CITIES[cityIndex],
      state: STATES[cityIndex],
      zip: String(10000 + Math.floor(Math.random() * 90000)),
      country: 'USA',
      isDefault: i % 2 === 0,
      label: i % 2 === 0 ? 'home' : 'work',
      createdAt: { $date: createdAt },
      updatedAt: { $date: generateDate(2025, 2025) },
    });
  }

  return addresses;
}

// Main execution
function main() {
  console.log('Generating sample data based on model schemas...\n');

  // Generate hashed passwords
  console.log('Hashing passwords...');
  HASHED_PASSWORDS = {
    ADMIN: hashPassword(PASSWORDS.ADMIN),
    SELLER: hashPassword(PASSWORDS.SELLER),
    CUSTOMER: hashPassword(PASSWORDS.CUSTOMER),
  };
  console.log('✓ Passwords hashed (Admin@123, Seller@123, User@123)\n');

  generateUsers();
  console.log(`✓ Generated ${users.length} users (10 admins, 20 sellers, 70 customers)`);

  generateCategories();
  console.log(`✓ Generated ${categories.length} categories`);

  generateProducts();
  console.log(`✓ Generated ${products.length} products (linked to ${sellers.length} sellers)`);

  generateCoupons();
  console.log(`✓ Generated ${coupons.length} coupons`);

  generateOrders();
  console.log(`✓ Generated ${orders.length} orders (linked to customers, sellers, products)`);

  generateReviews();
  console.log(`✓ Generated ${reviews.length} reviews (linked to products and customers)`);

  generateAddresses();
  console.log(`✓ Generated ${addresses.length} addresses (linked to users)`);

  // Write files
  const outputDir = __dirname;

  fs.writeFileSync(path.join(outputDir, 'data/users.json'), JSON.stringify(users, null, 2));
  fs.writeFileSync(
    path.join(outputDir, 'data/categories.json'),
    JSON.stringify(categories, null, 2)
  );
  fs.writeFileSync(path.join(outputDir, 'data/products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(outputDir, 'data/coupons.json'), JSON.stringify(coupons, null, 2));
  fs.writeFileSync(path.join(outputDir, 'data/orders.json'), JSON.stringify(orders, null, 2));
  fs.writeFileSync(path.join(outputDir, 'data/reviews.json'), JSON.stringify(reviews, null, 2));
  fs.writeFileSync(path.join(outputDir, 'data/addresses.json'), JSON.stringify(addresses, null, 2));

  console.log('\n✓ All files written to sample-data/ directory');
}

main();
