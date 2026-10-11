"use client";

import { useState } from 'react';
import {
  Search,
  Plus,
  FileDown,
  Pencil,
  Trash2,
  UserPlus,
  User,
  Info,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Guru {
  id: string;
  nama: string;
}

const initialGuruList: Guru[] = [
  { id: '1', nama: 'Ustadz Ahmad, S.Pd.I' },
  { id: '2', nama: 'Ustadzah Fatimah, Lc' },
  { id: '3', nama: 'Ustadz Umar' },
  { id: '4', nama: 'Ustadzah Maryam, M.Ag' },
  { id: '5', nama: 'Ustadz Zulkifli, S.Th.I' },
  { id: '6', nama: 'Ustadz Hasan Basri' },
];

export default function DataGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>(initialGuruList);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Page Size (Default 10, kelipatan 5: 10, 15, 20, 25, 30)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSizeOptions = [10, 15, 20, 25, 30];

  // Form Pendataan Guru Baru
  const [formData, setFormData] = useState({
    nama: '',
  });

  // State Modal Edit
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newGuru: Guru = {
      id: Date.now().toString(),
      nama: formData.nama.trim(),
    };

    setGuruList([newGuru, ...guruList]);

    // Reset Form
    setFormData({
      nama: '',
    });

    // SweetAlert Sukses
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Guru "${newGuru.nama}" berhasil didaftarkan!`,
      confirmButtonColor: '#DE7272',
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const handleOpenEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setEditFormData({
      nama: guru.nama,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuru || !editFormData.nama.trim()) return;

    setGuruList((prev) =>
      prev.map((g) =>
        g.id === editingGuru.id
          ? { ...g, nama: editFormData.nama.trim() }
          : g
      )
    );

    const editedName = editFormData.nama.trim();
    setEditingGuru(null);

    // SweetAlert Sukses Edit
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Data guru "${editedName}" berhasil diperbarui!`,
      confirmButtonColor: '#DE7272',
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Guru?',
      text: `Apakah Anda yakin ingin menghapus data guru "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DE7272',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setGuruList((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dihapus!',
          text: `Data guru "${nama}" telah dihapus.`,
          confirmButtonColor: '#DE7272',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter Data Guru (Berdasarkan Pencarian Nama)
  const filteredGuru = guruList.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Hitung Data Terpaginasi
  const totalPages = Math.max(1, Math.ceil(filteredGuru.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredGuru.length);
  const paginatedGuru = filteredGuru.slice(startIndex, endIndex);

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Data & Pendataan Guru
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pendaftaran guru baru dan manajemen data asatidz/asatidzah pengajar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#FFF6A9]/30 transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Main Split Grid: KIRI = Pendataan Guru Baru, KANAN = Data Guru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">

        {/* ================= PANEL KIRI: FORM PENDATAAN GURU BARU (Tinggi Mandiri) ================= */}
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
                    Pendataan Guru Baru
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Input nama lengkap guru pengajar
                  </p>
                </div>
              </div>
            </div>

            {/* Form Input: Hanya Nama Lengkap Guru */}
            <form onSubmit={handleSubmit} id="form-guru-baru" className="p-5 space-y-5">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  Nama Lengkap Guru <span className="text-[#DE7272]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap guru beserta gelar..."
                  className="block w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#DE7272] focus:border-[#DE7272] transition-colors"
                />
              </div>

              {/* Info Card */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Info className="w-4 h-4 text-[#DE7272] shrink-0 mt-0.5" />
                <p>
                  Guru yang didaftarkan akan otomatis masuk ke dalam daftar pengajar dan tercatat di sistem.
                </p>
              </div>
            </form>

            {/* Tombol Simpan Form */}
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                type="submit"
                form="form-guru-baru"
                disabled={!formData.nama.trim()}
                className="w-full py-3 px-4 bg-[#DE7272] hover:bg-[#c96363] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Guru Baru
              </button>
            </div>
          </div>
        </div>

        {/* ================= PANEL KANAN: DATA GURU ================= */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col justify-between shadow-sm">
            <div>
              {/* Toolbar Pencarian & Pengaturan Tampilan */}
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
                    placeholder="Cari nama guru..."
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Pilihan Maksimal Guru Ditampilkan */}
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
                    Total: {filteredGuru.length} Pengajar
                  </span>
                </div>
              </div>

              {/* Tabel Data Guru: No, Nama, Aksi (Garis Tabel Tampak Jelas) */}
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left border-collapse border border-zinc-200 dark:border-zinc-700">
                  <thead className="text-[11px] text-zinc-600 dark:text-zinc-300 uppercase bg-zinc-50 dark:bg-zinc-800/60">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold w-16 text-center border border-zinc-200 dark:border-zinc-700">
                        No
                      </th>
                      <th className="px-5 py-3.5 font-semibold border border-zinc-200 dark:border-zinc-700">
                        Nama
                      </th>
                      <th className="px-5 py-3.5 font-semibold text-center w-28 border border-zinc-200 dark:border-zinc-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {paginatedGuru.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          Tidak ada data guru {searchQuery ? `yang cocok dengan "${searchQuery}"` : ''}.
                        </td>
                      </tr>
                    ) : (
                      paginatedGuru.map((guru, i) => (
                        <tr key={guru.id} className="hover:bg-[#FFF6A9]/10 dark:hover:bg-zinc-800/50 transition-colors group">
                          <td className="px-5 py-3.5 font-medium text-zinc-500 text-center border border-zinc-200 dark:border-zinc-700">
                            {startIndex + i + 1}
                          </td>
                          <td className="px-5 py-3.5 border border-zinc-200 dark:border-zinc-700">
                            <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                              {guru.nama}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(guru)}
                                className="p-1.5 text-zinc-400 hover:bg-[#FFF6A9]/30 hover:text-amber-600 transition-colors"
                                title="Edit Data"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(guru.id, guru.nama)}
                                className="p-1.5 text-zinc-400 hover:bg-[#DE7272]/10 hover:text-[#DE7272] transition-colors"
                                title="Hapus Guru"
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
                  {filteredGuru.length === 0
                    ? '0 guru'
                    : `Menampilkan ${startIndex + 1}–${endIndex} dari ${filteredGuru.length} guru`}
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
                    className={`px-3 py-1.5 border font-semibold transition-colors ${safeCurrentPage === pageNum
                      ? 'border-[#DE7272] bg-[#DE7272] text-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages || filteredGuru.length === 0}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL EDIT DATA GURU ================= */}
      {editingGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-[#FFF6A9]/20 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#DE7272] p-1.5 text-white">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Edit Data Guru
                </h3>
              </div>
              <button
                onClick={() => setEditingGuru(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  Nama Guru <span className="text-[#DE7272]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  placeholder="Masukkan nama guru..."
                  className="block w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#DE7272] focus:border-[#DE7272] transition-colors"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingGuru(null)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!editFormData.nama.trim()}
                  className="px-4 py-2 bg-[#DE7272] hover:bg-[#c96363] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
