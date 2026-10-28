import { MongoClient, Db, Collection } from 'mongodb';
import dns from 'dns';

// Konfigurasi DNS publik Google & Cloudflare untuk kehandalan resolusi SRV MongoDB Atlas di Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Abaikan pada environment yang membatasi setServers
}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raport_quran';
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'raport_quran';

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI tidak ditemukan di .env, menggunakan default Compass: mongodb://127.0.0.1:27017/raport_quran');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      // Reset cache promise agar request berikutnya dapat mencoba koneksi ulang setelah whitelist IP
      global._mongoClientPromise = undefined;
      if (err?.message?.includes('SSL alert') || err?.message?.includes('tlsv1 alert')) {
        console.warn('⚠️ Koneksi ke MongoDB Atlas ditolak (SSL Alert 80): IP Address Anda belum di-whitelist di MongoDB Atlas Network Access.');
        console.warn('👉 Buka MongoDB Atlas > Network Access > Add IP Address > pilih "Add Current IP Address" atau masukkan "0.0.0.0/0".');
      } else {
        console.warn('⚠️ Gagal terhubung ke MongoDB:', err?.message);
      }
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(dbName = DEFAULT_DB_NAME): Promise<Db> {
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

export async function getUjianCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('ujian');
}

export async function getEvaluasiCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('evaluasi');
}

export async function getDatabaseStatus() {
  try {
    const c = await clientPromise;
    const db = c.db(DEFAULT_DB_NAME);
    const collections = await db.listCollections().toArray();
    
    // Deteksi tipe koneksi: Local Compass vs MongoDB Atlas Cloud
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
    
    // Hitung jumlah dokumen per koleksi
    const counts: Record<string, number> = {};
    for (const col of collections) {
      counts[col.name] = await db.collection(col.name).countDocuments();
    }

    return {
      connected: true,
      dbName: DEFAULT_DB_NAME,
      host: isAtlas ? 'MongoDB Atlas (piq.sbganea.mongodb.net)' : 'MongoDB Compass (localhost:27017)',
      isLocal: !isAtlas,
      collections: collections.map(c => c.name),
      counts,
    };
  } catch (error: any) {
    const isSslAlert = error?.message?.includes('SSL alert') || error?.message?.includes('tlsv1 alert');
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
    
    return {
      connected: false,
      dbName: DEFAULT_DB_NAME,
      host: isAtlas ? 'MongoDB Atlas (piq.sbganea.mongodb.net)' : 'Disconnected',
      isLocal: !isAtlas,
      collections: [],
      counts: {},
      error: isSslAlert
        ? 'IP Address Anda belum didaftarkan di menu "Network Access" MongoDB Atlas (SSL Alert 80).'
        : error?.message || 'Gagal tersambung ke MongoDB Atlas',
    };
  }
}
