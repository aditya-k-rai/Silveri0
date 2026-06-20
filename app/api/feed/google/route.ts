import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';

// Cache response for 6 hours (Google fetches daily, CDN reuses it)
export const revalidate = 21600;

/**
 * GET /api/feed/google
 *
 * Generates a Google Merchant Center-compatible RSS 2.0 product feed.
 * Google uses this to populate Shopping tab listings (free) and Shopping Ads.
 *
 * Feed spec: https://support.google.com/merchants/answer/7052112
 */
export async function GET() {
  if (!adminDb) {
    return new NextResponse('Feed unavailable — server not configured', { status: 503 });
  }

  try {
    const snap = await adminDb
      .collection('products')
      .where('status', '==', 'Active')
      .get();

    const items = snap.docs
      .map((doc) => {
        const p = doc.data();

        // Skip products with no image or price — Google will reject them
        if (!p.primaryImage || !p.price) return null;

        const productUrl = `${SITE_URL}/product/${doc.id}`;
        const price = Number(p.price).toFixed(2);
        const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';

        // Build description — Google requires at least 1 character
        const description = p.description
          ? escapeXml(p.description.slice(0, 5000))
          : escapeXml(
              `${p.name} — ${p.carat || '925'} Sterling Silver ${p.category} by Silveri. ${
                p.weight ? `Weight: ${p.weight}.` : ''
              } ${p.plating ? `Plating: ${p.plating}.` : ''} Certified silver jewelry.`
            );

        // Material string
        const material = [p.carat, p.colour].filter(Boolean).join(' ');

        // Additional images (up to 10 allowed by Google)
        const additionalImages = [p.hoverImage, p.image3, p.image4, p.image5, p.image6]
          .filter(Boolean)
          .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
          .join('\n        ');

        return `
    <item>
      <g:id>${escapeXml(doc.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <description>${description}</description>
      <g:description>${description}</g:description>
      <link>${productUrl}</link>
      <g:link>${productUrl}</g:link>
      <g:image_link>${escapeXml(p.primaryImage)}</g:image_link>
      ${additionalImages}
      <g:price>${price} INR</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Silveri</g:brand>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:mpn>${escapeXml(p.sku || doc.id)}</g:mpn>
      <g:google_product_category>188</g:google_product_category>
      <g:product_type>${escapeXml(p.category || 'Jewelry')}</g:product_type>
      ${p.colour ? `<g:color>${escapeXml(p.colour)}</g:color>` : ''}
      ${material ? `<g:material>${escapeXml(material)}</g:material>` : ''}
      ${p.size ? `<g:size>${escapeXml(p.size)}</g:size>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>${Number(p.price) >= 999 ? '0.00' : '99.00'} INR</g:price>
      </g:shipping>
      <g:shipping_weight>${p.weight ? escapeXml(String(p.weight).replace(/[^0-9.]/g, '')) + ' g' : '20 g'}</g:shipping_weight>
      <g:item_group_id>${escapeXml(p.category?.toLowerCase().replace(/\s+/g, '_') || 'jewelry')}</g:item_group_id>
      <g:custom_label_0>${escapeXml(p.isFeatured ? 'featured' : 'standard')}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(p.isNewArrival ? 'new_arrival' : 'catalog')}</g:custom_label_1>
    </item>`;
      })
      .filter(Boolean)
      .join('');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Silveri — Luxury Silver Jewelry</title>
    <link>${SITE_URL}</link>
    <description>Discover exquisite handcrafted silver jewelry. Shop rings, necklaces, earrings, bracelets and more at Silveri.</description>
    <language>en-IN</language>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(feed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=21600, s-maxage=21600',
        'X-Robots-Tag': 'noindex', // Don't index the feed URL itself
      },
    });
  } catch (error) {
    console.error('[Google Feed] Error generating feed:', error);
    return new NextResponse('Feed generation failed', { status: 500 });
  }
}

/** Escape characters that break XML */
function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
