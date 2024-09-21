const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function addUser(username, password) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const users = database.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      console.log('User already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username: username,
      password: hashedPassword,
    });

    console.log(`New user created with id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Usage: node scripts/addUser.js <username> <password>
const [,, username, password] = process.argv;
if (username && password) {
  addUser(username, password).catch(console.error);
} else {
  console.log('Please provide a username and password');
}