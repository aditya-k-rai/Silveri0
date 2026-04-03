'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/category/all', icon: Grid3X3, label: 'Shop' },
  { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/checkout', icon: ShoppingCart, label: 'Cart' },
  { href: '/account/profile', icon: User, label: 'Account' },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-silver/30 z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 transition-colors ${
                isActive ? 'text-gold' : 'text-muted hover:text-warm-black'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
