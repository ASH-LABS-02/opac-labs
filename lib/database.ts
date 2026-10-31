import { MongoClient, type Document } from 'mongodb';

export type StoredRecord = Document & { _id: string; sessions?: { id: string; title: string; messages: unknown[]; createdAt: Date }[] };
const shared = globalThis as unknown as { opacMongo?: { uri: string; client: MongoClient; ready?: Promise<void> } };

export function getMongoClient() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MongoDB is not configured.');
    if (!shared.opacMongo || shared.opacMongo.uri !== uri) {
        shared.opacMongo = { uri, client: new MongoClient(uri, {
            maxPoolSize: 10, minPoolSize: 0, serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000, socketTimeoutMS: 15000,
        }) };
    }
    return shared.opacMongo.client;
}

export async function getDatabase() {
    const client = getMongoClient();
    const db = client.db(process.env.MONGODB_DB || 'opac_labs');
    if (!shared.opacMongo!.ready) shared.opacMongo!.ready = (async () => {
        await client.connect();
        await Promise.all([
            db.collection('user').createIndex({ email: 1 }, { unique: true }),
            db.collection('session').createIndex({ token: 1 }, { unique: true }),
            db.collection('session').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
            db.collection('session').createIndex({ userId: 1 }),
            db.collection('account').createIndex({ providerId: 1, accountId: 1 }, { unique: true }),
            db.collection('twoFactor').createIndex({ userId: 1 }, { unique: true }),
            db.collection('verification').createIndex({ identifier: 1 }),
            db.collection('verification').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
            db.collection('projectRequests').createIndex({ userId: 1, createdAt: -1 }),
            db.collection('projectRequests').createIndex({ createdAt: -1 }),
            db.collection('contactMessages').createIndex({ createdAt: -1 }),
            ...['projectRequests', 'contactMessages'].map(name =>
                db.collection(name).createIndex({ 'telegram.status': 1, 'telegram.nextAttemptAt': 1, createdAt: 1 })),
            ...['projectRequests', 'contactMessages', 'chatHistory', 'rateLimits', 'auditLog'].map(name =>
                db.collection(name).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })),
        ]);
    })().catch(error => { shared.opacMongo!.ready = undefined; throw error; });
    await shared.opacMongo!.ready;
    return db;
}

export async function records(name: string) {
    return (await getDatabase()).collection<StoredRecord>(name);
}

export function publicRecord(record: StoredRecord) {
    const { _id, ...data } = record;
    return { id: _id, ...data };
}
