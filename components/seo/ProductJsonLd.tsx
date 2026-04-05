'use client';

import { Product } from '@/store/productStore';

interface ProductJsonLdProps {
  product: Product;
  url: string;
}

export default function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.primaryImage ? [product.primaryImage] : [],
    description: `${product.name} — ${product.carat} ${product.colour} silver jewelry by Silveri. Weight: ${product.weight || 'N/A'}.`,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Silveri',
    },
    material: `${product.carat} ${product.colour}`,
    category: product.category,
    url: `${siteUrl}${url}`,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}${url}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Silveri',
      },
    },
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
