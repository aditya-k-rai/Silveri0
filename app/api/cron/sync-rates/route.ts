import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const apiKey = process.env.METALS_DEV_API_KEY;
    if (!apiKey) throw new Error('METALS_DEV_API_KEY not set');

    const res = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=INR&unit=g`,
      { cache: 'no-store', headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();

    if (data.status !== 'success') throw new Error('API returned error');

    const silverRate = data.metals?.silver || 0;
    const usdInr = data.currencies?.USD || 0;

    if (silverRate === 0) throw new Error('Silver rate is zero');

    if (adminDb) {
      await adminDb.collection('marketRates').add({
        silverRate,
        usdInr,
        fetchedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true, silverRate, usdInr });
  } catch (error: any) {
    console.error('Cron sync-rates failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
