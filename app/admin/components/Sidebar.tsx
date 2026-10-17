"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  Layers,
  Settings, 
  LogOut,
  X,
  BookOpen,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuSections = [
    {
      title: "NAVIGASI UTAMA",
      items: [
        { href: '/admin', label: 'Dashboard Eksekutif', icon: LayoutDashboard, exact: true },
      ]
    },
    {
      title: "DATA & HALAQAH",
      items: [
        { href: '/admin/santri', label: 'Data Santri', icon: Users, exact: false },
        { href: '/admin/guru', label: 'Data Asatidz & Guru', icon: UserCheck, exact: false },
        { href: '/admin/kelas', label: 'Halaqah & Kelas', icon: Layers, exact: false },
      ]
    },
    {
      title: "SISTEM",
      items: [
        { href: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings, exact: false },
      ]
    }
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:h-full select-none
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 group" 
            onClick={onClose}
          >
            <div className="w-9 h-9 rounded-md bg-[#086288] flex items-center justify-center text-[#FFEFC4] shadow-xs">
              <BookOpen className="w-5 h-5 text-[#FFEFC4]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                SIMRQ
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Admin
                </span>
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                Pesantren Ilmu Al-Qur&apos;an
              </span>
            </div>
          </Link>
          <button 
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden transition-colors"
            onClick={onClose}
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const active = isItemActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors
                        ${active 
                          ? 'bg-[#086288] text-white shadow-xs' 
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#FFEFC4]' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Switch to Teacher Examination Portal */}
          <div className="pt-2 px-1">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <BookOpen className="w-4 h-4 text-[#086288] dark:text-[#97D7FF]" />
                <span>Portal Pengujian Guru</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </nav>

        {/* User Profile Card & Sign Out */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-[#086288] text-[#FFEFC4] flex items-center justify-center font-bold text-xs shrink-0">
              AF
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Ust. H. Ahmad Fauzi
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  Admin Akademik
                </span>
              </div>
            </div>
          </div>

          <Link 
            href="/login" 
            onClick={onClose} 
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50 w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
