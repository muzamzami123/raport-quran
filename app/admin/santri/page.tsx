"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  School,
  BookOpen
} from 'lucide-react';

interface Santri {
  id: string;
  nis?: string;
  nama: string;
  jenjang?: string;
  kelas: string; // Kelas Al-Qur'an (Rombel dari Data Kelas)
  program?: string;
  pembina?: string;
  statusUjian?: 'Sudah Diuji' | 'Belum Ujian';
  nilaiTerakhir?: number;
}

export default function DataSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [dbKelasList, setDbKelasList] = useState<string[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Kelas 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Memeriksa koneksi database...',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Nama, Jenjang Diniyah, dan Kelas Al-Qur'an (Rombel)
  const [formData, setFormData] = useState({
    nama: '',
    jenjang: 'Kelas 1',
    kelas: '',
  });

  const jenjangOptions = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  // Load Data Santri & Daftar Kelas Al-Qur'an dari MongoDB via API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 1. Ambil daftar Kelas Al-Qur'an dari /api/kelas
        try {
          const resKelas = await fetch('/api/kelas', { cache: 'no-store' });
          const jsonKelas = await resKelas.json();
          if (jsonKelas.success && Array.isArray(jsonKelas.data)) {
            const classNames = jsonKelas.data.map((k: any) => k.nama);
            setDbKelasList(classNames);
          }
        } catch (err: any) {
          console.warn('Gagal memuat opsi kelas dari /api/kelas:', err?.message);
        }

        // 2. Ambil data Santri dari /api/santri
        const resSantri = await fetch('/api/santri', { cache: 'no-store' });
        const jsonSantri = await resSantri.json();
        if (jsonSantri.success && Array.isArray(jsonSantri.data)) {
          const seen = new Set<string>();
          const uniqueSantri = jsonSantri.data.filter((s: Santri) => {
            if (!s.id || seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          setSantriList(uniqueSantri);
          if (jsonSantri.source === 'mongodb') {
            setDbStatus({
              connected: true,
              message: 'MongoDB Compass Terhubung (raport_quran.santri)'
            });
          } else {
            setDbStatus({
              connected: false,
              message: jsonSantri.warning || 'Mode Lokal (MongoDB Belum Terhubung)'
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

  const resetForm = (jenjangTarget = selectedJenjang) => {
    setEditingSantri(null);
    setFormData({
      nama: '',
      jenjang: jenjangTarget === 'Semua' ? 'Kelas 1' : jenjangTarget,
      kelas: '',
    });
  };

  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setFormData({
      nama: santri.nama,
      jenjang: santri.jenjang || 'Kelas 1',
      kelas: santri.kelas && santri.kelas !== '-' ? santri.kelas : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    setIsSubmitting(true);
    const chosenKelas = editingSantri ? (editingSantri.kelas || '-') : (formData.kelas ? formData.kelas.trim() : '-');
    const chosenJenjang = formData.jenjang || 'Kelas 1';

    try {
      if (editingSantri) {
        // Update santri di MongoDB
        const res = await fetch('/api/santri', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSantri.id,
            nama: formData.nama.trim(),
            jenjang: chosenJenjang,
            kelas: chosenKelas,
          })
        });

        const json = await res.json();
        if (json.success) {
          setSantriList(prev => prev.map(item => {
            if (item.id === editingSantri.id) {
              return {
                ...item,
                nama: formData.nama.trim(),
                jenjang: chosenJenjang,
                kelas: chosenKelas,
              };
            }
            return item;
          }));
          setNotification(`Data santri "${formData.nama.trim()}" berhasil diperbarui.`);
          resetForm(chosenJenjang);
        }
      } else {
        // Daftarkan santri baru ke MongoDB
        const res = await fetch('/api/santri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: formData.nama.trim(),
            jenjang: chosenJenjang,
            kelas: chosenKelas,
          })
        });

        const json = await res.json();
        if (json.success && json.data) {
          const createdSantri = json.data;
          setSantriList(prev => [createdSantri, ...prev]);
          setSelectedJenjang(chosenJenjang);
          setNotification(`Santri "${createdSantri.nama}" berhasil didaftarkan ke ${chosenJenjang}.`);
          resetForm(chosenJenjang);
        }
      }
    } catch (err: any) {
      console.error('Error menyimpan ke database:', err.message);
      // Fallback local update
      if (editingSantri) {
        setSantriList(prev => prev.map(item => item.id === editingSantri.id ? { 
          ...item, 
          nama: formData.nama.trim(), 
          jenjang: chosenJenjang,
          kelas: chosenKelas 
        } : item));
      } else {
        const localSantri: Santri = {
          id: Date.now().toString(),
          nama: formData.nama.trim(),
          jenjang: chosenJenjang,
          kelas: chosenKelas,
        };
        setSantriList(prev => [localSantri, ...prev]);
        setSelectedJenjang(chosenJenjang);
      }
      setNotification(`Data santri "${formData.nama.trim()}" berhasil disimpan.`);
      resetForm(chosenJenjang);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setNotification(null), 4000;
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

  // Filter Data santri: jika sedang mencari nama santri, cari di seluruh jenjang tanpa terbatas tab yang dipilih
  const isSearching = searchQuery.trim().length > 0;
  const filteredSantri = santriList.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (isSearching) {
      return (
        item.nama.toLowerCase().includes(q) ||
        (item.kelas || '').toLowerCase().includes(q)
      );
    }
    return selectedJenjang === 'Semua' || (item.jenjang || 'Kelas 1') === selectedJenjang;
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
            Buku induk santri aktif terintegrasi dengan Kelas Al-Qur&apos;an di MongoDB.
          </p>
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
                  {editingSantri ? 'Perbarui nama & jenjang santri' : 'Input nama dan jenjang kelas santri'}
                </p>
              </div>
            </div>

            {editingSantri && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded transition-colors cursor-pointer"
                title="Batal Edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Batal</span>
              </button>
            )}
          </div>

          {/* Form Body: Nama, Jenjang Kelas, & Kelas Al-Qur'an */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* 1. Nama Lengkap Santri */}
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

            {/* 2. Jenjang Kelas (Tingkat Diniyah) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-zinc-400" />
                <span>Jenjang Kelas (Diniyah)</span>
                <span className="text-amber-500">*</span>
              </label>
              <select
                value={formData.jenjang}
                disabled={isSubmitting}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
              >
                {jenjangOptions.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-3.5 rounded-md text-xs font-bold bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
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
          {/* Header Controls: Tab Jenjang Kelas (Kelas 1 - Kelas 6) & Search */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white dark:bg-zinc-900">
            {/* Tabs Jenjang Kelas */}
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-md text-xs font-medium">
              {jenjangOptions.map((jenjang) => (
                <button
                  type="button"
                  key={jenjang}
                  onClick={() => {
                    setSelectedJenjang(jenjang);
                    if (!editingSantri) resetForm(jenjang);
                  }}
                  className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    selectedJenjang === jenjang
                      ? 'bg-white dark:bg-zinc-900 text-[#086288] dark:text-[#97D7FF] font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {jenjang}
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
                placeholder="Cari nama santri..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
              />
            </div>
          </div>

          {/* Tabel Mampat: Format Kolom [No, Nama, Jenjang, Kelas Al-Qur'an, Aksi] */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center">No</th>
                  <th className="px-3.5 py-2.5">Nama</th>
                  <th className="px-3.5 py-2.5 w-24">Jenjang</th>
                  <th className="px-3.5 py-2.5">Kelas Al-Qur&apos;an</th>
                  <th className="px-3.5 py-2.5 text-right w-20">Aksi</th>
                </tr>
              </thead>
              <tbody
                key={isSearching ? `search-${searchQuery}` : selectedJenjang}
                className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#086288]" />
                        <span>Memuat data dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSantri.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                      {isSearching
                        ? `Tidak ada nama santri yang cocok dengan "${searchQuery}".`
                        : `Tidak ada data santri di ${selectedJenjang}.`}
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

                      {/* 3. JENJANG */}
                      <td className="px-3.5 py-2.5">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                          {santri.jenjang || 'Kelas 1'}
                        </span>
                      </td>

                      {/* 4. KELAS AL-QUR'AN (Terintegrasi dari Data Kelas, bukan terisi jenjang) */}
                      <td className="px-3.5 py-2.5">
                        {santri.kelas && santri.kelas !== '-' && santri.kelas.toLowerCase() !== 'belum ada' ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-[#086288]/10 text-[#086288] dark:text-[#FFEFC4] border border-[#086288]/30">
                            {santri.kelas}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            - Belum Ada Kelas -
                          </span>
                        )}
                      </td>

                      {/* 5. AKSI */}
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(santri)}
                            className="p-1 rounded text-zinc-400 hover:text-[#086288] dark:hover:text-[#97D7FF] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Santri"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(santri.id, santri.nama)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
            <span>
              {isSearching
                ? `Hasil pencarian: ${filteredSantri.length} santri ditemukan`
                : `Total: ${filteredSantri.length} santri (${selectedJenjang})`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
