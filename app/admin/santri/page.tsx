"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  UserPlus, 
  RotateCcw,
  Database,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Santri {
  id: string;
  nis?: string;
  nama: string;
  kelas: string;
  program?: string;
  pembina?: string;
  statusUjian?: 'Sudah Diuji' | 'Belum Ujian';
  nilaiTerakhir?: number;
}

const fallbackSantriList: Santri[] = [
  // Kelas 1
  { id: '1', nis: '202601001', nama: 'Ahmad Zaki Al-Faruq', kelas: 'Kelas 1' },
  { id: '2', nis: '202601002', nama: 'Fatimah Az-Zahra', kelas: 'Kelas 1' },
  { id: '3', nis: '202601003', nama: 'Zaid bin Tsabit', kelas: 'Kelas 1' },
  { id: '4', nis: '202601004', nama: 'Bilal bin Rabah', kelas: 'Kelas 1' },
  // Kelas 2
  { id: '5', nis: '202602005', nama: 'Muhammad Umar Said', kelas: 'Kelas 2' },
  { id: '6', nis: '202602006', nama: 'Aisyah Humaira', kelas: 'Kelas 2' },
  { id: '7', nis: '202602007', nama: 'Ali Zainal Abidin', kelas: 'Kelas 2' },
  // Kelas 3
  { id: '8', nis: '202603008', nama: 'Aisyah Putri Nabila', kelas: 'Kelas 3' },
  { id: '9', nis: '202603009', nama: 'Salman Al-Farisi', kelas: 'Kelas 3' },
  { id: '10', nis: '202603010', nama: 'Hafshah binti Umar', kelas: 'Kelas 3' },
  // Kelas 4
  { id: '11', nis: '202604011', nama: 'Ibrahim Ali Basayev', kelas: 'Kelas 4' },
  { id: '12', nis: '202604012', nama: 'Khalid bin Walid', kelas: 'Kelas 4' },
  // Kelas 5
  { id: '13', nis: '202605013', nama: 'Abdullah bin Mas\'ud', kelas: 'Kelas 5' },
  { id: '14', nis: '202605014', nama: 'Zubair bin Awwam', kelas: 'Kelas 5' },
  // Kelas 6
  { id: '15', nis: '202606015', nama: 'Maryam Khadijah', kelas: 'Kelas 6' },
  { id: '16', nis: '202606016', nama: 'Usamah bin Zaid', kelas: 'Kelas 6' },
];

