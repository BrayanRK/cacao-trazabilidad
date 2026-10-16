"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (targetTheme: "light" | "dark") => {
    setTheme(targetTheme);
    localStorage.setItem("cacao-theme", targetTheme);

    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
      if (document.body) document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      if (document.body) document.body.classList.remove("dark");
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("cacao-theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    applyTheme(initialTheme);
  }, []);

  if (!mounted) {
    return (
      <div className="w-24 h-8 rounded-xl bg-emerald-900/40 border border-emerald-700/50 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center bg-emerald-950/80 p-0.5 rounded-xl border border-emerald-800/60 shadow-inner">
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-emerald-300 hover:text-white"
        }`}
        title="Activar Modo Claro"
      >
        <span>☀️</span>
        <span className="hidden sm:inline">Claro</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          theme === "dark"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-emerald-300 hover:text-white"
        }`}
        title="Activar Modo Oscuro"
      >
        <span>🌙</span>
        <span className="hidden sm:inline">Oscuro</span>
      </button>
    </div>
  );
}
