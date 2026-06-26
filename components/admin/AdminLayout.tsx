"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";
import AdminHeader from "./AdminHeader";

interface NavItem {
  href: string;
  labelKey: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/admin/providers", labelKey: "nav.providers", icon: "🏢" },
  { href: "/admin/models", labelKey: "nav.models", icon: "🤖" },
  { href: "/admin/featured", labelKey: "nav.featured", icon: "⭐" },
  { href: "/admin/benchmarks", labelKey: "nav.benchmarks", icon: "📊" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useAdminLang();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader />

      <div className="flex">
        <aside className="w-56 min-h-[calc(100vh-3.5rem)] border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-acorn-50 text-acorn-600 dark:bg-acorn-900/20 dark:text-acorn-400"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
