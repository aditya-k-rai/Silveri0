/**
 * Developer page layout — handles all SEO metadata and Schema.org JSON-LD
 * for the /developer route. Uses Next.js App Router metadata export system.
 */

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';
const DEV_PHOTO_URL = `${SITE_URL}/images/Developer Aditya Kumar Rai Image .gif`;

export const metadata: Metadata = {
  title: 'Aditya Kumar Rai | Software Developer, Web Developer & Digital Marketer — Greater Noida',
  description:
    'Aditya Kumar Rai (also known as Aditya Rai or Aditya K. Rai) is a Software Developer, Web Developer & Digital Marketer originally from Kushinagar, Uttar Pradesh, now based in Greater Noida. He designed, developed, and marketed Silveri — a luxury handcrafted silver jewelry e-commerce store. View his work, social profiles, and portfolio.',
  keywords: [
    'Aditya Kumar Rai',
    'Aditya Rai',
    'Aditya K. Rai',
    'Software Developer Greater Noida',
    'Web Developer Greater Noida',
    'Digital Marketer Greater Noida',
    'Silveri developer',
    'Next.js developer India',
    'React developer Uttar Pradesh',
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE_URL}/developer`,
  },
  openGraph: {
    type: 'profile',
    url: `${SITE_URL}/developer`,
    title: 'Aditya Kumar Rai | Software Developer, Web Developer & Digital Marketer — Greater Noida',
    description:
      'Aditya Kumar Rai (also known as Aditya Rai or Aditya K. Rai) is a Software Developer, Web Developer & Digital Marketer originally from Kushinagar, Uttar Pradesh, now based in Greater Noida. He designed, developed, and marketed Silveri — a luxury handcrafted silver jewelry e-commerce store.',
    images: [
      {
        url: DEV_PHOTO_URL,
        width: 400,
        height: 400,
        alt: 'Aditya Kumar Rai (Aditya Rai / Aditya K. Rai) — Software Developer, Web Developer & Digital Marketer',
      },
    ],
    siteName: 'Silveri',
  },
  twitter: {
    card: 'summary',
    title: 'Aditya Kumar Rai | Software Developer & Digital Marketer — Greater Noida',
    description:
      'Originally from Kushinagar, UP. Nickname / Also known as Aditya Rai or Aditya K. Rai. Built and marketed Silveri — luxury handcrafted silver jewelry store. Software Developer, Web Developer & Digital Marketer based in Greater Noida.',
    images: [DEV_PHOTO_URL],
  },
};

/** Schema.org Person structured data */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Aditya Kumar Rai',
  alternateName: ['Aditya', 'Aditya Rai', 'Aditya K. Rai'],
  url: `${SITE_URL}/developer`,
  image: DEV_PHOTO_URL,
  jobTitle: ['Software Developer', 'Web Developer', 'Digital Marketer'],
  description:
    'Aditya Kumar Rai (also known as Aditya Rai or Aditya K. Rai) is a Software Developer, Web Developer & Digital Marketer originally from Kushinagar, Uttar Pradesh, now based in Greater Noida. He designed, developed, and marketed Silveri — a luxury handcrafted silver jewelry e-commerce store. View his work, social profiles, and portfolio.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Greater Noida',
    addressRegion: 'Uttar Pradesh',
    addressCountry: 'IN',
  },
  birthPlace: {
    '@type': 'Place',
    name: 'Kushinagar',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kushinagar',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Silveri',
    url: SITE_URL,
  },
  sameAs: [
    'https://www.linkedin.com/in/aditya-k-rai/',
    'https://github.com/aditya-k-rai',
    'https://aditya-k-rai.github.io/P-Website/',
    'https://www.instagram.com/aditya_k_raii',
    'https://www.youtube.com/@Aditya-K-Rai',
    'https://www.facebook.com/MightyAditya',
    'https://www.quora.com/profile/Aditya-Kumar-Rai-51',
    'https://t.me/Mighty_Joker',
  ],
  knowsAbout: [
    'Web Development',
    'React.js',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Firebase',
    'Razorpay Integration',
    'SEO',
    'Digital Marketing',
    'Content Strategy',
    'Local SEO',
    'Schema Markup',
    'E-commerce Development',
  ],
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Inject Schema.org JSON-LD into <head> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  );
}
