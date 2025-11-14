import { getDb } from './mongo.js';

const USERS_COLLECTION = 'users';

export async function ensureUserIndexes() {
  const db = getDb();
  const collection = db.collection(USERS_COLLECTION);
  await collection.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
}

export async function findUserByEmail(email) {
  const db = getDb();
  const collection = db.collection(USERS_COLLECTION);
  return await collection.findOne({ email });
}

export async function createUser({ email, passwordHash, createdAt = new Date() }) {
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


