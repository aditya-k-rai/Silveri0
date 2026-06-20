'use client';

import { Product } from '@/store/productStore';

interface ProductJsonLdProps {
  product: Product;
  url: string;
}

/**
 * Injects Product schema.org structured data into the page <head>.
 * This drives Google Rich Results (price, availability, reviews, return policy)
 * and is required for Google Shopping free listings via organic search.
 *
 * Validates at: https://search.google.com/test/rich-results
 */
export default function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';
  const productUrl = `${siteUrl}${url}`;

  // priceValidUntil is required by Google for Product rich results — set 1 year ahead
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  const description = product.description
    ? product.description.slice(0, 5000)
    : `${product.name} — ${product.carat} ${product.colour} silver jewelry by Silveri. Weight: ${product.weight || 'N/A'}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [
      product.primaryImage,
      product.hoverImage,
      product.image3,
      product.image4,
      product.image5,
      product.image6,
    ].filter(Boolean),
    description,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Silveri',
    },
    material: [product.carat, product.colour].filter(Boolean).join(' '),
    color: product.colour || undefined,
    category: product.category,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: priceValidUntil.toISOString().split('T')[0],
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Silveri',
        url: siteUrl,
      },
      // Shipping details — required for Google Shopping shipping annotations
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 999 ? 0 : 99,
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      // Return policy — required for Google Shopping return annotations
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    // Weight (useful for jewelry)
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: parseFloat(product.weight) || product.weight,
        unitCode: 'GRM',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
