// tests/setup.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' }); // Ensure .env is loaded for test DB URI

beforeAll(async () => {
  const dbURI = process.env.MONGODB_URI_TEST;
  if (!dbURI) {
    // Fallback for CI environments or if .env is not used for test URI
    // This is not ideal for local tests where .env should be used.
    console.warn('MONGODB_URI_TEST not set in .env file. Falling back to default test URI. Ensure your .env is configured for local testing.');
    // throw new Error('MONGODB_URI_TEST not set in .env file. Testing cannot proceed.');
  }
  // Use a default URI if MONGODB_URI_TEST is not set, useful for CI or simpler setups
  // However, this means tests might run on a shared DB if not careful.
  // For this exercise, we'll proceed with a default if not set, but emphasize .env usage.
  const finalDbURI = dbURI || 'mongodb://localhost:27017/inventario_fallback_test_db';

  try {
    await mongoose.connect(finalDbURI);
  } catch (err) {
    console.error('Initial MongoDB connection error in tests:', err);
    process.exit(1); // Exit if DB connection fails
  }
});

afterEach(async () => {
  // Clean up database after each test to ensure test independence
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Drop the test database
  await mongoose.disconnect();
});
