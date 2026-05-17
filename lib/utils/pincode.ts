/**
 * Pincode → city / district / state lookup using India Post's free public
 * postal-pincode API. Used by the checkout shipping-address form to auto-
 * fill location fields when the customer types a valid 6-digit pincode.
 *
 * Endpoint: https://api.postalpincode.in/pincode/{pincode}
 * Response shape (truncated):
 *   [{ Status: "Success", PostOffice: [{ Name, Block, District, State, ... }, ...] }]
 */

export interface PincodeLookupResult {
  city: string;
  district: string;
  state: string;
  /** Distinct city / locality names found at this pincode (multiple Post Offices are common). */
  cities: string[];
}

interface PostOffice {
  Name?: string;
  Block?: string;
  Division?: string;
  Region?: string;
  District?: string;
  State?: string;
}

interface PincodeApiResponse {
  Status: 'Success' | 'Error' | '404';
  PostOffice?: PostOffice[] | null;
}

/** Returns false until exactly 6 digits — keeps callers from spamming the API on every keystroke. */
export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

/**
 * Look up an Indian pincode. Returns null on any failure (network, invalid,
 * unmapped). The caller treats null as "leave the city/state fields editable".
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const code = pincode.trim();
  if (!isValidPincode(code)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      cache: 'force-cache', // pincode → city/state never changes; safe to cache aggressively
    });
    if (!res.ok) return null;
    const body = (await res.json()) as PincodeApiResponse[];
    const entry = body[0];
    if (!entry || entry.Status !== 'Success' || !entry.PostOffice?.length) {
      return null;
    }
    // All PostOffices for one pincode share the same district + state.
    // Different "Block" / "Name" entries effectively act as locality suggestions.
    const first = entry.PostOffice[0];
    const district = first.District ?? '';
    const state = first.State ?? '';

    // Build a deduped city/locality list. Prefer Block when present, otherwise Name/Division.
    const citySet = new Set<string>();
    for (const po of entry.PostOffice) {
      const candidate = po.Block?.trim() || po.Name?.trim() || po.Division?.trim();
      if (candidate) citySet.add(candidate);
    }
    const cities = Array.from(citySet);
    return {
      city: cities[0] || district,
      district,
      state,
      cities,
    };
  } catch {
    return null;
  }
}
