"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-5 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center md:text-left mt-auto shrink-0">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        &copy; {year ?? 2025} <span className="font-semibold text-zinc-700 dark:text-zinc-300">RaportQuran</span>. All rights reserved.
      </p>
    </footer>
  );
}
