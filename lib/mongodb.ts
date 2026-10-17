import { MongoClient, Db, Collection } from 'mongodb';
import dns from 'dns';

// Fix Windows DNS querySrv EBADRESP by configuring reliable DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const uri = process.env.MONGODB_URI || '';
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI tidak ditemukan di .env');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(dbName = 'raport_quran'): Promise<Db> {
  const c = await clientPromise;
  return c.db(dbName);
}

export async function getSantriCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('santri');
}

export async function getGuruCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('guru');
}

export async function getKelasCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('kelas');
}

export async function getSettingsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('settings');
}
