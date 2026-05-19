/**
 * Server component shell for the homepage. Pulls the site-settings doc on
 * the server using firebase-admin so the announcement bar + hero section
 * stream as part of the initial HTML — improves LCP, gives crawlers the
 * hero image + headline without waiting on JS, and avoids the flash of
 * default gradient that used to render before the client-side getDoc()
 * resolved.
 *
 * Everything below the hero (real-time product grids, category strip,
 * newsletter) lives in HomeClient because it depends on Zustand + live
 * Firestore subscriptions.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import HomeClient from './_HomeClient';
import { adminDb } from '@/lib/firebase/admin';

// Re-validate every 5 minutes so admin-edited hero/announcement copy
// propagates without waiting for a fresh deploy.
export const revalidate = 300;

interface SiteSettings {
  heroBanner?: string | null;
  announcement?: string | null;
  announcementEnabled?: boolean;
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!adminDb) return {};
  try {
    const snap = await adminDb.collection('settings').doc('siteSettings').get();
    if (!snap.exists) return {};
    const data = snap.data() ?? {};
    return {
      heroBanner: typeof data.heroBanner === 'string' ? data.heroBanner : null,
      announcement: typeof data.announcement === 'string' ? data.announcement : null,
      announcementEnabled: data.announcementEnabled !== false,
    };
  } catch {
    // Admin SDK missing creds in some environments — fall through to defaults.
    return {};
  }
}

export default async function HomePage() {
  const { heroBanner, announcement, announcementEnabled } = await fetchSiteSettings();
  const showAnnouncement = Boolean(announcementEnabled && announcement);
  const isDataUrl = typeof heroBanner === 'string' && heroBanner.startsWith('data:');

  return (
    <>
      {/* ====== ANNOUNCEMENT BAR ====== */}
      {showAnnouncement && (
        <div className="bg-gold text-silver-900 text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
          {announcement}
        </div>
      )}

      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-gradient-to-br from-silver-100 via-white to-silver-200 overflow-hidden">
        {heroBanner ? (
          <>
            <Image
              src={heroBanner}
              alt="Silveri — Luxury silver jewelry"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              quality={80}
              className="object-cover"
              unoptimized={isDataUrl}
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        )}
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-36 text-center">
          <p className={`text-xs uppercase tracking-[0.3em] mb-5 ${heroBanner ? 'text-white/70' : 'text-silver-500'}`}>Luxury Silver Jewelry</p>
          <h1 className={`font-[family-name:var(--font-heading)] text-5xl md:text-6xl lg:text-7xl font-light mb-5 leading-tight ${heroBanner ? 'text-white' : 'text-silver-900'}`}>
            Timeless{' '}
            <span className={`font-medium ${heroBanner ? 'text-gold-light' : 'bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent'}`}>
              Elegance
            </span>
          </h1>
          <p className={`text-base md:text-lg max-w-lg mx-auto mb-10 font-light leading-relaxed ${heroBanner ? 'text-white/80' : 'text-silver-500'}`}>
            Discover our handcrafted collection of luxury silver jewelry for every occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/category/all"
              className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:shadow-xl ${
                heroBanner
                  ? 'bg-white text-silver-900 hover:bg-silver-100 hover:shadow-white/20'
                  : 'bg-silver-900 text-white hover:bg-silver-800 hover:shadow-silver-900/20'
              }`}
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/category/new-arrivals"
              className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:shadow-lg ${
                heroBanner
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/40 hover:bg-white/30'
                  : 'bg-white/70 backdrop-blur-sm text-silver-800 border border-silver-300 hover:bg-white hover:border-silver-400'
              }`}
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Hydrates everything below the fold — product grids, categories, newsletter */}
      <HomeClient />
    </>
  );
}
