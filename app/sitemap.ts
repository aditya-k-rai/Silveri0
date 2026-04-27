import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase/admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/category/all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/custom-jewelry`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Product pages from Firestore
  let productPages: MetadataRoute.Sitemap = [];

  if (adminDb) {
    try {
      const snap = await adminDb.collection('products').get();
      productPages = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          url: `${SITE_URL}/product/${doc.id}`,
          lastModified: data.updatedAt?.toDate?.() ?? data.createdAt?.toDate?.() ?? new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    } catch (err) {
      console.error('Sitemap: Failed to fetch products:', err);
    }
  }

  return [...staticPages, ...productPages];
}
