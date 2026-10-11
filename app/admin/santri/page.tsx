"use client";

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  Pencil, 
  Trash2, 
  UserPlus, 
  GraduationCap, 
  User,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Santri {
  id: string;
  nama: string;
  kelas: string;
}

const initialSantriList: Santri[] = [
  // Kelas 1
  { id: '1', nama: 'Ahmad Zaki Al-Faruq', kelas: 'Kelas 1' },
  { id: '2', nama: 'Fatimah Az-Zahra', kelas: 'Kelas 1' },
  { id: '3', nama: 'Zaid bin Tsabit', kelas: 'Kelas 1' },
  { id: '4', nama: 'Bilal bin Rabah', kelas: 'Kelas 1' },
  // Kelas 2
  { id: '5', nama: 'Muhammad Umar Said', kelas: 'Kelas 2' },
  { id: '6', nama: 'Aisyah Humaira', kelas: 'Kelas 2' },
  { id: '7', nama: 'Ali Zainal Abidin', kelas: 'Kelas 2' },
  // Kelas 3
  { id: '8', nama: 'Aisyah Putri Nabila', kelas: 'Kelas 3' },
  { id: '9', nama: 'Salman Al-Farisi', kelas: 'Kelas 3' },
  { id: '10', nama: 'Hafshah binti Umar', kelas: 'Kelas 3' },
  // Kelas 4
  { id: '11', nama: 'Ibrahim Ali Basayev', kelas: 'Kelas 4' },
  { id: '12', nama: 'Khalid bin Walid', kelas: 'Kelas 4' },
  { id: '13', nama: 'Asma binti Abi Bakar', kelas: 'Kelas 4' },
  // Kelas 5
  { id: '14', nama: 'Abdullah bin Mas\'ud', kelas: 'Kelas 5' },
  { id: '15', nama: 'Zubair bin Awwam', kelas: 'Kelas 5' },
  { id: '16', nama: 'Ruqayyah binti Muhammad', kelas: 'Kelas 5' },
  // Kelas 6
  { id: '17', nama: 'Maryam Khadijah', kelas: 'Kelas 6' },
  { id: '18', nama: 'Usamah bin Zaid', kelas: 'Kelas 6' },
  { id: '19', nama: 'Muadz bin Jabal', kelas: 'Kelas 6' },
];

