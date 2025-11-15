import { getDb, getMongoStatus } from './mongo.js';

const USERS_COLLECTION = 'users';

function checkMongoConnection() {
  const status = getMongoStatus();
  if (!status.enabled || !status.connected) {
    throw new Error(`MongoDB is not available. Enabled: ${status.enabled}, Connected: ${status.connected}, Error: ${status.error || 'Unknown'}`);
  }
}

export async function ensureUserIndexes() {
  checkMongoConnection();
  const db = getDb();
  const collection = db.collection(USERS_COLLECTION);
  await collection.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
}

export async function findUserByEmail(email) {
  checkMongoConnection();
  const db = getDb();
  const collection = db.collection(USERS_COLLECTION);
  return await collection.findOne({ email });
}

export async function createUser({ email, passwordHash, createdAt = new Date() }) {
  checkMongoConnection();
  const db = getDb();
  const collection = db.collection(USERS_COLLECTION);
  const result = await collection.insertOne({
    email,
    passwordHash,
    createdAt,
    updatedAt: createdAt,
  });
  return { _id: result.insertedId, email, createdAt };
}


