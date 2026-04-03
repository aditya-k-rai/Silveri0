'use client';

import Link from 'next/link';
import { Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-warm-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gold mb-4">
              Silveri
            </h3>
            <p className="text-silver text-sm leading-relaxed">
              Exquisite handcrafted silver jewelry for every occasion. Discover
              timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/category/all" label="All Collections" />
              <FooterLink href="/category/rings" label="Rings" />
              <FooterLink href="/category/necklaces" label="Necklaces" />
              <FooterLink href="/category/earrings" label="Earrings" />
              <FooterLink href="/category/bracelets" label="Bracelets" />
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/account/orders" label="Track Order" />
              <FooterLink href="/account/profile" label="My Account" />
              <FooterLink href="/account/wishlist" label="Wishlist" />
              <FooterLink href="#" label="Shipping Info" />
              <FooterLink href="#" label="Returns & Exchange" />
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Newsletter
            </h4>
            <p className="text-silver text-sm mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded px-3 py-2 text-sm text-white placeholder-muted outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-gold text-warm-black px-4 py-2 rounded text-sm font-medium hover:bg-gold-light transition-colors"
              >
                Join
              </button>
            </form>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-silver hover:text-gold transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-silver hover:text-gold transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-silver hover:text-gold transition-colors">
                <Phone size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2A2A2A] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} Silveri. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted text-xs">
            <Link href="#" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-silver text-sm hover:text-gold transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
