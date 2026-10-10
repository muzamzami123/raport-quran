import { Bell, Search, Menu } from 'lucide-react';

export default function Topbar({
  onOpenSidebar
}: {
  onOpenSidebar: () => void;
}) {
  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-30">
      <div className="flex items-center gap-3 md:hidden">
        <button 
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          onClick={onOpenSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="hidden md:flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-[#FFF6A9]/10 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#DE7272] dark:focus:ring-white transition-all"
            placeholder="Cari data..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Search Icon for Mobile */}
        <button className="md:hidden relative p-2 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DE7272] border-2 border-white dark:border-zinc-900"></span>
        </button>
        <div className="w-8 h-8 bg-[#FFCA88] flex items-center justify-center text-zinc-900 font-bold text-xs cursor-pointer ml-1 sm:ml-2">
          IA
        </div>
      </div>
    </header>
  );
}
