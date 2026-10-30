import { MongoClient } from 'mongodb';
const [action, email] = process.argv.slice(2);
if (!['grant','revoke'].includes(action) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) throw new Error('Usage: node --env-file=.env.local scripts/manage-admin.mjs grant|revoke staff@example.com');
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI privately.');
const client = new MongoClient(process.env.MONGODB_URI);
try {
 const db = client.db(process.env.MONGODB_DB || 'opac_labs');
 const user = await db.collection('user').findOne({ email: email.trim().toLowerCase() });
 if (!user || (action === 'grant' && !user.emailVerified)) throw new Error('Create and verify the staff account first.');
 await db.collection('user').updateOne({ _id: user._id }, { $set: { role: action === 'grant' ? 'admin' : 'user', updatedAt: new Date() } });
 await db.collection('session').deleteMany({ userId: { $in: [user._id, user._id.toString()] } });
 console.log(`Staff access ${action === 'grant' ? 'granted' : 'revoked'}. Existing sessions revoked. Authenticator verification is still required.`);
} finally { await client.close(); }
