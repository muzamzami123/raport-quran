import { Plus, MoreHorizontal, Search, Filter } from 'lucide-react';

export default function DataKelasPage() {
  const dataKelas = [
    { nama: "Kelas 1A", program: "Murottal", wali: "Ustadz Ahmad", jumlah: 25, ruangan: "Gedung A-01" },
    { nama: "Kelas 1B", program: "Murojaah", wali: "Ustadzah Fatimah", jumlah: 24, ruangan: "Gedung A-02" },
    { nama: "Kelas 2A", program: "Murottal", wali: "Ustadz Umar", jumlah: 22, ruangan: "Gedung A-03" },
    { nama: "Kelas 3A", program: "Murojaah", wali: "Ustadzah Maryam", jumlah: 26, ruangan: "Gedung B-01" },
    { nama: "Kelas 5A", program: "Murottal", wali: "Ustadz Zulkifli", jumlah: 25, ruangan: "Gedung B-02" },
    { nama: "Kelas 6A", program: "Tafsir", wali: "Ustadz Hasan Basri", jumlah: 20, ruangan: "Gedung C-01" },
  ];

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Data Kelas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Daftar kelas Murottal, Murojaah, dan Tafsir.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#B4E4D6] border border-[#B4E4D6] text-zinc-900 text-sm font-semibold hover:bg-[#a1d6c6] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Buat Kelas
          </button>
        </div>
      </div>
      
      {/* Table Card Container */}
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
                placeholder="Cari nama kelas atau wali kelas..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-[#FFF6A9]/30 dark:bg-zinc-800 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700">
                Total: {dataKelas.length} Rombel
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Nama Kelas</th>
                  <th className="px-6 py-3.5 font-semibold">Program</th>
                  <th className="px-6 py-3.5 font-semibold">Wali Kelas</th>
                  <th className="px-6 py-3.5 font-semibold">Ruangan</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Jumlah Santri</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {dataKelas.map((kelas, i) => (
                  <tr key={i} className="hover:bg-[#FFF6A9]/10 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-3.5 font-bold text-zinc-900 dark:text-white">{kelas.nama}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border 
                        ${kelas.program === 'Murottal' ? 'bg-[#FFF6A9]/20 text-[#857b22] border-[#FFF6A9]' : 
                          kelas.program === 'Murojaah' ? 'bg-[#B4E4D6]/20 text-[#2c7a61] border-[#B4E4D6]' : 
                          'bg-[#FFCA88]/20 text-[#b37525] border-[#FFCA88]'}`}>
                        {kelas.program}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400 font-medium">{kelas.wali}</td>
                    <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">{kelas.ruangan}</td>
                    <td className="px-6 py-3.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">{kelas.jumlah} Santri</td>
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
          <p>Menampilkan 1 hingga {dataKelas.length} dari {dataKelas.length} kelas</p>
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
