"use client";

import { useState } from 'react';
import { Search, Plus, Filter, FileDown, Pencil, Trash2, Eye } from 'lucide-react';

export default function DataSantriPage() {
  const [activeTab, setActiveTab] = useState('Kelas 1');
  const tabs = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Data Santri</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola data santri, pendaftaran, dan informasi akademik.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#FFF6A9]/30 transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-[#B4E4D6] border border-[#B4E4D6] text-zinc-900 text-sm font-semibold hover:bg-[#a1d6c6] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Santri
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-[#DE7272] text-[#DE7272] bg-[#FFF6A9]/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 border-t-0">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#DE7272] transition-all"
            placeholder="Cari nama atau NIS..."
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#DE7272] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Kelas
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-2.5 font-semibold w-16 text-center">No</th>
              <th className="px-6 py-2.5 font-semibold">Nama</th>
              <th className="px-6 py-2.5 font-semibold">Kelas Diniyah</th>
              <th className="px-6 py-2.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {[
              { name: "Ahmad Zaki", kelas: `${activeTab} Murottal` },
              { name: "Fatimah Az-Zahra", kelas: `${activeTab} Murojaah` },
              { name: "Muhammad Umar", kelas: `${activeTab} Tafsir` },
              { name: "Aisyah Putri", kelas: `${activeTab} Murottal` },
              { name: "Ibrahim Ali", kelas: `${activeTab} Murojaah` },
            ].map((santri, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-6 py-2.5 font-medium text-zinc-900 dark:text-white text-center">{i + 1}</td>
                <td className="px-6 py-2.5 text-zinc-900 dark:text-white font-semibold">{santri.name}</td>
                <td className="px-6 py-2.5 text-zinc-600 dark:text-zinc-400">{santri.kelas}</td>
                <td className="px-6 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-zinc-400 hover:bg-[#FFF6A9]/30 hover:text-blue-600 transition-colors" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:bg-[#FFF6A9]/30 hover:text-[#FFCA88] transition-colors" title="Edit Data">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:bg-[#DE7272]/10 hover:text-[#DE7272] transition-colors" title="Hapus Data">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>Menampilkan 1 hingga 5 dari 1,248 santri</p>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>Sebel.</button>
          <button className="px-3 py-1 border border-[#DE7272] bg-[#DE7272] text-white font-medium">1</button>
          <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">2</button>
          <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">3</button>
          <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lanjut</button>
        </div>
      </div>
    </div>
  );
}
