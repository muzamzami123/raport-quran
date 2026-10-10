"use client";

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#FFF6A9]/10 dark:bg-zinc-950 flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        {/* Page Content - scrollable independently */}
        <div className="flex-1 flex flex-col overflow-auto bg-[#FFF6A9]/5 dark:bg-zinc-950">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
