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
