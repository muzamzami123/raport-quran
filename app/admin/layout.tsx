"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Periksa status login admin via cookie atau localStorage
    const hasCookie = document.cookie.includes('admin_session=authenticated_admin');
    const localUser = localStorage.getItem('admin_user');

    if (!hasCookie && !localUser) {
      router.replace('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#086288] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-500 font-medium">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex overflow-hidden antialiased">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        {/* Page Content - scrollable independently */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
