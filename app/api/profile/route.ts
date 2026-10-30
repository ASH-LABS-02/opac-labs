import { ObjectId } from 'mongodb';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDatabase } from '@/lib/database';
import { enforceRateLimit, readJsonRequest, requestErrorResponse, validName, validPhone } from '@/lib/serverSecurity';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
        return Response.json({ name: user.name, phone: user.phone || '' });
    } catch (error) { return requestErrorResponse(error, 'Could not load your profile.'); }
}
export async function PATCH(request: Request) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
        await enforceRateLimit('profile-user', user.uid, 10, 60_000);
        const body = await readJsonRequest<Record<string, unknown>>(request, 2048);
        if (!validName(body.name) || typeof body.phone !== 'string' || (body.phone !== '' && !validPhone(body.phone))) return Response.json({ error: 'Enter a valid name and phone number.' }, { status: 400 });
        await (await getDatabase()).collection('user').updateOne({ _id: new ObjectId(user.uid) }, { $set: { name: body.name.trim(), phone: body.phone.trim(), updatedAt: new Date() } });
        return Response.json({ success: true });
    } catch (error) { return requestErrorResponse(error, 'Could not update your profile.'); }
}
