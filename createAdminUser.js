const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdminUser(username, password) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const users = database.collection('users');

    // Check if admin user already exists
    const existingUser = await users.findOne({ username, role: 'admin' });
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the admin user
    const result = await users.insertOne({
      username: username,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });

    console.log(`Admin user created with id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Usage: node createAdminUser.js <username> <password>
const [,, username, password] = process.argv;
if (username && password) {
  createAdminUser(username, password).catch(console.error);
} else {
  console.log('Please provide a username and password');
  console.log('Usage: node createAdminUser.js <username> <password>');
}