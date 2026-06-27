'use client';

/**
 * Developer Credit & Profile Page — /developer
 *
 * Credits Aditya Kumar Rai who built and marketed Silveri.
 * - Framer Motion scroll-triggered animations (matching site pattern — whileInView, once: true)
 * - Tailwind CSS v4 design tokens — matches Silveri brand exactly (gold/silver/cream)
 * - All 8 social platforms with brand hover glows
 * - Fully accessible (aria-labels, sr-only SEO span, semantic heading hierarchy)
 * - next/image NOT used for GIF (Next.js doesn't animate GIFs in Image component)
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

const DEV = {
  name: 'Aditya Kumar Rai',
  nickname: 'Aditya',
  aka: 'Aditya Rai or Aditya K. Rai',
  city: 'Greater Noida',
  hometown: 'Kushinagar',
  state: 'Uttar Pradesh',
  roles: ['Software Developer', 'Web Developer', 'Digital Marketer'] as const,
  pronounHe: 'He',
  bio: 'Aditya Kumar Rai (also known as Aditya Rai or Aditya K. Rai) is a Software Developer, Web Developer, and Digital Marketer originally from Kushinagar, Uttar Pradesh, now based in Greater Noida. He designed, developed, and marketed Silveri from the ground up — architecting the full-stack Next.js storefront, Firebase backend, Razorpay payment integration, and end-to-end SEO strategy that drives organic discovery.',
  photoGif: '/images/Developer Aditya Kumar Rai Image .gif',
  photoAlt: 'Aditya Kumar Rai (Aditya Rai / Aditya K. Rai) — Software Developer, Web Developer & Digital Marketer in Greater Noida',
  social: {
    LinkedIn:  'https://www.linkedin.com/in/aditya-k-rai/',
    GitHub:    'https://github.com/aditya-k-rai',
    Portfolio: 'https://aditya-k-rai.github.io/P-Website/',
    Instagram: 'https://www.instagram.com/aditya_k_raii',
    YouTube:   'https://www.youtube.com/@Aditya-K-Rai',
    Facebook:  'https://www.facebook.com/MightyAditya',
    Quora:     'https://www.quora.com/profile/Aditya-Kumar-Rai-51',
    Telegram:  'https://t.me/Mighty_Joker',
  },
} as const;

const SITE_NAME = 'Silveri';

/* ─────────────────────────────────────────────────────────────────────────────
   WHAT HE BUILT
───────────────────────────────────────────────────────────────────────────── */

const BUILT_CARDS = [
  {
    icon: '⚡',
    title: 'Full-Stack Next.js Storefront',
    desc: 'Built the entire Silveri web application using Next.js 16 App Router with TypeScript and React 19, delivering server-side rendered HTML for every product and category page — improving LCP, enabling crawlability, and eliminating JavaScript-dependent page loads.',
  },
  {
    icon: '🎨',
    title: 'UI/UX Design & Brand System',
    desc: 'Designed the complete brand identity from scratch — Cormorant Garamond headings, Jost body font, a gold-silver-cream palette, glassmorphism cards, Framer Motion scroll animations, and a fully responsive mobile-first layout with a sticky header and mobile navigation drawer.',
  },
  {
    icon: '🔥',
    title: 'Firebase Backend & Admin Panel',
    desc: 'Architected the Firestore schema for products, orders, users, and site settings. Built a full admin panel with real-time inventory management, order status updates, announcement bar control, and Firebase Storage uploads for hero banners and product images.',
  },
  {
    icon: '💳',
    title: 'Razorpay Payment Integration',
    desc: 'Integrated Razorpay end-to-end: server-side order creation API, secure checkout modal with order pre-fill, webhook verification using HMAC-SHA256 signature validation, and automatic order fulfilment triggered on successful payment events.',
  },
  {
    icon: '🛒',
    title: 'E-Commerce Feature Set',
    desc: 'Implemented persistent cart with Zustand, wishlist, promo code engine, guest checkout, Google Sign-In via Firebase Auth, order history with tracking, address management, real-time stock updates from Firestore subscriptions, and size/variant selection.',
  },
  {
    icon: '🔐',
    title: 'Security & Performance Hardening',
    desc: 'Configured strict Content-Security-Policy, HSTS, X-Frame-Options, and Referrer-Policy headers. Implemented AVIF/WebP image optimisation, lazy loading, tree-shaking for icon and animation libraries, source-map stripping in production, and Vercel Edge CDN deployment.',
  },
] as const;

