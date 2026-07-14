import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const TYPE_LABELS: Record<string, string> = {
    iot: 'IoT & Smart Devices',
    robotics: 'Robotics',
    automation: 'Home Automation',
    embedded: 'Embedded Systems',
    custom: 'Custom Project',
};

const BUDGET_LABELS: Record<string, string> = {
    'under-5k': 'Under ₹5,000',
    '5k-10k': '₹5,000 – ₹10,000',
    '10k-20k': '₹10,000 – ₹20,000',
    '20k-plus': '₹20,000+',
};

const TIMELINE_LABELS: Record<string, string> = {
    '1-week': '1 Week',
    '2-weeks': '2 Weeks',
    '1-month': '1 Month',
    flexible: 'Flexible',
};

// POST /api/request-project  — save project request and return WhatsApp URL
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, projectType, description, budget, timeline } = body;

        if (!name || !email || !phone || !projectType || !description || !budget || !timeline) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        let requestId = 'req-' + Date.now();
        try {
            // Save to Firestore
            const db = getAdminDb();
            const ref = await db.collection('projectRequests').add({
                name,
                email,
                phone,
                projectType,
                description,
                budget,
                timeline,
                status: 'pending',
                createdAt: FieldValue.serverTimestamp(),
            });
            requestId = ref.id;
        } catch (dbError) {
            console.warn('Could not save to Firestore, continuing to WhatsApp redirect:', dbError);
        }

        // Build WhatsApp message
        const msg =
            `🛠️ *New Project Request — OPAC Labs*\n\n` +
            `👤 *Name:* ${name}\n📧 *Email:* ${email}\n📞 *Phone:* ${phone}\n\n` +
            `📂 *Project Type:* ${TYPE_LABELS[projectType] ?? projectType}\n` +
            `💰 *Budget:* ${BUDGET_LABELS[budget] ?? budget}\n` +
            `⏱️ *Timeline:* ${TIMELINE_LABELS[timeline] ?? timeline}\n\n` +
            `📝 *Description:*\n${description}`;

        const whatsappUrl = `https://wa.me/917867089886?text=${encodeURIComponent(msg)}`;

        return NextResponse.json({ requestId, whatsappUrl }, { status: 201 });
    } catch (err) {
        console.error('POST /api/request-project error:', err);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}

// GET /api/request-project  — list all project requests (admin)
export async function GET() {
    try {
        const db = getAdminDb();
        const snap = await db
            .collection('projectRequests')
            .orderBy('createdAt', 'desc')
            .get();

        const requests = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                createdAt: d.createdAt?.toDate().toISOString() ?? null,
            };
        });

        return NextResponse.json({ requests });
    } catch (err) {
        console.error('GET /api/request-project error:', err);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
