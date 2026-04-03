"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, ClipboardList,
  Users, Tags, Settings, Menu, X, Box, LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { signOutUser } from "@/lib/firebase/auth";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/3d-models", label: "3D Models", icon: Box },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/promos", label: "Promos", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userDoc } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Skip admin layout for login page — it has its own full-screen layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const adminName = userDoc?.name || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOutUser();
    router.push('/admin/login');
  };

  const sidebar = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-[#C9A84C]/15 text-[#C9A84C]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A1A1A] shrink-0">
        <div className="px-6 py-6 mb-4">
          <Link href="/admin" className="text-2xl font-[family-name:var(--font-heading)] font-semibold text-[#C9A84C]">
            Silveri
          </Link>
          <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
        </div>
        {sidebar}
        {/* Admin info at bottom */}
        <div className="mt-auto px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-sm font-semibold">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminName}</p>
              <p className="text-white/40 text-xs truncate">{userDoc?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-[#1A1A1A] flex flex-col">
            <div className="flex items-center justify-between px-6 py-6">
              <span className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#C9A84C]">Silveri</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {sidebar}
            {/* Admin info at bottom of mobile sidebar */}
            <div className="mt-auto px-4 py-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-sm font-semibold">
                  {adminInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{adminName}</p>
                </div>
                <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-8 py-4 bg-white border-b border-[#E8E8E8]">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[#1A1A1A] hover:bg-[#E8E8E8]/50 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">
            {NAV_LINKS.find((l) => isActive(l.href))?.label ?? "Admin"}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-[#7A7585] hidden sm:block">{adminName}</span>
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-sm font-semibold">
              {adminInitial}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
        
        {/* Admin Footer */}
        <footer className="px-4 lg:px-8 py-4 border-t border-[#E8E8E8] bg-white text-center text-xs text-[#7A7585]">
          &copy; {new Date().getFullYear()} Silveri Admin Portal. All systems operational.
        </footer>
      </div>
    </div>
  );
}
