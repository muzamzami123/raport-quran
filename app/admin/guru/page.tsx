import { Search, Plus, MoreHorizontal, Filter, Mail, Phone } from 'lucide-react';

export default function DataGuruPage() {
  const dataGuru = [
    { nip: "G-001", name: "Ustadz Ahmad, S.Pd.I", bidang: "Tahfidz & Murojaah", wali: "Kelas 5A", kontak: "+62 812-3456-7890", status: "Aktif" },
    { nip: "G-002", name: "Ustadzah Fatimah, Lc", bidang: "Tafsir & Hadits", wali: "Kelas 6B", kontak: "+62 813-4567-8901", status: "Aktif" },
    { nip: "G-003", name: "Ustadz Umar", bidang: "Tajwid Dasar", wali: "Kelas 4A", kontak: "+62 814-5678-9012", status: "Aktif" },
    { nip: "G-004", name: "Ustadzah Maryam, M.Ag", bidang: "Fiqih Ibadah", wali: "Kelas 3A", kontak: "+62 815-6789-0123", status: "Aktif" },
    { nip: "G-005", name: "Ustadz Zulkifli, S.Th.I", bidang: "Aqidah Akhlak", wali: "Kelas 5B", kontak: "+62 816-7890-1234", status: "Aktif" },
    { nip: "G-006", name: "Ustadz Hasan Basri", bidang: "Tahsin Al-Quran", wali: "-", kontak: "+62 817-8901-2345", status: "Aktif" },
  ];

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
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
      
      {/* Table Card Container - full width & fills vertical space */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Header & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#DE7272] transition-all"
                placeholder="Cari nama guru atau NIP..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-[#FFF6A9]/30 dark:bg-zinc-800 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700">
                Total: {dataGuru.length} Pengajar
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">NIP / ID</th>
                  <th className="px-6 py-3.5 font-semibold">Nama Guru</th>
                  <th className="px-6 py-3.5 font-semibold">Bidang Studi</th>
                  <th className="px-6 py-3.5 font-semibold">Wali Kelas</th>
                  <th className="px-6 py-3.5 font-semibold">Kontak</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {dataGuru.map((guru, i) => (
                  <tr key={i} className="hover:bg-[#FFF6A9]/10 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">{guru.nip}</td>
                    <td className="px-6 py-3.5 text-zinc-900 dark:text-white font-semibold">{guru.name}</td>
                    <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-[#FFF6A9]/40 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {guru.bidang}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400 font-medium">{guru.wali}</td>
                    <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">{guru.kontak}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-[#B4E4D6]/30 text-emerald-800 dark:text-emerald-300 border border-[#B4E4D6]/50">
                        {guru.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="p-1.5 text-zinc-400 hover:text-[#DE7272] hover:bg-[#DE7272]/10 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Footer / Pagination */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
          <p>Menampilkan 1 hingga {dataGuru.length} dari {dataGuru.length} guru</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors" disabled>
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 border border-[#DE7272] bg-[#DE7272] text-white font-semibold">
              1
            </button>
            <button className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
