'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-silver-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-2xl text-silver-200 mb-4">
              Silveri
            </h3>
            <p className="text-silver-400 text-sm leading-relaxed">
              Exquisite handcrafted silver jewelry for every occasion. Discover
              timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-silver-300 mb-4">
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
            <h4 className="font-semibold text-sm uppercase tracking-wider text-silver-300 mb-4">
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
            <h4 className="font-semibold text-sm uppercase tracking-wider text-silver-300 mb-4">
              Newsletter
            </h4>
            <p className="text-silver-400 text-sm mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-silver-800 border border-silver-700 rounded px-3 py-2 text-sm text-white placeholder-silver-500 outline-none focus:border-silver-400 transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-silver-900 px-4 py-2 rounded text-sm font-medium hover:bg-silver-100 transition-colors"
              >
                Join
              </button>
            </form>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-silver-400 hover:text-white transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-silver-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-silver-400 hover:text-white transition-colors">
                <Phone size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-silver-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-silver-500 text-xs">
            &copy; {new Date().getFullYear()} Silveri. All rights reserved.
          </p>
          <div className="flex gap-6 text-silver-500 text-xs">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>

      {/* Developer Credit Bar */}
      <div className="bg-[#080e18] border-t border-white/5 py-2.5 px-4">
        <div className="flex items-center justify-center gap-2 font-[family-name:var(--font-body)]">
          <span className="text-white/40 text-[11px] sm:text-xs">Developed &amp; Marketed by</span>
          <Link
            href="/developer"
            className="flex-shrink-0 rounded-full hover:scale-110 transition-transform duration-300"
            title="View Aditya Kumar Rai's Developer Profile"
          >
            <img
              src="/images/Developer Aditya Kumar Rai Image .gif"
              alt="Aditya Kumar Rai — Software Developer, Web Developer & Digital Marketer"
              className="h-[34px] w-[34px] rounded-full object-cover border-2 border-gold shadow-[0_0_8px_rgba(201,168,76,0.3)]"
            />
          </Link>
          <Link
            href="/developer"
            className="text-white/80 hover:text-gold transition-colors duration-300 text-[11px] sm:text-xs font-semibold tracking-wide"
            title="View Aditya Kumar Rai's Developer Profile on Silveri"
          >
            Aditya Kumar Rai
          </Link>
          {/* External quick-links */}
          <a
            href="https://www.linkedin.com/in/aditya-k-rai/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Aditya Kumar Rai on LinkedIn"
            title="Aditya Kumar Rai on LinkedIn"
            className="text-white/30 hover:text-[#0A66C2] transition-colors duration-300 ml-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <a
            href="https://aditya-k-rai.github.io/P-Website/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Aditya Kumar Rai Portfolio"
            title="Aditya Kumar Rai's Portfolio"
            className="text-white/30 hover:text-gold transition-colors duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-silver-400 text-sm hover:text-white transition-colors">
        {label}
      </Link>
    </li>
  );
}
