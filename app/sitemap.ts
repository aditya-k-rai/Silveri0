import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // TODO: Fetch product & category slugs from Firestore
  // const products = await getProducts();
  // const categories = await getCategories();
  // const productPages = products.map(p => ({
  //   url: `${SITE_URL}/product/${p.slug}`,
  //   lastModified: p.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));

  return [...staticPages];
}
