import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Pengaturan Sistem</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Konfigurasi data pesantren, tahun ajaran, dan preferensi aplikasi.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">Profil Pesantren</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">Nama Lembaga</label>
              <input 
                type="text" 
                defaultValue="Pesantren Ilmu Al Quran"
                className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">NPSN / NSM</label>
              <input 
                type="text" 
                defaultValue="12345678"
                className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">Alamat</label>
              <textarea 
                rows={3}
                defaultValue="Jl. Contoh Alamat No. 123, Kota, Provinsi"
                className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">Tahun Ajaran Aktif</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">Tahun Ajaran</label>
                <select className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors appearance-none">
                  <option>2026/2027</option>
                  <option>2025/2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">Semester</label>
                <select className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors appearance-none">
                  <option>Ganjil</option>
                  <option>Genap</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
            <button className="px-6 py-2.5 bg-[#DE7272] border border-[#DE7272] text-white text-sm font-semibold hover:bg-[#c96363] transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
