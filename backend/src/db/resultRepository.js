import { getDb } from './mongo.js';

const RESULTS_COLLECTION = 'results';

export async function ensureResultIndexes() {
  const db = getDb();
  const collection = db.collection(RESULTS_COLLECTION);
  await collection.createIndex({ userId: 1, url: 1, version: -1 }, { unique: true, name: 'uniq_user_url_version' });
  await collection.createIndex({ userId: 1, url: 1 }, { name: 'idx_user_url' });
}

export async function getNextVersion(userId, url) {
  const db = getDb();
  const collection = db.collection(RESULTS_COLLECTION);
  const latest = await collection.find({ userId, url }).sort({ version: -1 }).limit(1).toArray();
  const latestVersion = latest[0]?.version || 0;
  return latestVersion + 1;
}

export async function createResultRecord({ userId, url, version, cloudinaryUrl, publicId, createdAt = new Date() }) {
  const db = getDb();
  const collection = db.collection(RESULTS_COLLECTION);
  const doc = {
    userId,
    url,
    version,
    cloudinaryUrl,
    createdAt,
  };
  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function listResultsByUrl(userId, url, sortOrder = 1, version = null) {
  const db = getDb();
  const collection = db.collection(RESULTS_COLLECTION);
  // sortOrder: 1 = ascending (v1..vn), -1 = descending (vn..v1)
  const query = url ? { userId, url } : { userId };
  if (version !== null && version !== undefined) {
    query.version = Number(version);
  }
  const cursor = collection
    .find(query)
    .project({ _id: 0, url: 1, version: 1, cloudinaryUrl: 1, createdAt: 1 })
    .sort({ version: sortOrder });
  return await cursor.toArray();
}