const TECH_STACK = [
  'Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4',
  'Framer Motion', 'Firebase Firestore', 'Firebase Auth',
  'Firebase Storage', 'Firebase Admin SDK', 'Razorpay',
  'Zustand', 'Vercel', 'Google Tag Manager', 'Lucide React',
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   HOW HE MARKETED
───────────────────────────────────────────────────────────────────────────── */

const MARKETED_CARDS = [
  {
    icon: '🗺️',
    title: 'Technical SEO Foundation',
    desc: 'Implemented Schema.org structured data (Organization, Product, BreadcrumbList, Person), dynamic XML sitemap generation via Next.js sitemap API with Firestore product URLs, robots.ts, canonical tags, and Open Graph / Twitter Card meta on every page using the App Router metadata export system.',
  },
  {
    icon: '📍',
    title: 'Keyword & Category SEO',
    desc: 'Researched and targeted high-intent jewelry queries — "handcrafted silver jewelry India", "silver rings online", "silver necklaces for women" — with optimised <title>, meta descriptions, and H1/H2 heading hierarchies across all product and category pages for maximum organic visibility.',
  },
  {
    icon: '🚀',
    title: 'Core Web Vitals Optimisation',
    desc: 'Achieved strong CWV scores by server-rendering the hero and product grids (LCP improvement), using next/image with AVIF/WebP formats, eliminating render-blocking scripts, setting 1-year cache TTL for images, and deploying on Vercel\'s Edge Network for global sub-50ms TTFB.',
  },
  {
    icon: '📊',
    title: 'Analytics & Search Console Setup',
    desc: 'Configured Google Tag Manager with correct head-placement (verified by Google Merchant Center), integrated Vercel Analytics for real-user performance data, and set up Google Search Console and Merchant Center for product listing eligibility and organic click-through tracking.',
  },
] as const;

const SEO_KEYWORDS = [
  'silver jewelry India',
  'handcrafted silver rings',
  'luxury silver necklaces',
  'silver earrings online',
  'silver bracelets women',
  'custom silver jewelry',
  'jewelry e-commerce India',
  'Schema.org jewelry markup',
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   SOCIAL PLATFORMS
───────────────────────────────────────────────────────────────────────────── */

interface SocialPlatform {
  name: string;
  handle: string;
  url: string;
  iconColor: string;
  bgTint: string;
  borderTint: string;
  icon: React.ReactNode;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'LinkedIn',
    handle: 'aditya-k-rai',
    url: DEV.social.LinkedIn,
    iconColor: '#0A66C2',
    bgTint: 'rgba(10,102,194,0.06)',
    borderTint: 'rgba(10,102,194,0.22)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: 'GitHub',
    handle: 'aditya-k-rai',
    url: DEV.social.GitHub,
    iconColor: '#374151',
    bgTint: 'rgba(55,65,81,0.05)',
    borderTint: 'rgba(55,65,81,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    name: 'Portfolio',
    handle: 'aditya-k-rai.github.io',
    url: DEV.social.Portfolio,
    iconColor: '#C9A84C',
    bgTint: 'rgba(201,168,76,0.07)',
    borderTint: 'rgba(201,168,76,0.28)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    handle: '@aditya_k_raii',
    url: DEV.social.Instagram,
    iconColor: '#E1306C',
    bgTint: 'rgba(225,48,108,0.05)',
    borderTint: 'rgba(225,48,108,0.20)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    handle: '@Aditya-K-Rai',
    url: DEV.social.YouTube,
    iconColor: '#FF0000',
    bgTint: 'rgba(255,0,0,0.04)',
    borderTint: 'rgba(255,0,0,0.18)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'MightyAditya',
    url: DEV.social.Facebook,
    iconColor: '#1877F2',
    bgTint: 'rgba(24,119,242,0.05)',
    borderTint: 'rgba(24,119,242,0.20)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Quora',
    handle: 'Aditya-Kumar-Rai-51',
    url: DEV.social.Quora,
    iconColor: '#B92B27',
    bgTint: 'rgba(185,43,39,0.05)',
    borderTint: 'rgba(185,43,39,0.20)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.162 0 4.218-.583 5.998-1.614l-1.57-2.31C15.242 20.61 13.66 21 12 21c-4.962 0-9-4.038-9-9s4.038-9 9-9 9 4.038 9 9c0 1.453-.347 2.824-.962 4.035l1.565 2.306A11.943 11.943 0 0024 12C24 5.373 18.627 0 12 0zm1.35 16.57l-2.13-3.13C12.81 13.05 13.5 12.1 13.5 11c0-1.654-1.346-3-3-3s-3 1.346-3 3 1.346 3 3 3c.41 0 .8-.08 1.16-.22l2.06 3.03C13.23 16.93 12.63 17 12 17c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5c0 1.73-.892 3.25-2.234 4.13L13.35 16.57z"/>
      </svg>
    ),
  },
  {
    name: 'Telegram',
    handle: 'Mighty_Joker',
    url: DEV.social.Telegram,
    iconColor: '#2AABEE',
    bgTint: 'rgba(42,171,238,0.05)',
    borderTint: 'rgba(42,171,238,0.20)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS — matching site's Framer Motion pattern
───────────────────────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function DeveloperPage() {
  return (
    <div className="bg-silver-50 min-h-screen font-[family-name:var(--font-body)]">

      {/* Screen-reader SEO anchor — visible to crawlers, invisible to users */}
      <span
        style={{
          position: 'absolute', width: '1px', height: '1px',
          padding: 0, margin: '-1px', overflow: 'hidden',
          clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0,
        }}
      >
        Aditya Kumar Rai (also known as Aditya Rai or Aditya K. Rai) — Software Developer in Greater Noida, Web Developer in Greater Noida,
        Digital Marketer in Greater Noida. Originally from Kushinagar, Uttar Pradesh.
        Developed and marketed Silveri luxury silver jewelry website.
      </span>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-silver-100 via-white to-silver-200 overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">

        {/* Background decorative gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(201,168,76,0.09), transparent)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(201,168,76,0.06), transparent)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-silver-500 hover:text-gold-dark transition-colors mb-10 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Silveri
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* ── Photo ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 relative"
            >
              {/* Spinning gold conic ring */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, #C9A84C 0%, #D4B96A 25%, #F0DFA0 50%, #8A6E2F 75%, #C9A84C 100%)',
                  animation: 'devRingSpin 9s linear infinite',
                  zIndex: 0,
                }}
              />
              {/* White gap ring */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '-1px',
                  borderRadius: '50%',
                  background: 'white',
                  zIndex: 1,
                }}
              />
              {/* Photo */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: 192,
                  height: 192,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid white',
                  boxShadow: '0 8px 40px rgba(201,168,76,0.25), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DEV.photoGif}
                  alt={DEV.photoAlt}
                  width={192}
                  height={192}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              {/* Glow beneath */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(201,168,76,0.35), transparent 70%)',
                  filter: 'blur(16px)',
                  zIndex: 0,
                  opacity: 0.6,
                }}
              />
            </motion.div>

            {/* ── Text column ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center md:text-left"
            >
              <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-silver-500 mb-3">
                Developer Profile
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-medium text-silver-900 leading-tight mb-2"
              >
                {DEV.name}
              </motion.h1>

              {/* Nickname / Also known as */}
              <motion.p
                variants={fadeUp}
                className="text-silver-500 text-sm md:text-base font-normal mb-5 italic"
              >
                Nickname: <span className="text-silver-800 font-medium">Aditya</span> · Also known as{' '}
                <span className="text-silver-800 font-medium">Aditya Rai</span> or{' '}
                <span className="text-silver-800 font-medium">Aditya K. Rai</span>
              </motion.p>

              {/* Role badges */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {DEV.roles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-white border border-silver-200 rounded-full text-xs font-medium text-silver-700 shadow-sm"
                  >
                    {role}
                  </span>
                ))}
              </motion.div>

              {/* Location */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 justify-center md:justify-start text-silver-500 text-sm mb-5">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: '#C9A84C' }} />
                  <span>{DEV.city}, {DEV.state}, India</span>
                </span>
                <span className="hidden sm:inline text-silver-300">·</span>
                <span className="text-silver-400 text-xs">Originally from {DEV.hometown}</span>
              </motion.div>

              {/* Bio */}
              <motion.p variants={fadeUp} className="text-silver-600 text-sm md:text-base leading-relaxed max-w-xl mb-7">
                {DEV.bio}
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  id="dev-hero-portfolio"
                  href={DEV.social.Portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${DEV.name} — View Portfolio`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-silver-900 text-white hover:bg-silver-800 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ boxShadow: '0 4px 16px rgba(24,24,27,0.12)' }}
                >
                  View Portfolio <ExternalLink size={13} />
                </a>
                <a
                  id="dev-hero-linkedin"
                  href={DEV.social.LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${DEV.name} on LinkedIn`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-white text-silver-800 border border-silver-300 hover:border-silver-400 hover:bg-silver-50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  LinkedIn <ExternalLink size={13} />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT HE BUILT
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4">

          <SectionHeader
            label={`${SITE_NAME} Development`}
            title={`What ${DEV.pronounHe} Built for ${SITE_NAME}`}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
          >
            {BUILT_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={scaleIn}
                className="bg-silver-50 rounded-2xl border border-silver-200 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: 'rgba(228,228,231,1)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(228,228,231,1)';
                }}
              >
                <div className="text-2xl mb-3" aria-hidden="true">{card.icon}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-silver-600 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech stack pills */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.25em] text-silver-500 mb-4">
              Tech Stack Used
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(201,168,76,0.09)',
                    border: '1px solid rgba(201,168,76,0.28)',
                    color: '#8A6E2F',
                  }}
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW HE MARKETED
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-silver-50">
        <div className="max-w-5xl mx-auto px-4">

          <SectionHeader
            label="Digital Marketing & SEO"
            title={`How ${DEV.pronounHe} Marketed ${SITE_NAME}`}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
          >
            {MARKETED_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={scaleIn}
                className="bg-white rounded-2xl border border-silver-200 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-silver-300"
              >
                <div className="text-2xl mb-3" aria-hidden="true">{card.icon}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-silver-600 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* SEO keyword pills */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.25em] text-silver-500 mb-4">
              Keywords Targeted
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center">
              {SEO_KEYWORDS.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 bg-silver-100 border border-silver-200 rounded-full text-xs font-medium text-silver-600"
                >
                  {kw}
                </span>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL MEDIA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] font-medium mb-3" style={{ color: '#C9A84C' }}>
              Connect
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-medium text-silver-900 mb-3">
              Find {DEV.nickname} Online
            </motion.h2>
            <motion.p variants={fadeUp} className="text-silver-500 text-sm mb-5">
              Software Developer · Web Developer · Digital Marketer — Greater Noida
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mx-auto w-16 h-px"
              style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }}
              aria-hidden="true"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {socialPlatforms.map((platform) => (
              <SocialCard key={platform.name} platform={platform} devName={DEV.name} />
            ))}
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SEO FOOTER CREDIT (inside page, above global footer)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-7 bg-silver-100 border-t border-silver-200">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEV.photoGif}
            alt={DEV.name}
            width={36}
            height={36}
            className="rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
          <div>
            <p className="text-silver-500 text-xs font-semibold mb-0.5">{DEV.name}</p>
            <p className="text-silver-400 text-[11px] leading-snug">
              Software Developer in Greater Noida · Web Developer in Greater Noida · Digital Marketer in Greater Noida.{' '}
              Nickname / Also known as: Aditya Rai or Aditya K. Rai.{' '}
              Originally from {DEV.hometown}, Uttar Pradesh.{' '}
              {SITE_NAME} website developed &amp; marketed by {DEV.name}.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Ring spin keyframe */}
      <style>{`
        @keyframes devRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER — reusable
───────────────────────────────────────────────────────────────────────────── */

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className="text-center mb-14"
    >
      <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] font-medium mb-3" style={{ color: '#C9A84C' }}>
        {label}
      </motion.p>
      <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-medium text-silver-900 mb-4">
        {title}
      </motion.h2>
      <motion.div
        variants={fadeUp}
        className="mx-auto w-16 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOCIAL CARD
───────────────────────────────────────────────────────────────────────────── */

function SocialCard({ platform, devName }: { platform: SocialPlatform; devName: string }) {
  return (
    <motion.a
      variants={scaleIn}
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${devName} on ${platform.name}`}
      title={`${devName} — ${platform.name}`}
      className="group relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: platform.bgTint,
        borderColor: platform.borderTint,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = `0 8px 24px ${platform.borderTint}, 0 0 0 1px ${platform.iconColor}25`;
        el.style.borderColor = `${platform.iconColor}50`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = '';
        el.style.borderColor = platform.borderTint;
      }}
    >
      <div
        className="transition-transform duration-300 group-hover:scale-110"
        style={{ color: platform.iconColor }}
      >
        {platform.icon}
      </div>
      <span className="font-semibold text-sm text-silver-900 leading-none">{platform.name}</span>
      <span className="text-silver-500 text-[11px] leading-none truncate max-w-full px-1 text-center">
        {platform.handle}
      </span>
    </motion.a>
  );
}
