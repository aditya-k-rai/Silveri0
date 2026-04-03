"use server";

export async function fetchLiveMarketRates() {
  try {
    // 1. Fetch Metals.dev (Silver in INR per Gram)
    const metalsUrl = `${process.env.NEXT_PUBLIC_METALS_DEV_API_URL}?api_key=${process.env.METALS_DEV_API_KEY}&currency=INR&unit=g`;
    const metalsRes = await fetch(metalsUrl, { cache: 'no-store' });
    const metalsData = await metalsRes.json();
    
    // We specifically want Silver
    const silverRate = metalsData?.metals?.silver || 0;

    // 2. Fetch FRED (USD to INR exchange rate via DEXINUS)
    const fredUrl = `${process.env.NEXT_PUBLIC_FRED_API_URL}?series_id=DEXINUS&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    const fredRes = await fetch(fredUrl, { cache: 'no-store' });
    const fredData = await fredRes.json();
    
    const usdInrRate = parseFloat(fredData?.observations?.[0]?.value || "0");

    return { 
      success: true, 
      silverRate, 
      usdInrRate, 
      error: null 
    };

  } catch (error: any) {
    console.error("Failed to fetch market rates:", error);
    return { 
      success: false, 
      silverRate: 0, 
      usdInrRate: 0, 
      error: error.message 
    };
  }
}
