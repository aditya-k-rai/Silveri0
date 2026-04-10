'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { fetchRecentRates } from '@/lib/firebase/marketRates';
import {
  Home,
  Grid3X3,
  Package,
  Heart,
  ShoppingCart,
  Search,
  User,
  X,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { signOutUser } from '@/lib/firebase/auth';
import { useCartStore } from '@/store/cartStore';

interface SubCategory {
  title: string;
  links: { label: string; href: string }[];
}

interface CategoryNav {
  label: string;
  href: string;
  mega?: SubCategory[];
}

const CATEGORIES: CategoryNav[] = [
  {
    label: 'Earrings',
    href: '/category/earrings',
    mega: [
      { title: 'Featured', links: [
        { label: 'New Arrivals', href: '/category/new-arrivals?type=earrings' },
        { label: 'Best Sellers', href: '/category/earrings?sort=popular' },
        { label: 'All Earrings', href: '/category/earrings' },
      ]},
      { title: 'Style', links: [
        { label: 'Studs', href: '/category/earrings?style=studs' },
        { label: 'Drops', href: '/category/earrings?style=drops' },
        { label: 'Hoops', href: '/category/earrings?style=hoops' },
        { label: 'Jhumkas', href: '/category/earrings?style=jhumkas' },
      ]},
      { title: 'Purity', links: [
        { label: '92.5 Sterling', href: '/category/earrings?purity=925' },
        { label: '99.9 Fine', href: '/category/earrings?purity=999' },
      ]},
      { title: 'Price', links: [
        { label: 'Under ₹1,000', href: '/category/earrings?maxPrice=1000' },
        { label: 'Under ₹2,000', href: '/category/earrings?maxPrice=2000' },
        { label: 'Under ₹5,000', href: '/category/earrings?maxPrice=5000' },
        { label: 'Above ₹5,000', href: '/category/earrings?minPrice=5000' },
      ]},
    ],
  },
  {
    label: 'Rings',
    href: '/category/rings',
    mega: [
      { title: 'Featured', links: [
        { label: 'New Arrivals', href: '/category/new-arrivals?type=rings' },
        { label: 'Best Sellers', href: '/category/rings?sort=popular' },
        { label: 'All Rings', href: '/category/rings' },
      ]},
      { title: 'Style', links: [
        { label: 'Band Rings', href: '/category/rings?style=band' },
        { label: 'Statement', href: '/category/rings?style=statement' },
        { label: 'Stackable', href: '/category/rings?style=stackable' },
        { label: 'Adjustable', href: '/category/rings?style=adjustable' },
      ]},
      { title: 'Occasion', links: [
        { label: 'Everyday', href: '/category/rings?occasion=everyday' },
        { label: 'Wedding', href: '/category/rings?occasion=wedding' },
        { label: 'Party', href: '/category/rings?occasion=party' },
      ]},
      { title: 'Price', links: [
        { label: 'Under ₹1,000', href: '/category/rings?maxPrice=1000' },
        { label: 'Under ₹2,000', href: '/category/rings?maxPrice=2000' },
        { label: 'Under ₹5,000', href: '/category/rings?maxPrice=5000' },
      ]},
    ],
  },
  {
    label: 'Bracelets & Bangles',
    href: '/category/bracelets',
    mega: [
      { title: 'Featured', links: [
        { label: 'New Arrivals', href: '/category/new-arrivals?type=bracelets' },
        { label: 'Best Sellers', href: '/category/bracelets?sort=popular' },
        { label: 'All Bracelets', href: '/category/bracelets' },
      ]},
      { title: 'Style', links: [
        { label: 'Chain Bracelets', href: '/category/bracelets?style=chain' },
        { label: 'Cuff Bangles', href: '/category/bracelets?style=cuff' },
        { label: 'Charm Bracelets', href: '/category/bracelets?style=charm' },
      ]},
      { title: 'Price', links: [
        { label: 'Under ₹2,000', href: '/category/bracelets?maxPrice=2000' },
        { label: 'Under ₹5,000', href: '/category/bracelets?maxPrice=5000' },
        { label: 'Above ₹5,000', href: '/category/bracelets?minPrice=5000' },
      ]},
    ],
  },
  {
    label: 'Necklaces & Pendants',
    href: '/category/necklaces',
    mega: [
      { title: 'Featured', links: [
        { label: 'New Arrivals', href: '/category/new-arrivals?type=necklaces' },
        { label: 'Best Sellers', href: '/category/necklaces?sort=popular' },
        { label: 'All Necklaces', href: '/category/necklaces' },
      ]},
      { title: 'Style', links: [
        { label: 'Chains', href: '/category/necklaces?style=chain' },
        { label: 'Pendants', href: '/category/pendants' },
        { label: 'Chokers', href: '/category/necklaces?style=choker' },
        { label: 'Layered', href: '/category/necklaces?style=layered' },
      ]},
      { title: 'Price', links: [
        { label: 'Under ₹2,000', href: '/category/necklaces?maxPrice=2000' },
        { label: 'Under ₹5,000', href: '/category/necklaces?maxPrice=5000' },
        { label: 'Above ₹5,000', href: '/category/necklaces?minPrice=5000' },
      ]},
    ],
  },
  {
    label: 'Anklets',
    href: '/category/anklets',
    mega: [
      { title: 'Featured', links: [
        { label: 'New Arrivals', href: '/category/new-arrivals?type=anklets' },
        { label: 'All Anklets', href: '/category/anklets' },
      ]},
      { title: 'Style', links: [
        { label: 'Chain Anklets', href: '/category/anklets?style=chain' },
        { label: 'Charm Anklets', href: '/category/anklets?style=charm' },
        { label: 'Traditional', href: '/category/anklets?style=traditional' },
      ]},
    ],
  },
  { label: 'Silver', href: '/category/all' },
  { label: 'New Arrivals', href: '/category/new-arrivals' },
  { label: 'Bespoke', href: '/custom-jewelry' },
];

const mobileNavLinks = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/category/all', icon: Grid3X3, label: 'Shop' },
  { href: '/custom-jewelry', icon: Sparkles, label: 'Bespoke' },
  { href: '/account/orders', icon: Package, label: 'Orders' },
  { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [silverRate, setSilverRate] = useState<number | null>(null);
  const { user, loading } = useAuthContext();

  useEffect(() => {
    let cancelled = false;
    fetchRecentRates(1)
      .then((rates) => {
        if (cancelled) return;
        const latest = rates[rates.length - 1];
        if (latest?.silverRate) setSilverRate(latest.silverRate);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname.startsWith('/admin')) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Breadcrumb detection
  const isCategory = pathname.startsWith('/category/');
  const categorySlug = isCategory ? pathname.split('/category/')[1] : null;
  const categoryLabel = categorySlug
    ? CATEGORIES.find((c) => c.href === `/category/${categorySlug}`)?.label || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <>
      {/* SVG Filter for Liquid Glass */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* ===== DESKTOP HEADER ===== */}
      <div className="sticky top-0 z-50 hidden md:block">
        {/* ── Top Bar ── */}
        <header className="liquidGlass-wrapper border-b border-silver-200/60">
          <div className="liquidGlass-effect" />
          <div className="liquidGlass-tint" />
          <div className="liquidGlass-shine" />
          <div className="liquidGlass-content max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-[68px] gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-silver-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-[family-name:var(--font-heading)] text-base font-bold">S</span>
                </div>
                <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-silver-900 tracking-tight">
                  Silveri
                </span>
              </Link>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                <div className="flex items-center bg-silver-100 rounded-full px-5 py-2.5 gap-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-silver-300 focus-within:shadow-sm transition-all">
                  <Search size={18} className="text-silver-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for Silver Jewellery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-sm text-silver-800 flex-1 placeholder:text-silver-400"
                  />
                </div>
              </form>

              {/* Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Silver Price Badge (display-only) */}
                <div
                  className="hidden lg:flex items-center gap-2 px-4 py-2 border border-silver-200 rounded-full mr-1 select-none"
                  title="Today's silver price per gram"
                >
                  <span className="text-sm font-medium text-silver-700">Silver Price</span>
                  <span className="text-sm font-semibold text-silver-900 tabular-nums">
                    {silverRate
                      ? `₹${silverRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/g`
                      : '—'}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold">₹</span>
                </div>

                {/* Wishlist */}
                <Link
                  href="/account/wishlist"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-silver-100 transition-colors"
                  title="Wishlist"
                >
                  <Heart size={20} className="text-silver-700" />
                </Link>

                {/* Cart */}
                <Link
                  href="/checkout"
                  className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-silver-100 transition-colors"
                >
                  <ShoppingCart size={20} className="text-silver-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile / Login */}
                {!loading && user ? (
                  <div className="flex items-center gap-1">
                    <Link
                      href="/account/profile"
                      className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-silver-200 hover:border-gold transition-colors"
                    >
                      {user.photoURL ? (
                        <Image src={user.photoURL} alt="Profile" width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-silver-100 flex items-center justify-center">
                          <User size={18} className="text-silver-600" />
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={() => signOutUser()}
                      className="flex items-center justify-center w-9 h-9 rounded-full text-silver-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-silver-700 hover:text-silver-900 px-3 py-2 rounded-full hover:bg-silver-100 transition-colors"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Category Navigation Bar with Mega Menu ── */}
        <nav className="bg-silver-900 relative" onMouseLeave={() => setHoveredCategory(null)}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center gap-0 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const isActive = pathname === cat.href || hoveredCategory === cat.label;
                return (
                  <div
                    key={cat.href}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(cat.mega ? cat.label : null)}
                  >
                    <Link
                      href={cat.href}
                      className={`block px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-gold'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {cat.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mega Dropdown ── */}
          {hoveredCategory && (() => {
            const cat = CATEGORIES.find((c) => c.label === hoveredCategory);
            if (!cat?.mega) return null;
            return (
              <div
                className="absolute left-0 right-0 top-full z-50 bg-white border-b border-silver-200 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                  {/* Subcategory Columns */}
                  <div className="flex-1 grid grid-cols-4 gap-8">
                    {cat.mega.map((section) => (
                      <div key={section.title}>
                        <h4 className="text-sm font-bold text-gold mb-3 tracking-wide">
                          {section.title}
                        </h4>
                        <div className="space-y-2">
                          {section.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setHoveredCategory(null)}
                              className="block text-sm text-silver-600 hover:text-silver-900 hover:translate-x-0.5 transition-all"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Image */}
                  <div className="w-[260px] shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-2xl font-[family-name:var(--font-heading)] font-bold text-silver-900 leading-tight mb-2">
                      NEW IN<br />
                      <span className="text-gold">SILVER</span>
                    </p>
                    <p className="text-xs text-silver-500 mb-4">
                      Explore the latest {cat.label.toLowerCase()} collection
                    </p>
                    <Link
                      href={cat.href}
                      onClick={() => setHoveredCategory(null)}
                      className="px-5 py-2 bg-silver-900 text-white text-xs font-semibold rounded-full hover:bg-black transition-colors tracking-wider uppercase"
                    >
                      Explore Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </nav>

        {/* ── Breadcrumb Bar (on category pages) ── */}
        {isCategory && categoryLabel && (
          <div className="bg-silver-50 border-b border-silver-200/60">
            <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-silver-500">
                <Link href="/" className="hover:text-silver-700 transition-colors">Home</Link>
                <ChevronRight size={14} />
                <Link href="/category/all" className="hover:text-silver-700 transition-colors">Shop</Link>
                <ChevronRight size={14} />
                <span className="text-silver-900 font-medium">{categoryLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MOBILE HEADER ===== */}
      <header className="liquidGlass-wrapper sticky top-0 z-50 md:hidden border-b border-silver-200/60">
        <div className="liquidGlass-effect" />
        <div className="liquidGlass-tint" />
        <div className="liquidGlass-shine" />
        <div className="liquidGlass-content flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-silver-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-[family-name:var(--font-heading)] text-xs font-bold">S</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
              Silveri
            </span>
          </Link>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-silver-100 transition-colors"
            >
              <Search size={20} className="text-silver-700" />
            </button>
            <Link href="/checkout" className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-silver-100 transition-colors">
              <ShoppingCart size={20} className="text-silver-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {!loading && user ? (
              <Link
                href="/account/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-silver-200"
              >
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" width={36} height={36} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-silver-100 flex items-center justify-center">
                    <User size={16} className="text-silver-600" />
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login" className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-silver-100 transition-colors">
                <User size={18} className="text-silver-700" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE SEARCH OVERLAY ===== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden">
          <div className="flex items-center gap-3 px-4 h-14 border-b border-silver-200">
            <form onSubmit={handleSearch} className="flex-1 flex items-center bg-silver-100 rounded-xl px-4 py-2.5">
              <Search size={18} className="text-silver-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-silver-800 flex-1"
                autoFocus
              />
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-silver-100 transition-colors shrink-0"
            >
              <X size={20} className="text-silver-600" />
            </button>
          </div>
        </div>
      )}

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="liquidGlass-wrapper fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-silver-200/60 safe-area-bottom">
        <div className="liquidGlass-effect" />
        <div className="liquidGlass-tint" />
        <div className="liquidGlass-shine" />
        <div className="liquidGlass-content flex items-center justify-around h-16 px-2">
          {mobileNavLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-gold' : 'text-silver-400'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-gold' : ''} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer for mobile bottom bar */}
      <div className="h-16 md:hidden" />
    </>
  );
}
