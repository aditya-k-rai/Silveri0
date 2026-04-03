'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Grid3X3,
  Package,
  Heart,
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { signOutUser } from '@/lib/firebase/auth';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname.startsWith('/admin')) {
    return null;
  }
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuthContext();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-silver-800 to-silver-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                Silveri
              </span>
              <span className="text-white text-xs hidden sm:block">Logo</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem href="/" icon={<Home size={20} />} label="Home" />
              <NavItem href="/category/all" icon={<Grid3X3 size={20} />} label="Category" />
              <NavItem href="/account/orders" icon={<Package size={20} />} label="Orders" />
              <NavItem href="/account/wishlist" icon={<Heart size={20} />} label="Wishlist" />
              <NavItem
                href="/checkout"
                icon={<ShoppingCart size={20} />}
                label="Cart"
                badge={cartCount > 0 ? cartCount : undefined}
              />
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 min-w-[200px] lg:min-w-[280px]">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-warm-black flex-1 font-[family-name:var(--font-body)]"
              />
              <Search size={20} className="text-warm-black cursor-pointer" />
            </div>

            {/* Profile / Auth */}
            <div className="hidden md:flex items-center gap-2">
              {!loading && user ? (
                <div className="flex items-center gap-2">
                  <Link href="/account/profile" className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="Profile" width={40} height={40} className="object-cover" />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </Link>
                  <button onClick={() => signOutUser()} className="text-white/70 hover:text-white transition-colors" title="Sign out">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-white/10"
                >
                  <User size={20} className="text-white" />
                </Link>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-3">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search size={22} className="text-white" />
              </button>
              <Link href="/checkout" className="relative">
                <ShoppingCart size={22} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-silver-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X size={24} className="text-white" />
                ) : (
                  <Menu size={24} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-3">
              <div className="flex items-center bg-white rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-warm-black flex-1"
                  autoFocus
                />
                <Search size={18} className="text-warm-black" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-silver-800 border-t border-silver-700">
            <nav className="flex flex-col px-4 py-3 gap-1">
              <MobileNavItem href="/" icon={<Home size={18} />} label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem href="/category/all" icon={<Grid3X3 size={18} />} label="Category" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem href="/account/orders" icon={<Package size={18} />} label="Orders" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem href="/account/wishlist" icon={<Heart size={18} />} label="Wishlist" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem href="/account/profile" icon={<User size={18} />} label="Profile" onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center px-3 py-1 text-white hover:text-silver-300 transition-colors relative"
    >
      <span className="relative">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-2 -right-3 bg-white text-silver-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] mt-0.5">{label}</span>
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-silver-700 rounded-lg transition-colors"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}
