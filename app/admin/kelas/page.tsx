import { Plus, MoreHorizontal } from 'lucide-react';

export default function DataKelasPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
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
      
      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Kelas</th>
              <th className="px-6 py-4 font-semibold">Program</th>
              <th className="px-6 py-4 font-semibold">Wali Kelas</th>
              <th className="px-6 py-4 font-semibold text-center">Jumlah Santri</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {[
              { nama: "Kelas 5A", program: "Murottal", wali: "Ustadz Ahmad", jumlah: 25 },
              { nama: "Kelas 5B", program: "Murojaah", wali: "Ustadzah Fatimah", jumlah: 24 },
              { nama: "Kelas 6A", program: "Tafsir", wali: "Ustadz Umar", jumlah: 20 },
            ].map((kelas, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{kelas.nama}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border 
                    ${kelas.program === 'Murottal' ? 'bg-[#FFF6A9]/20 text-[#b5a72f] border-[#FFF6A9]' : 
                      kelas.program === 'Murojaah' ? 'bg-[#B4E4D6]/20 text-[#2c7a61] border-[#B4E4D6]' : 
                      'bg-[#FFCA88]/20 text-[#b37525] border-[#FFCA88]'}`}>
                    {kelas.program}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{kelas.wali}</td>
                <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">{kelas.jumlah}</td>
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
