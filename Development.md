# Silveri — Development Guide

> Luxury Silver Jewelry E-Commerce Platform
> Built with Next.js 14 (App Router) · Firebase · Razorpay · Tailwind CSS

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Design System](#design-system)
6. [File Reference — What Each File Does](#file-reference)
7. [Firebase Collections](#firebase-collections)
8. [API Routes](#api-routes)
9. [Authentication Flow](#authentication-flow)
10. [Payment Flow (Razorpay)](#payment-flow-razorpay)
11. [State Management](#state-management)
12. [Admin Dashboard](#admin-dashboard)
13. [SEO & Performance](#seo--performance)
14. [Deployment](#deployment)

---

## Tech Stack

| Technology       | Purpose                            |
| ---------------- | ---------------------------------- |
| Next.js 14       | React framework (App Router, SSR)  |
| TypeScript       | Type safety                        |
| Tailwind CSS     | Utility-first styling              |
| Firebase Auth    | Google OAuth login                 |
| Firestore        | NoSQL database                     |
| Firebase Storage | Product images, avatars, banners   |
| Firebase Admin   | Server-side DB access              |
| Razorpay         | Payment gateway (India)            |
| Zustand          | Client-side state (cart, wishlist) |
| Framer Motion    | Animations & transitions           |
| Zod              | Input validation                   |
| React Hook Form  | Form handling                      |
| Lucide React     | Icon library                       |

---

## Project Structure

```
silveri/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (fonts, Header, Footer)
│   ├── page.tsx                # Homepage (Hero, Featured, Explore, New Arrivals)
│   ├── globals.css             # Global styles & CSS variables
│   ├── sitemap.ts              # Auto-generated sitemap for SEO
│   ├── robots.ts               # Robots.txt (blocks /admin, /api, etc.)
│   ├── login/
│   │   └── page.tsx            # Google sign-in page
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx        # Category listing with filters & sort
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail (gallery, tabs, reviews)
│   ├── checkout/
│   │   └── page.tsx            # 3-step checkout wizard
│   ├── order/
│   │   └── [orderId]/
│   │       └── page.tsx        # Order confirmation page
│   ├── account/                # User dashboard (protected)
│   │   ├── layout.tsx          # Sidebar/tab layout
│   │   ├── profile/page.tsx    # Edit name, phone, avatar
│   │   ├── orders/page.tsx     # Order history with status badges
│   │   ├── addresses/page.tsx  # Address CRUD, set default
│   │   └── wishlist/page.tsx   # Saved items, move-to-cart
│   ├── admin/                  # Merchant dashboard (admin-only)
│   │   ├── layout.tsx          # Dark sidebar layout
│   │   ├── page.tsx            # Stats overview
│   │   ├── products/page.tsx   # Product CRUD + image upload
│   │   ├── categories/page.tsx # Category management
│   │   ├── orders/page.tsx     # Order management + status updates
│   │   ├── users/page.tsx      # User list + block/unblock
│   │   ├── promos/page.tsx     # Promo code management
│   │   └── settings/page.tsx   # Hero banners, socials, announcement
│   └── api/                    # Server-side API routes
│       ├── auth/session/
│       │   └── route.ts        # POST: set session cookie, DELETE: clear
│       ├── razorpay/
│       │   ├── create-order/
│       │   │   └── route.ts    # Create Razorpay order server-side
│       │   ├── verify/
│       │   │   └── route.ts    # Verify payment HMAC signature
│       │   └── webhook/
│       │       └── route.ts    # Razorpay webhook handler
│       └── promo/validate/
│           └── route.ts        # Validate promo codes
│
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── Button.tsx          # Primary/outline/ghost variants, loading state
│   │   ├── Input.tsx           # Label, error state, icon prefix
│   │   ├── Badge.tsx           # Status badges (success, warning, danger, gold)
│   │   ├── Modal.tsx           # Framer Motion animated overlay
│   │   ├── Toast.tsx           # Slide-in notifications (success/error/info)
│   │   └── Skeleton.tsx        # Loading placeholder skeletons
│   ├── layout/
│   │   ├── Header.tsx          # Main nav bar (red bg, icons, search, profile)
│   │   ├── Footer.tsx          # Brand, links, newsletter, social icons
│   │   ├── CartDrawer.tsx      # Slide-in cart (right on desktop, bottom on mobile)
│   │   └── MobileNav.tsx       # Fixed bottom nav bar for mobile
│   ├── product/
│   │   ├── ProductCard.tsx     # Product grid card (image, price, hover actions)
│   │   ├── ImageGallery.tsx    # Main image + thumbnails, mobile swipe
│   │   └── ReviewCard.tsx      # Star rating, user name, comment
│   └── admin/
│       ├── AdminLayout.tsx     # Shared admin sidebar component
│       ├── DataTable.tsx       # Reusable table with search & pagination
│       └── StatCard.tsx        # Dashboard metric card (icon, value, trend)
│
├── lib/
│   └── firebase/
│       ├── client.ts           # Firebase client SDK singleton (app, auth, db, storage)
│       ├── admin.ts            # Firebase Admin SDK singleton (adminDb, adminAuth)
│       ├── auth.ts             # signInWithGoogle(), signOutUser()
│       └── storage.ts          # Image upload helpers (products, avatars, banners)
│
├── context/
│   └── AuthContext.tsx          # React context: user state, role, isAdmin
│
├── hooks/
│   ├── useAuth.ts              # Access AuthContext values
│   ├── useCart.ts              # Cart store actions & derived values
│   ├── useWishlist.ts          # Wishlist store actions
│   └── useToast.ts             # Toast notification state
│
├── store/
│   ├── cartStore.ts            # Zustand cart (localStorage persist)
│   └── wishlistStore.ts        # Zustand wishlist (localStorage persist)
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
├── middleware.ts                # Route protection (/account, /admin)
├── next.config.ts              # Images, security headers
├── .env.local                  # Environment variables (NEVER commit)
├── tailwind.config.ts          # Silveri color palette
└── Development.md              # This file
```

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- Firebase project with Firestore, Auth (Google), and Storage enabled
- Razorpay account (test mode is fine for development)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/silveri.git
cd silveri

# Install dependencies
npm install

# Copy and fill in environment variables
# Edit .env.local with your Firebase & Razorpay keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Environment Variables

| Variable                                  | Scope   | Description                                  |
| ----------------------------------------- | ------- | -------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`            | Browser | Firebase web API key                         |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`        | Browser | projectid.firebaseapp.com                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`         | Browser | Firebase project ID                          |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`     | Browser | projectid.appspot.com                        |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Browser | Numeric sender ID                            |
| `NEXT_PUBLIC_FIREBASE_APP_ID`             | Browser | Web app ID                                   |
| `FIREBASE_ADMIN_PROJECT_ID`              | Server  | Same as public project ID                    |
| `FIREBASE_ADMIN_CLIENT_EMAIL`            | Server  | Service account email                        |
| `FIREBASE_ADMIN_PRIVATE_KEY`             | Server  | Service account private key (wrap in quotes) |
| `RAZORPAY_KEY_ID`                        | Server  | Razorpay Key ID (for server-side orders)     |
| `RAZORPAY_KEY_SECRET`                    | Server  | Razorpay Key Secret (NEVER expose)           |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`            | Browser | Same as RAZORPAY_KEY_ID (safe to expose)     |
| `RAZORPAY_WEBHOOK_SECRET`               | Server  | Webhook signature verification secret        |
| `NEXT_PUBLIC_SITE_URL`                   | Browser | https://silveri.in or localhost URL           |

> **Security Rule**: Variables WITHOUT `NEXT_PUBLIC_` prefix are server-only. Never expose `RAZORPAY_KEY_SECRET` or `FIREBASE_ADMIN_PRIVATE_KEY` to the browser.

---

## Design System

### Colors

| Name        | Hex       | Usage                           |
| ----------- | --------- | ------------------------------- |
| Gold        | `#C9A84C` | Primary accent, CTAs, branding  |
| Gold Light  | `#D4B96A` | Hover states                    |
| Gold Dark   | `#8A6E2F` | Active states, dark accents     |
| Cream       | `#FDFAF5` | Background                      |
| Warm Black  | `#1A1A1A` | Text, dark backgrounds          |
| Silver      | `#E8E8E8` | Borders, dividers, muted fills  |
| Muted       | `#7A7585` | Secondary text                  |

### Typography

| Font                | Weight(s)       | Usage                  |
| ------------------- | --------------- | ---------------------- |
| Cormorant Garamond  | 300, 400, 500, 600 | Headings, brand text |
| Jost                | 300, 400, 500   | Body text, UI elements |

### Usage in Code

```tsx
// Heading font
<h1 className="font-[family-name:var(--font-heading)]">Title</h1>

// Body font (default)
<p className="font-[family-name:var(--font-body)]">Text</p>

// Color classes
<div className="bg-cream text-warm-black border-gold">
```

---

## File Reference

### Core Pages

| File | Description |
|------|-------------|
| `app/page.tsx` | **Homepage** — Hero banner (orange gradient), Featured Products grid, Explore by Occasion (Wedding/Gift/Anniversary), New Arrivals, Newsletter CTA |
| `app/login/page.tsx` | **Login** — Centered Google sign-in button, redirects if authenticated |
| `app/category/[slug]/page.tsx` | **Category** — Product grid with sidebar filters (price, material), sort dropdown, breadcrumb |
| `app/product/[slug]/page.tsx` | **Product Detail** — Image gallery, pricing, add-to-cart, wishlist, tabs (description/care/shipping), reviews, related products, JSON-LD SEO |
| `app/checkout/page.tsx` | **Checkout** — 3-step wizard: Address → Review (promo codes) → Payment (Razorpay) |
| `app/order/[orderId]/page.tsx` | **Order Confirmation** — Shows order summary after successful payment |

### Account Pages (Protected — requires login)

| File | Description |
|------|-------------|
| `app/account/layout.tsx` | Sidebar nav (desktop) / tab nav (mobile) |
| `app/account/profile/page.tsx` | Edit name, phone, upload avatar |
| `app/account/orders/page.tsx` | Order history with status badges |
| `app/account/addresses/page.tsx` | Address CRUD with default setting |
| `app/account/wishlist/page.tsx` | Saved items with move-to-cart |

### Admin Pages (Protected — requires admin role)

| File | Description |
|------|-------------|
| `app/admin/layout.tsx` | Dark sidebar with nav links |
| `app/admin/page.tsx` | Stats dashboard (revenue, orders, products, users) |
| `app/admin/products/page.tsx` | Product CRUD with multi-image upload |
| `app/admin/categories/page.tsx` | Category management with drag-to-reorder |
| `app/admin/orders/page.tsx` | Order management with status updates |
| `app/admin/users/page.tsx` | User list with block/unblock |
| `app/admin/promos/page.tsx` | Promo code creation and management |
| `app/admin/settings/page.tsx` | Hero banners, announcement bar, social links |

### Components

| File | Description |
|------|-------------|
| `components/ui/Button.tsx` | Gold primary, outline, ghost variants. Sizes: sm/md/lg. Loading spinner. |
| `components/ui/Input.tsx` | Form input with label, error state, icon prefix |
| `components/ui/Badge.tsx` | Status badges: success (green), warning (amber), danger (red), gold |
| `components/ui/Modal.tsx` | Animated overlay (Framer Motion). Close on backdrop/ESC. |
| `components/ui/Toast.tsx` | Slide-in notifications. Auto-dismiss 4s. |
| `components/ui/Skeleton.tsx` | Pulsing loading placeholders |
| `components/layout/Header.tsx` | Red navbar with logo, nav icons, search bar, profile |
| `components/layout/Footer.tsx` | Dark footer with links, newsletter, social icons |
| `components/layout/CartDrawer.tsx` | Slide-in cart (right desktop / bottom mobile) |
| `components/layout/MobileNav.tsx` | Fixed bottom navigation bar for mobile |
| `components/product/ProductCard.tsx` | Product grid card with hover actions |
| `components/product/ImageGallery.tsx` | Main image + thumbnail navigation |
| `components/product/ReviewCard.tsx` | Star rating display with comment |
| `components/admin/StatCard.tsx` | Dashboard metric card |
| `components/admin/DataTable.tsx` | Reusable table with search/pagination |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/session` | POST | Verify Firebase ID token, set httpOnly session cookie |
| `/api/auth/session` | DELETE | Clear session cookie (logout) |
| `/api/razorpay/create-order` | POST | Create Razorpay order server-side, return order ID |
| `/api/razorpay/verify` | POST | Verify HMAC SHA256 payment signature, create Firestore order |
| `/api/razorpay/webhook` | POST | Handle Razorpay webhook events (payment.captured/failed) |
| `/api/promo/validate` | POST | Validate promo code against Firestore, return discount |

### Libraries & Utilities

| File | Description |
|------|-------------|
| `lib/firebase/client.ts` | Firebase client SDK init (singleton). Exports: `app`, `auth`, `db`, `storage` |
| `lib/firebase/admin.ts` | Firebase Admin SDK init (singleton). Exports: `adminDb`, `adminAuth` |
| `lib/firebase/auth.ts` | `signInWithGoogle()` and `signOutUser()` functions |
| `lib/firebase/storage.ts` | Image upload helpers for products, avatars, categories, banners |
| `context/AuthContext.tsx` | React context tracking user state, role, and admin status |
| `store/cartStore.ts` | Zustand cart with localStorage persistence |
| `store/wishlistStore.ts` | Zustand wishlist with localStorage persistence |
| `middleware.ts` | Next.js middleware protecting `/account/*` and `/admin/*` routes |
| `types/index.ts` | All TypeScript interfaces (Product, Order, User, etc.) |

---

## Firebase Collections

| Collection   | Document Fields | Access |
|-------------|----------------|--------|
| `users`     | name, email, photoURL, phone, role, addresses[], wishlist[], createdAt | User reads own; Admin reads all |
| `products`  | name, slug, description, category, price, comparePrice, stock, material, weight, tags[], images[], isFeatured, isActive, createdAt | Public read; Admin write |
| `categories`| name, slug, description, image, displayOrder, productCount | Public read; Admin write |
| `orders`    | userId, items[], address, total, discount, promoCode, paymentId, razorpayOrderId, status, createdAt | User reads own; Admin reads all; Never deleted |
| `reviews`   | productId, userId, userName, rating, comment, createdAt | Public read; Auth create; Own edit/delete |
| `promos`    | code, type (percentage/fixed), discountValue, minOrder, maxUses, usedCount, expiryDate, isActive | Auth read; Admin write |
| `settings`  | heroImages[], announcementText, showAnnouncement, socialLinks{} | Public read; Admin write |

---

## Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. Firebase `signInWithPopup()` opens Google OAuth
3. On success, client sends `idToken` to `/api/auth/session` (POST)
4. Server verifies token via Firebase Admin SDK
5. Server sets `httpOnly` session cookie
6. `AuthContext` listens to `onAuthStateChanged`, updates user state
7. On first login, auto-creates `/users/{uid}` document with `role: "customer"`
8. Admin role: manually set `role: "admin"` in Firestore Console

---

## Payment Flow (Razorpay)

```
User clicks Pay → Server creates Razorpay Order → Modal opens → User pays
→ Server verifies HMAC signature → Order saved to Firestore → Confirmation
```

1. Client calls `/api/razorpay/create-order` with cart total
2. Server creates Razorpay order using `razorpay` npm package
3. Client opens Razorpay checkout modal with returned order ID
4. After payment, client sends payment details to `/api/razorpay/verify`
5. Server verifies `HMAC SHA256` signature using `RAZORPAY_KEY_SECRET`
6. If valid: creates Firestore order, decrements stock, increments promo usage
7. Redirect to `/order/[orderId]` confirmation page

### Test Cards (Development)

| Method | Value | Notes |
|--------|-------|-------|
| Card | `4111 1111 1111 1111` | Any future expiry, any CVV |
| UPI Success | `success@razorpay` | Always succeeds |
| UPI Failure | `failure@razorpay` | Always fails |

---

## State Management

### Cart (Zustand + localStorage)

```typescript
// Add item to cart
useCart().addItem({ productId, name, price, image, quantity: 1 });

// Remove item
useCart().removeItem(productId);

// Get totals
const { itemCount, subtotal } = useCart();
```

### Wishlist (Zustand + Firestore sync)

```typescript
// Toggle wishlist
useWishlist().addToWishlist(productId);
useWishlist().removeFromWishlist(productId);

// Check if wishlisted
const isWishlisted = useWishlist().isInWishlist(productId);
```

---

## Admin Dashboard

Access: `/admin` (requires `role: "admin"` in Firestore user document)

### Setting yourself as admin:

1. Sign in with Google on the live site
2. Go to Firebase Console → Firestore → `users` collection
3. Find your document (by Google UID)
4. Add field: `role` → string → `admin`
5. Refresh — you now have admin access

### Admin Features:

- **Dashboard**: Revenue, order count, product stats, recent orders
- **Products**: Full CRUD, multi-image upload, featured toggle
- **Categories**: Drag-to-reorder, image upload
- **Orders**: Status management (Pending → Processing → Shipped → Delivered)
- **Users**: View all users, block/unblock
- **Promos**: Create discount codes (% or flat), set limits & expiry
- **Settings**: Hero banners, announcement bar, social media links

---

## SEO & Performance

### Implemented

- `generateMetadata()` on all product and category pages
- JSON-LD structured data on product pages
- Auto-generated `/sitemap.xml` from Firestore slugs
- `/robots.txt` blocking admin, account, API, checkout routes
- OpenGraph metadata for social sharing
- Next.js `Image` component with responsive `sizes` prop
- Fonts loaded via `next/font` (zero CLS)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### Performance Targets (Lighthouse)

| Metric          | Target |
|----------------|--------|
| Performance    | 90+    |
| SEO            | 95+    |
| Accessibility  | 90+    |
| Best Practices | 100    |

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel → Project Settings → Environment Variables
4. Add custom domain in Vercel → Domains tab
5. Update Firebase Authorized Domains to include your Vercel URL
6. Update Razorpay webhook URL to production domain
7. Paste Firestore Security Rules into Firebase Console → Firestore → Rules

### Going Live with Razorpay

1. Complete KYC on Razorpay dashboard
2. Switch to Live mode
3. Generate Live API keys
4. Replace test keys in Vercel environment variables
5. Update webhook URL to production domain
6. Make a real ₹1 test payment to verify

---

## Security Checklist

- [x] Razorpay signature verified server-side (HMAC SHA256)
- [x] Admin routes double-protected (middleware + Firestore rules)
- [x] Firebase Admin private key — server only, never in browser
- [x] Razorpay Key Secret — server only
- [x] API inputs validated with Zod
- [x] Rate limiting on payment APIs
- [x] Security headers configured in next.config.ts
- [x] No `dangerouslySetInnerHTML` with user content

---

*Built with Next.js 14 · Firebase · Razorpay · Tailwind CSS*
