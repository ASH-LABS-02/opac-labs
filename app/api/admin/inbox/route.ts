import { getAdminUser } from '@/lib/auth';
import { getMongoClient, records, publicRecord } from '@/lib/database';
import { RequestError, enforceRateLimit, readJsonRequest, requestErrorResponse } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';
import type { ClientSession } from 'mongodb';

export const dynamic = 'force-dynamic';
const collections = ['projectRequests', 'contactMessages'];
const statuses: Record<string, string[]> = { projectRequests: ['pending', 'reviewing', 'quoted', 'closed'], contactMessages: ['new', 'read', 'resolved'] };

export async function GET(request: Request) {
    try {
        const user = await getAdminUser(request);
        if (!user) return Response.json({ error: 'Staff sign-in and authenticator verification required.' }, { status: 403 });
        await enforceRateLimit('admin-inbox', user.uid, 60, 60_000);
        const name = new URL(request.url).searchParams.get('collection') || '';
        if (!collections.includes(name)) return Response.json({ error: 'Invalid inbox.' }, { status: 400 });
        const rows = (await (await records(name)).find({}).sort({ createdAt: -1 }).limit(100).toArray()).map(publicRecord);
        return Response.json({ rows });
    } catch (error) { return requestErrorResponse(error, 'Could not load the staff inbox.'); }
}

export async function PATCH(request: Request) {
    try {
        const user = await getAdminUser(request);
        if (!user) return Response.json({ error: 'Staff sign-in and authenticator verification required.' }, { status: 403 });
        await enforceRateLimit('admin-update', user.uid, 30, 60_000);
        const body = await readJsonRequest<Record<string, unknown>>(request, 2048);
        const { collection, id, status } = body;
        if (typeof collection !== 'string' || !collections.includes(collection) || typeof id !== 'string' || !/^[a-zA-Z0-9-]{20,50}$/.test(id) || typeof status !== 'string' || !statuses[collection].includes(status)) return Response.json({ error: 'Invalid status update.' }, { status: 400 });
        const target = await records(collection), audit = await records('auditLog');
        const event = { _id: crypto.randomUUID(), actor: user.uid, collection, recordId: id, status, createdAt: new Date(), expiresAt: expiresAt('AUDIT_RETENTION_DAYS', 365) };
        const update = async (session?: ClientSession) => {
            const result = await target.updateOne({ _id: id }, { $set: { status, updatedAt: new Date(), updatedBy: user.uid } }, { session });
            if (!result.matchedCount) throw new RequestError(404, 'Record not found.');
            await audit.insertOne(event, { session });
        };
        if (process.env.MONGODB_TRANSACTIONS === 'true') {
            const session = getMongoClient().startSession();
            try { await session.withTransaction(() => update(session)); }
            finally { await session.endSession(); }
        } else await update();
        return Response.json({ success: true });
    } catch (error) { return requestErrorResponse(error, 'Could not update the status.'); }
}
