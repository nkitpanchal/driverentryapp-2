const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:');
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error);