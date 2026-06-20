import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';

  return {
    rules: [
      {
        // Google Shopping feed fetcher + Googlebot need to access the feed
        userAgent: ['Googlebot', 'Google-InspectionTool'],
        allow: ['/', '/api/feed/google'],
        disallow: ['/admin', '/account', '/checkout'],
      },
      {
        // All other bots — block sensitive areas
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/api', '/checkout'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