export default function DataSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>(fallbackSantriList);
  const [selectedKelas, setSelectedKelas] = useState<string>('Kelas 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Memeriksa koneksi database...',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Hanya Nama dan Kelas
  const [formData, setFormData] = useState({
    nama: '',
    kelas: 'Kelas 1',
  });

  const kelasOptions = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  // Load Data Santri from MongoDB via /api/santri
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/santri');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSantriList(json.data);
          if (json.source === 'mongodb') {
            setDbStatus({
              connected: true,
              message: 'MongoDB Atlas Terhubung'
            });
          } else {
            setDbStatus({
              connected: false,
              message: json.warning || 'Mode Lokal (Atlas Whitelist Diperlukan)'
            });
          }
        }
      } catch (err: any) {
        console.warn('Gagal memuat dari /api/santri:', err.message);
        setDbStatus({
          connected: false,
          message: 'Gagal menghubungi server database'
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const resetForm = (kelasTarget = selectedKelas) => {
    setEditingSantri(null);
    setFormData({
      nama: '',
      kelas: kelasTarget,
    });
  };

  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setFormData({
      nama: santri.nama,
      kelas: santri.kelas,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingSantri) {
        // Update santri di MongoDB
        const res = await fetch('/api/santri', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSantri.id,
            nama: formData.nama.trim(),
            kelas: formData.kelas,
          })
        });

        const json = await res.json();
        if (json.success) {
          setSantriList(prev => prev.map(item => {
            if (item.id === editingSantri.id) {
              return {
                ...item,
                nama: formData.nama.trim(),
                kelas: formData.kelas,
              };
            }
            return item;
          }));
          setNotification(`Data santri "${formData.nama.trim()}" berhasil diperbarui.`);
          resetForm(formData.kelas);
        }
      } else {
        // Daftarkan santri baru ke MongoDB
        const res = await fetch('/api/santri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: formData.nama.trim(),
            kelas: formData.kelas,
          })
        });

        const json = await res.json();
        if (json.success && json.data) {
          const createdSantri = json.data;
          setSantriList(prev => [createdSantri, ...prev]);
          setSelectedKelas(createdSantri.kelas);
          setNotification(`Santri "${createdSantri.nama}" berhasil disimpan ke database.`);
          resetForm(createdSantri.kelas);
        }
      }
    } catch (err: any) {
      console.error('Error menyimpan ke database:', err.message);
      // Fallback local update
      if (editingSantri) {
        setSantriList(prev => prev.map(item => item.id === editingSantri.id ? { ...item, nama: formData.nama.trim(), kelas: formData.kelas } : item));
      } else {
        const localSantri: Santri = {
          id: Date.now().toString(),
          nama: formData.nama.trim(),
          kelas: formData.kelas,
        };
        setSantriList(prev => [localSantri, ...prev]);
        setSelectedKelas(localSantri.kelas);
      }
      setNotification(`Data santri "${formData.nama.trim()}" berhasil disimpan (lokal).`);
      resetForm(formData.kelas);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data santri "${nama}" dari database?`)) {
      try {
        const res = await fetch(`/api/santri?id=${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          setSantriList(prev => prev.filter(item => item.id !== id));
          if (editingSantri && editingSantri.id === id) {
            resetForm();
          }
          setNotification(`Data santri "${nama}" telah dihapus dari database.`);
        }
      } catch (err: any) {
        console.warn('Gagal menghapus via API, menghapus dari state:', err.message);
        setSantriList(prev => prev.filter(item => item.id !== id));
        setNotification(`Data santri "${nama}" telah dihapus.`);
      } finally {
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Filter Data santri berdasarkan tab kelas aktif & pencarian nama
  const filteredSantri = santriList.filter(item => {
    const matchKelas = item.kelas === selectedKelas;
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Data Induk & Registrasi Santri
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Buku induk santri aktif terintegrasi dengan database MongoDB Atlas.
          </p>
        </div>

        {/* Database Status Indicator & Action */}
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            dbStatus.connected 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>{dbStatus.message}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>

          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Split Grid: KIRI = Pendataan Santri Baru, KANAN = Tabel Santri (Mampat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================= PANEL KIRI: FORM PENDATAAN SANTRI BARU ================= */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
          {/* Card Header Form */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#086288] text-[#FFEFC4] flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {editingSantri ? 'Edit Data Santri' : 'Pendataan Santri Baru'}
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {editingSantri ? 'Perbarui nama & kelas santri' : 'Input nama dan tentukan kelas santri'}
                </p>
              </div>
            </div>

            {editingSantri && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded transition-colors"
                title="Batal Edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Batal</span>
              </button>
            )}
          </div>

          {/* Form Body (Hanya Nama dan Kelas) */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* Nama Lengkap Santri */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Lengkap Santri <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama santri..."
                className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
              />
            </div>

            {/* Jenjang Kelas */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Jenjang Kelas <span className="text-amber-500">*</span>
              </label>
              <select
                value={formData.kelas}
                disabled={isSubmitting}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
              >
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-3.5 rounded-md text-xs font-bold bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : editingSantri ? (
                  <>
                    <Pencil className="w-3.5 h-3.5 text-[#FFEFC4]" />
                    <span>Simpan Perubahan</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#FFEFC4]" />
                    <span>Daftarkan Santri Baru</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ================= PANEL KANAN: TABEL SANTRI (MAMPAT) ================= */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
          {/* Header Controls: Tab Kelas 1 s/d 6 (Tanpa Tab Semua) & Search */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white dark:bg-zinc-900">
            {/* Tabs Kelas (Hanya Kelas 1 - 6) */}
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-md text-xs font-medium">
              {kelasOptions.map((kelas) => (
                <button
                  key={kelas}
                  onClick={() => {
                    setSelectedKelas(kelas);
                    if (!editingSantri) {
                      setFormData(prev => ({ ...prev, kelas }));
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                    selectedKelas === kelas
                      ? 'bg-white dark:bg-zinc-900 text-[#086288] dark:text-[#97D7FF] font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {kelas}
                </button>
              ))}
            </div>

            {/* Search Input Mampat */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari di ${selectedKelas}...`}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
              />
            </div>
          </div>

          {/* Tabel Mampat: Format Kolom [No, Nama, Kelas Al-Qur'an, Aksi] */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center">No</th>
                  <th className="px-3.5 py-2.5">Nama</th>
                  <th className="px-3.5 py-2.5">Kelas Al-Qur&apos;an</th>
                  <th className="px-3.5 py-2.5 text-right w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#086288]" />
                        <span>Memuat data dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSantri.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-400">
                      Tidak ada data santri di {selectedKelas} {searchQuery ? `yang cocok dengan "${searchQuery}"` : ''}.
                    </td>
                  </tr>
                ) : (
                  filteredSantri.map((santri, idx) => (
                    <tr 
                      key={santri.id} 
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                        editingSantri?.id === santri.id ? 'bg-[#086288]/5 dark:bg-[#086288]/20' : ''
                      }`}
                    >
                      {/* 1. NO */}
                      <td className="px-3.5 py-2.5 text-center text-zinc-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* 2. NAMA */}
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                          {santri.nama}
                        </div>
                      </td>

                      {/* 3. KELAS AL-QUR'AN */}
                      <td className="px-3.5 py-2.5">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-[#086288] dark:text-[#97D7FF] border border-zinc-200 dark:border-zinc-700">
                          {santri.kelas}
                        </span>
                      </td>

                      {/* 4. AKSI */}
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(santri)}
                            className="p-1 rounded text-zinc-400 hover:text-[#086288] dark:hover:text-[#97D7FF] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Santri"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(santri.id, santri.nama)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Mampat */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Total: {filteredSantri.length} santri ({selectedKelas})</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-[11px]" disabled>
                Prev
              </button>
              <span className="px-2 py-0.5 rounded bg-[#086288] text-white font-semibold text-[11px]">1</span>
              <button className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-[11px]" disabled>
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
