'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { signOutUser } from '@/lib/firebase/auth';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, loading } = useAuthContext();
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

  const navLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/category/all', icon: Grid3X3, label: 'Shop' },
    { href: '/custom-jewelry', icon: Sparkles, label: 'Bespoke' },
    { href: '/account/orders', icon: Package, label: 'Orders' },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <>
      {/* SVG Filter for Liquid Glass - rendered once, hidden */}
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
      <header className="liquidGlass-wrapper sticky top-0 z-50 hidden md:block border-b border-silver-200/60">
        <div className="liquidGlass-effect" />
        <div className="liquidGlass-tint" />
        <div className="liquidGlass-shine" />
        <div className="liquidGlass-content max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-silver-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-heading)] text-sm font-bold">S</span>
              </div>
              <span className="font-[family-name:var(--font-heading)] text-xl font-semibold text-silver-900 tracking-tight">
                Silveri
              </span>
            </Link>

            {/* Center Nav */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-silver-900 text-white'
                        : 'text-silver-600 hover:text-silver-900 hover:bg-silver-100'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-silver-100 rounded-full pl-4 pr-3 py-2 w-[220px] lg:w-[260px] focus-within:bg-white focus-within:ring-2 focus-within:ring-silver-300 transition-all">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-sm text-silver-800 flex-1 placeholder:text-silver-400"
                  />
                  <button type="submit">
                    <Search size={16} className="text-silver-500" />
                  </button>
                </div>
              </form>

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

              {/* Profile */}
              {!loading && user ? (
                <div className="flex items-center gap-1.5">
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
                  className="flex items-center gap-2 bg-silver-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-silver-800 transition-colors"
                >
                  <User size={16} />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

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
          {navLinks.map(({ href, icon: Icon, label }) => {
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
