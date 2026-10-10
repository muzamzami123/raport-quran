import { Search, Plus, MoreHorizontal } from 'lucide-react';

export default function DataGuruPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Data Guru</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola data asatidz/asatidzah dan staf pengajar.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#B4E4D6] border border-[#B4E4D6] text-zinc-900 text-sm font-semibold hover:bg-[#a1d6c6] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Guru
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#DE7272] transition-all"
            placeholder="Cari nama guru..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold">NIP / ID</th>
              <th className="px-6 py-4 font-semibold">Nama Guru</th>
              <th className="px-6 py-4 font-semibold">Bidang Studi</th>
              <th className="px-6 py-4 font-semibold">Wali Kelas</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {[
              { nip: "G-001", name: "Ustadz Ahmad, S.Pd.I", bidang: "Tahfidz & Murojaah", wali: "Kelas 5A" },
              { nip: "G-002", name: "Ustadzah Fatimah, Lc", bidang: "Tafsir & Hadits", wali: "Kelas 6B" },
              { nip: "G-003", name: "Ustadz Umar", bidang: "Tajwid Dasar", wali: "-" },
            ].map((guru, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{guru.nip}</td>
                <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 font-semibold">{guru.name}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{guru.bidang}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{guru.wali}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-400 hover:text-[#DE7272] transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