export default function DataSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>(initialSantriList);
  const [activeTab, setActiveTab] = useState('Kelas 1');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Page Size (Default 10, kelipatan 5: 10, 15, 20, 25, 30)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSizeOptions = [10, 15, 20, 25, 30];

  // Form Pendataan Santri Baru (Hanya Nama Lengkap & Kelas Diniyah)
  const [formData, setFormData] = useState({
    nama: '',
    kelas: 'Kelas 1',
  });

  const kelasOptions = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newSantri: Santri = {
      id: Date.now().toString(),
      nama: formData.nama.trim(),
      kelas: formData.kelas,
    };

    setSantriList([newSantri, ...santriList]);
    setActiveTab(newSantri.kelas); // Otomatis arahkan tab ke kelas yang baru didaftarkan
    setCurrentPage(1);

    // Reset Form Nama
    setFormData({
      ...formData,
      nama: '',
    });

    // SweetAlert Sukses
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Santri "${newSantri.nama}" berhasil didaftarkan ke ${newSantri.kelas}!`,
      confirmButtonColor: '#DE7272',
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Santri?',
      text: `Apakah Anda yakin ingin menghapus data santri "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DE7272',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setSantriList(prev => prev.filter(item => item.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dihapus!',
          text: `Data santri "${nama}" telah dihapus.`,
          confirmButtonColor: '#DE7272',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter Data Santri (Sesuai Tab Kelas Aktif & Pencarian Nama)
  const filteredSantri = santriList.filter(item => {
    const matchKelas = item.kelas === activeTab;
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchSearch;
  });

  // Hitung Data Terpaginasi
  const totalPages = Math.max(1, Math.ceil(filteredSantri.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredSantri.length);
  const paginatedSantri = filteredSantri.slice(startIndex, endIndex);

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Data & Pendataan Santri
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pendaftaran santri baru dan manajemen data santri per kelas diniyah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#FFF6A9]/30 transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Main Split Grid: KIRI = Pendataan Santri Baru, KANAN = Data Santri */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* ================= PANEL KIRI: FORM PENDATAAN SANTRI BARU (Tinggi Mandiri) ================= */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Card Header Form */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-[#FFF6A9]/20 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="bg-[#DE7272] p-2 text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                    Pendataan Santri Baru
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Input nama lengkap dan pilih kelas diniyah
                  </p>
                </div>
              </div>
            </div>

            {/* Form Input: Hanya Nama Lengkap dan Kelas Diniyah */}
            <form onSubmit={handleSubmit} id="form-santri-baru" className="p-5 space-y-5">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  Nama Lengkap <span className="text-[#DE7272]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap santri..."
                  className="block w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#DE7272] focus:border-[#DE7272] transition-colors"
                />
              </div>

              {/* Dropdown Kelas Diniyah (Pilihan 6 Kelas) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-zinc-400" />
                    Kelas Diniyah <span className="text-[#DE7272]">*</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">Pilih 1 dari 6 kelas</span>
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="block w-full px-3.5 py-2.5 border-2 border-[#DE7272]/40 bg-[#FFF6A9]/10 dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-[#DE7272] transition-colors cursor-pointer"
                >
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Card */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Info className="w-4 h-4 text-[#DE7272] shrink-0 mt-0.5" />
                <p>Santri yang didaftarkan akan otomatis masuk ke dalam daftar santri pada tab kelas yang dipilih.</p>
              </div>
            </form>

            {/* Tombol Simpan Form */}
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                type="submit"
                form="form-santri-baru"
                className="w-full py-3 px-4 bg-[#DE7272] hover:bg-[#c96363] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Santri Baru
              </button>
            </div>
          </div>
        </div>

        {/* ================= PANEL KANAN: DATA SANTRI ================= */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col justify-between shadow-sm">
            <div>
              {/* Tabs Kelas (Hanya Kelas 1 s/d Kelas 6, Tanpa 'Semua Kelas') */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar bg-zinc-50/50 dark:bg-zinc-900/50">
                {kelasOptions.map((kelas) => (
                  <button
                    key={kelas}
                    onClick={() => {
                      setActiveTab(kelas);
                      setCurrentPage(1);
                    }}
                    className={`flex-1 min-w-[100px] py-3 text-xs font-semibold whitespace-nowrap border-b-2 text-center transition-colors ${
                      activeTab === kelas 
                        ? 'border-[#DE7272] text-[#DE7272] bg-white dark:bg-zinc-900 shadow-sm' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {kelas}
                  </button>
                ))}
              </div>

              {/* Toolbar Pencarian & Info */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#DE7272] transition-all"
                    placeholder={`Cari nama santri di ${activeTab}...`}
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Pilihan Maksimal Santri Ditampilkan */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Maksimal:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#DE7272] cursor-pointer"
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size} data
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium bg-[#FFF6A9]/30 dark:bg-zinc-800 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
                    Total: {filteredSantri.length} Santri ({activeTab})
                  </span>
                </div>
              </div>

              {/* Tabel Data Santri: No, Nama Lengkap Santri, Kelas Diniyah, Aksi (Garis Tabel Tampak Jelas) */}
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left border-collapse border border-zinc-200 dark:border-zinc-700">
                  <thead className="text-[11px] text-zinc-600 dark:text-zinc-300 uppercase bg-zinc-50 dark:bg-zinc-800/60">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold w-16 text-center border border-zinc-200 dark:border-zinc-700">No</th>
                      <th className="px-5 py-3.5 font-semibold border border-zinc-200 dark:border-zinc-700">Nama Santri</th>
                      <th className="px-5 py-3.5 font-semibold border border-zinc-200 dark:border-zinc-700">Kelas Diniyah</th>
                      <th className="px-5 py-3.5 font-semibold text-center w-28 border border-zinc-200 dark:border-zinc-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {paginatedSantri.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          Tidak ada data santri di {activeTab} {searchQuery ? `yang cocok dengan "${searchQuery}"` : ''}.
                        </td>
                      </tr>
                    ) : (
                      paginatedSantri.map((santri, i) => (
                        <tr key={santri.id} className="hover:bg-[#FFF6A9]/10 dark:hover:bg-zinc-800/50 transition-colors group">
                          <td className="px-5 py-3.5 font-medium text-zinc-500 text-center border border-zinc-200 dark:border-zinc-700">{startIndex + i + 1}</td>
                          <td className="px-5 py-3.5 border border-zinc-200 dark:border-zinc-700">
                            <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                              {santri.nama}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 border border-zinc-200 dark:border-zinc-700">
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-[#B4E4D6]/20 text-[#2c7a61] dark:text-[#B4E4D6] border border-[#B4E4D6]/50">
                              {santri.kelas}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-1.5 text-zinc-400 hover:bg-[#FFF6A9]/30 hover:text-amber-600 transition-colors" 
                                title="Edit Data"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(santri.id, santri.nama)}
                                className="p-1.5 text-zinc-400 hover:bg-[#DE7272]/10 hover:text-[#DE7272] transition-colors" 
                                title="Hapus Santri"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <span>Tampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#DE7272] cursor-pointer"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>per halaman</span>
                <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
                <span className="hidden sm:inline">
                  {filteredSantri.length === 0
                    ? '0 santri'
                    : `Menampilkan ${startIndex + 1}–${endIndex} dari ${filteredSantri.length} santri`}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 border font-semibold transition-colors ${
                      safeCurrentPage === pageNum
                        ? 'border-[#DE7272] bg-[#DE7272] text-white'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages || filteredSantri.length === 0}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
