import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, getAuthenticatedUser, hasAdminAccess } from '@/lib/firebaseAdmin';
import { RequestError, clientAddress, enforceRateLimit, readJsonRequest, requestErrorResponse, requireAppCheck, validEmail, validName, validPhone } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
    software: 'Software project',
    hardware: 'Hardware project',
    hybrid: 'Software + hardware project',
    iot: 'IoT & smart devices',
    robotics: 'Robotics',
    automation: 'Automation',
    embedded: 'Embedded systems',
    custom: 'Other project',
};

const BUDGET_LABELS: Record<string, string> = {
    'not-sure': 'Not sure yet',
    'under-5k': 'Under ₹5,000',
    '5k-10k': '₹5,000 – ₹10,000',
    '10k-20k': '₹10,000 – ₹20,000',
    '20k-plus': '₹20,000+',
};

const TIMELINE_LABELS: Record<string, string> = {
    '1-week': 'Within 1 week',
    '2-weeks': 'Within 2 weeks',
    '1-month': 'Within 1 month',
    flexible: 'Flexible',
};

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit('project-global', 'all', 1000, 60_000);
        await enforceRateLimit('project-ip', clientAddress(req), 15, 60_000);
        await requireAppCheck(req);
        const body = await readJsonRequest<Record<string, unknown>>(req, 12 * 1024);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json({ error: 'Please complete the project brief with valid contact details.' }, { status: 400 });
        }
        const { name, email, phone, projectType, description, budget, timeline, website } = body;
        if (typeof website === 'string' && website.trim()) return NextResponse.json({ requestId: null }, { status: 201 });
        if (!validName(name) || !validEmail(email) || !validPhone(phone) ||
            typeof description !== 'string' || description.trim().length < 15 || description.length > 3000 ||
            typeof projectType !== 'string' || !Object.hasOwn(TYPE_LABELS, projectType) ||
            typeof budget !== 'string' || !Object.hasOwn(BUDGET_LABELS, budget) ||
            typeof timeline !== 'string' || !Object.hasOwn(TIMELINE_LABELS, timeline)) {
            return NextResponse.json({ error: 'Please complete the project brief with valid contact details.' }, { status: 400 });
        }

        await enforceRateLimit('project-email', email.toLowerCase(), 5, 15 * 60_000);
        const user = await getAuthenticatedUser(req);
        if (req.headers.has('authorization') && !user) {
            return NextResponse.json({ error: 'Your sign-in expired. Please sign in again.' }, { status: 401 });
        }
        const clean = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            projectType,
            description: description.trim(),
            budget,
            timeline,
        };
        const ref = await getAdminDb().collection('projectRequests').add({
            ...clean,
            userId: user?.uid ?? null,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: expiresAt('PROJECT_RETENTION_DAYS', 365),
        });

        const message = [
            '*Project enquiry — OPAC Labs*',
            `Name: ${clean.name}`,
            `Email: ${clean.email}`,
            `Phone: ${clean.phone}`,
            `Service: ${TYPE_LABELS[projectType]}`,
            `Target budget: ${BUDGET_LABELS[budget]}`,
            `Timeline: ${TIMELINE_LABELS[timeline]}`,
            `Brief: ${clean.description}`,
            `Reference: ${ref.id}`,
        ].join('\n');
        return NextResponse.json({
            requestId: ref.id,
            whatsappUrl: `https://wa.me/917867089886?text=${encodeURIComponent(message)}`,
        }, { status: 201 });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not save project request:', error);
        return requestErrorResponse(error, 'Could not submit your project brief. Please try again.');
    }
}

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    try {
        await enforceRateLimit('project-read-user', user.uid, 30, 60_000);
        const collection = getAdminDb().collection('projectRequests');
        const snap = await hasAdminAccess(user)
            ? await collection.orderBy('createdAt', 'desc').limit(100).get()
            : await collection.where('userId', '==', user.uid).limit(100).get();
        const requests = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() ?? null,
            };
        }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        return NextResponse.json({ requests });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not load project requests:', error);
        return requestErrorResponse(error, 'Could not load project requests');
    }
}
