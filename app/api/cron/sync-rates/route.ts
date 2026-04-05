import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const TROY_OUNCE_TO_GRAMS = 31.1035;

export async function GET() {

  try {
    // 1. Fetch silver price in USD per Troy Ounce
    const metalsRes = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${process.env.METALS_DEV_API_KEY}&currency=USD&unit=toz`,
      { cache: 'no-store', headers: { 'Accept': 'application/json' } }
    );
    const metalsData = await metalsRes.json();
    const silverUsdPerToz = metalsData?.metals?.silver || 0;

    // 2. Fetch USD to INR exchange rate
    const fredRes = await fetch(
      `${process.env.NEXT_PUBLIC_FRED_API_URL}?series_id=DEXINUS&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`,
      { cache: 'no-store', headers: { 'Accept': 'application/json' } }
    );
    const fredData = await fredRes.json();
    const observation = fredData?.observations?.[0];
    const usdInrRate = parseFloat(observation?.value || '0');
    const fredObservationDate = observation?.date || null;

    // 3. Convert to INR per gram
    const silverRate = usdInrRate > 0 && silverUsdPerToz > 0
      ? parseFloat(((silverUsdPerToz * usdInrRate) / TROY_OUNCE_TO_GRAMS).toFixed(2))
      : 0;

    if (silverRate === 0) {
      return NextResponse.json({ error: 'API returned zero rates' }, { status: 500 });
    }

    // 4. Save to Firebase
    if (adminDb) {
      await adminDb.collection('marketRates').add({
        silverRate,
        usdInr: usdInrRate,
        fredObservationDate: fredObservationDate || null,
        fetchedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      silverRate,
      usdInrRate,
      fredObservationDate,
    });

  } catch (error: any) {
    console.error('Cron sync-rates failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
