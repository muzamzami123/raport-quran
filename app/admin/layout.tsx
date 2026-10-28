"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const hasCookie = document.cookie.includes('admin_session=authenticated_admin');
    const localUser = localStorage.getItem('admin_user');

    if (!hasCookie && !localUser) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="h-screen relative text-zinc-900 dark:text-zinc-100 flex overflow-hidden antialiased">
      {/* Background Gedung Pesantren */}
      <div className="no-print fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/bg-app.jpg"
          alt="Gedung Pesantren Ilmu Al-Qur'an"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-50/92 dark:bg-zinc-950/94 backdrop-blur-[2px]" />
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        {/* Page Content - scrollable independently */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
