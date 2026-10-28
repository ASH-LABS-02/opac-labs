import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ error: 'The component catalog is retired.' }, { status: 410 });
}
