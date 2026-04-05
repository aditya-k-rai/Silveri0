"use server";

const TROY_OUNCE_TO_GRAMS = 31.1035;

export async function fetchLiveMarketRates() {
  try {
    // 1. Fetch Metals.dev — Silver in USD per Troy Ounce
    const metalsUrl = `https://api.metals.dev/v1/latest?api_key=${process.env.METALS_DEV_API_KEY}&currency=USD&unit=toz`;
    const metalsRes = await fetch(metalsUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    const metalsData = await metalsRes.json();

    const silverUsdPerToz = metalsData?.metals?.silver || 0;
    const metalsTimestamp = metalsData?.timestamp || null;

    // 2. Fetch FRED — USD to INR exchange rate (DEXINUS)
    const fredUrl = `${process.env.NEXT_PUBLIC_FRED_API_URL}?series_id=DEXINUS&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    const fredRes = await fetch(fredUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    const fredData = await fredRes.json();

    const observation = fredData?.observations?.[0];
    const usdInrRate = parseFloat(observation?.value || "0");
    const fredObservationDate = observation?.date || null;

    // 3. Convert: USD/toz → INR/gram
    // silverRate (INR per gram) = (silverUsdPerToz × usdInrRate) / 31.1035
    const silverRate = usdInrRate > 0 && silverUsdPerToz > 0
      ? parseFloat(((silverUsdPerToz * usdInrRate) / TROY_OUNCE_TO_GRAMS).toFixed(2))
      : 0;

    return {
      success: true,
      silverRate,
      silverUsdPerToz,
      usdInrRate,
      fetchedAt: new Date().toISOString(),
      fredObservationDate,
      metalsTimestamp,
      error: null
    };

  } catch (error: any) {
    console.error("Failed to fetch market rates:", error);
    return {
      success: false,
      silverRate: 0,
      silverUsdPerToz: 0,
      usdInrRate: 0,
      fetchedAt: new Date().toISOString(),
      fredObservationDate: null,
      metalsTimestamp: null,
      error: error.message
    };
  }
}
