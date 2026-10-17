export default function Footer() {
  return (
    <footer className="py-3 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 mt-auto shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          SIMRQ v2.4.0
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <span>Sistem Informasi Manajemen Raport Qur&apos;an Digital</span>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span>Pesantren Ilmu Al-Qur&apos;an</span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Server Terhubung
        </span>
      </div>
    </footer>
  );
}
