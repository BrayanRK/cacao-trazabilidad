"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Inicio", href: "/", icon: "🏠" },
    { label: "Lotes", href: "/lotes", icon: "📦" },
    { label: "Transformaciones", href: "/transformaciones", icon: "⚙️" },
    { label: "Consulta pública", href: "/trazabilidad", icon: "🔍" },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-2 py-1 safe-bottom"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-xl touch-manipulation min-h-[48px] ${
                isActive
                  ? "text-emerald-700 font-bold bg-emerald-50/80 scale-105"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
