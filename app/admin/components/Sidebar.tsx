"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Book, 
  LayoutDashboard, 
  Users, 
  UserCheck,
  Layers,
  Settings, 
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/santri', label: 'Data Santri', icon: Users, exact: false },
    { href: '/admin/guru', label: 'Data Guru', icon: UserCheck, exact: false },
    { href: '/admin/kelas', label: 'Data Kelas', icon: Layers, exact: false },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings, exact: false },
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:h-full
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="bg-[#DE7272] p-1.5 flex items-center justify-center">
              <Book className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight uppercase">RaportQuran</span>
          </Link>
          <button 
            className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 space-y-1">
          <div className="px-6 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-2 ${
                  active
                    ? 'bg-[#FFF6A9]/40 dark:bg-zinc-800/60 border-[#DE7272] text-zinc-900 dark:text-white font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-[#FFF6A9]/20 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#DE7272]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <Link href="/login" onClick={onClose} className="flex items-center justify-center gap-3 px-6 py-2.5 border border-[#DE7272] text-[#DE7272] hover:bg-[#DE7272] hover:text-white font-medium transition-colors w-full">
            <LogOut className="w-4 h-4" />
            Keluar
          </Link>
        </div>
      </aside>
    </>
  );
}
