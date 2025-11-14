import { MongoClient } from 'mongodb';

let mongoClient = null;
let mongoDb = null;
let isConnected = false;
let lastError = null;

export async function connectToMongo(uri = process.env.MONGODB_URI, dbName = process.env.MONGODB_DB_NAME) {
  if (!uri) {
    console.warn('⚠️  MONGODB_URI is not set. MongoDB will be disabled.');
    return;
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();

    // If dbName is not provided, MongoDB will use the database from the URI
    const db = dbName ? client.db(dbName) : client.db();

    mongoClient = client;
    mongoDb = db;
    isConnected = true;
    lastError = null;

    console.log(`✅ Connected to MongoDB${db?.databaseName ? ` (db: ${db.databaseName})` : ''}`);
  } catch (err) {
    lastError = err;
    isConnected = false;
    mongoClient = null;
    mongoDb = null;
    console.error('❌ MongoDB connection failed:', err.message);
  }
}

export function getDb() {
  if (!mongoDb) {
    throw new Error('MongoDB is not initialized. Ensure MONGODB_URI is set and connection succeeded.');
  }
  return mongoDb;
}

export async function disconnectMongo() {
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log('🛑 MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    } finally {
      mongoClient = null;
      mongoDb = null;
      isConnected = false;
    }
  }
}

export function getMongoStatus() {
  return {
    enabled: Boolean(process.env.MONGODB_URI),
    connected: isConnected,
    dbName: mongoDb?.databaseName || null,
    error: isConnected ? null : (lastError ? lastError.message : null),
  };
}


