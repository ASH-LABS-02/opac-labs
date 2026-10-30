import { getAuthenticatedUser, hasAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
        if (user.role !== 'admin') return Response.json({ error: 'Staff access required.' }, { status: 403 });
        return Response.json({ allowed: hasAdminAccess(user), enrolled: user.twoFactorEnabled === true });
    } catch { return Response.json({ error: 'Staff service is temporarily unavailable.' }, { status: 503 }); }
}
