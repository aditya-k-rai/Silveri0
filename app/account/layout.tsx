"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Loader2, Star } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/account/profile", label: "Profile", icon: <User size={18} /> },
  { href: "/account/orders", label: "Orders", icon: <Package size={18} /> },
  { href: "/account/addresses", label: "Addresses", icon: <MapPin size={18} /> },
  { href: "/account/wishlist", label: "Wishlist", icon: <Heart size={18} /> },
  { href: "/account/reviews", label: "Reviews", icon: <Star size={18} /> },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userDoc, loading } = useAuthContext();

  const isAdmin = userDoc?.role === 'admin';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Redirect admins to admin panel — they shouldn't use the customer account
    if (!loading && isAdmin) {
      router.push('/admin');
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!user || isAdmin) return null;

  const displayName = userDoc?.name || user.displayName || 'User';
  const displayEmail = userDoc?.email || user.email || '';
  const photoURL = userDoc?.photoURL || user.photoURL || '';

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-[family-name:var(--font-heading)] font-semibold text-warm-black mb-8">My Account</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white border border-silver/40 rounded-2xl p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              {photoURL ? (
                <Image
                  src={photoURL}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                  <User size={28} className="text-gold" />
                </div>
              )}
              <span className="font-[family-name:var(--font-heading)] font-semibold text-lg text-center">
                {displayName}
              </span>
              <span className="text-xs text-muted">{displayEmail}</span>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-gold/10 text-gold"
                        : "text-muted hover:text-warm-black hover:bg-silver/20"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile horizontal tabs */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4">
          <nav className="flex gap-2 min-w-max pb-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-gold text-white"
                      : "bg-white border border-silver/40 text-muted hover:text-warm-black"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </section>
  );
}
