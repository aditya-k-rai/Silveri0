"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, ClipboardList,
  Users, Tags, Settings, Menu, X, Box,
} from "lucide-react";
import { useState } from "react";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

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
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-sm font-semibold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
