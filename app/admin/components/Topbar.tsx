"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, BookOpen, ChevronRight, Calendar } from 'lucide-react';

interface TopbarProps {
  onOpenSidebar: () => void;
}

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const pathname = usePathname();

  // Generate breadcrumb text
  const getBreadcrumb = () => {
    if (pathname === '/admin') return 'Dashboard Eksekutif';
    if (pathname.startsWith('/admin/santri')) return 'Data & Pendataan Santri';
    if (pathname.startsWith('/admin/guru')) return 'Data Asatidz & Guru';
    if (pathname.startsWith('/admin/kelas')) return 'Halaqah & Kelas Diniyah';
    if (pathname.startsWith('/admin/settings')) return 'Pengaturan Sistem';
    return 'Panel Administrasi';
  };

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button 
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden transition-colors"
          onClick={onOpenSidebar}
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">Portal Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 hidden sm:inline" />
          <h1 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getBreadcrumb()}
          </h1>
        </div>
      </div>
      
      {/* Center: Institutional Search Bar */}
      <div className="hidden lg:flex flex-1 items-center max-w-md mx-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-9 pr-12 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-colors"
            placeholder="Cari santri, NIS, asatidz, atau data halaqah..."
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
      
      {/* Right: Academic Status Badge & Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
        {/* Semester Active Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-[#086288] dark:text-[#97D7FF]" />
          <span>Semester Ganjil 2026/2027</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Aktif"></span>
        </div>

        {/* Link to Teacher Examination Mode */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold shadow-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FFEFC4]" />
          <span>Mode Pengujian</span>
        </Link>

        {/* Notification Bell */}
        <button 
          className="relative p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Pemberitahuan"
          aria-label="Pemberitahuan"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#086288] ring-2 ring-white dark:ring-zinc-900"></span>
        </button>

        {/* User Avatar with Institutional Tag */}
        <div className="flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center">
            AF
          </div>
        </div>
      </div>
    </header>
  );
}
