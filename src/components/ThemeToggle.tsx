"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-16 rounded-full border border-slate-300 dark:border-slate-700" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-8 w-16 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 transition-colors duration-500 ease-out"
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white dark:bg-slate-950 shadow-md flex items-center justify-center transition-all duration-500 ease-out ${
          isDark ? "translate-x-8" : "translate-x-0.5"
        }`}
      >
        <Sun
          className={`absolute h-3.5 w-3.5 text-amber-500 transition-all duration-300 ${
            isDark
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute h-3.5 w-3.5 text-slate-700 transition-all duration-300 ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </span>
    </button>
  );
}
