import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { products } from '@/lib/data';

export async function GET() {
  try {
    for (const p of products) {
      await setDoc(doc(db, 'products', String(p.id)), p);
    }
    return NextResponse.json({ success: true, count: products.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
