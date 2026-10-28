"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Search, 
  FileDown, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  UserPlus, 
  RotateCcw,
  Database,
  Loader2,
  Users,
  Layers
} from 'lucide-react';

interface Guru {
  id: string;
  nip?: string;
  name: string;
  bidang?: string;
  wali?: string;
  kontak?: string;
  status?: string;
}

interface KelasItem {
  id: string;
  nama: string;
  wali: string;
  waliList?: string[];
}

export default function DataGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Memeriksa database...',
  });

  // Form State: Hanya Nama Asatidz & Gelar
  const [formData, setFormData] = useState({
    name: '',
  });

  // Load Data Guru & Kelas dari MongoDB Compass via API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load Guru tanpa cache browser
        const res = await fetch('/api/guru', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGuruList(json.data);
          if (json.source === 'mongodb') {
            setDbStatus({
              connected: true,
              message: 'MongoDB Compass Terhubung (raport_quran.guru)',
            });
          } else {
            setDbStatus({
              connected: false,
              message: 'Mode Lokal (Offline)',
            });
          }
        }

        // Load Kelas untuk menghubungkan kelas yang diampu
        const resKelas = await fetch('/api/kelas');
        const jsonKelas = await resKelas.json();
        if (jsonKelas.success && Array.isArray(jsonKelas.data)) {
          setKelasList(jsonKelas.data);
        }
      } catch (err: any) {
        console.warn('Gagal memuat /api/guru:', err?.message);
        setDbStatus({
          connected: false,
          message: 'Koneksi database offline',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
    });
    setEditingGuru(null);
  };

  const handleStartEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setFormData({
      name: guru.name,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    if (editingGuru) {
      // MODE EDIT (PUT)
      const oldName = editingGuru.name;
      const newName = formData.name.trim();
      const updatedPayload = {
        id: editingGuru.id,
        name: newName,
        oldName: oldName,
        wali: editingGuru.wali || '',
      };

      try {
        const res = await fetch('/api/guru', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload),
        });
        const json = await res.json();
        if (json.success) {
          // Perbarui state guru
          setGuruList(prev =>
            prev.map(item =>
              item.id === editingGuru.id
                ? { ...item, name: newName }
                : item
            )
          );

          // Segera sinkronkan state kelasList agar kelas yang diisi tetap muncul dan tidak menjadi '-'
          setKelasList(prevKelas =>
            prevKelas.map(k => {
              const currentList = Array.isArray(k.waliList) && k.waliList.length > 0
                ? k.waliList
                : k.wali
                ? k.wali.split(/\s*[|•]\s*/).map(w => w.trim()).filter(Boolean)
                : [];

              const hasMatch = currentList.some(
                w => w.trim().toLowerCase() === oldName.trim().toLowerCase() ||
                     w.toLowerCase().includes(oldName.toLowerCase()) ||
                     oldName.toLowerCase().includes(w.toLowerCase())
              ) || (k.wali && (k.wali.toLowerCase().includes(oldName.toLowerCase()) || oldName.toLowerCase().includes(k.wali.toLowerCase())));

              if (hasMatch) {
                const nextList = currentList.map(w =>
                  w.trim().toLowerCase() === oldName.trim().toLowerCase() ||
                  w.toLowerCase().includes(oldName.toLowerCase()) ||
                  oldName.toLowerCase().includes(w.toLowerCase())
                    ? newName
                    : w
                );
                return {
                  ...k,
                  wali: nextList.length > 0 ? nextList.join(' | ') : newName,
                  waliList: nextList.length > 0 ? nextList : [newName],
                };
              }
              return k;
            })
          );

          // Muat ulang kelas dari MongoDB Compass di latar belakang
          fetch('/api/kelas', { cache: 'no-store' })
            .then(r => r.json())
            .then(j => {
              if (j.success && Array.isArray(j.data)) setKelasList(j.data);
            })
            .catch(() => {});

          setNotification(`Data guru "${newName}" berhasil diperbarui di MongoDB.`);
        } else {
          throw new Error(json.error || 'Gagal update');
        }
      } catch {
        setGuruList(prev =>
          prev.map(item =>
            item.id === editingGuru.id
              ? { ...item, name: newName }
              : item
          )
        );
        setNotification(`Data guru "${newName}" telah diperbarui.`);
      } finally {
        setIsSubmitting(false);
        resetForm();
        setTimeout(() => setNotification(null), 3500);
      }
    } else {
      // MODE TAMBAH BARU (POST)
      const autoNIP = `G-00${guruList.length + 1}`;
      const newGuruPayload: Guru = {
        id: Date.now().toString(),
        nip: autoNIP,
        name: formData.name.trim(),
        wali: '',
        bidang: 'Tahfidz & Murojaah',
        kontak: '+62 8',
        status: 'Aktif',
      };

      try {
        const res = await fetch('/api/guru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGuruPayload),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setGuruList(prev => [...prev, json.data]);
          setNotification(`Guru baru "${formData.name}" berhasil didaftarkan ke MongoDB.`);
        } else {
          setGuruList(prev => [...prev, newGuruPayload]);
          setNotification(`Guru "${formData.name}" berhasil ditambahkan.`);
        }
      } catch {
        setGuruList(prev => [...prev, newGuruPayload]);
        setNotification(`Guru "${formData.name}" telah ditambahkan.`);
      } finally {
        setIsSubmitting(false);
        resetForm();
        setTimeout(() => setNotification(null), 3500);
      }
    }
  };

  const handleDelete = async (guru: Guru) => {
    const result = await Swal.fire({
      title: 'Hapus Data Guru?',
      html: `Apakah Anda yakin ingin menghapus <b>${guru.name}</b>?<br/><span style="font-size: 11px; color: #71717a;">Data akan dihapus secara permanen dari MongoDB Compass.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#086288',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        const queryParams = new URLSearchParams();
        if (guru.id) queryParams.set('id', guru.id);
        if (guru.name) queryParams.set('name', guru.name);

        const res = await fetch(`/api/guru?${queryParams.toString()}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        
        if (json.success && json.deletedCount > 0) {
          // Hanya hapus dari tampilan jika benar-benar terhapus dari database
          setGuruList(prev => prev.filter(item => item.id !== guru.id && item.name !== guru.name));
          if (editingGuru && (editingGuru.id === guru.id || editingGuru.name === guru.name)) {
            resetForm();
          }
          Swal.fire({
            title: 'Berhasil Dihapus!',
            text: `Data guru "${guru.name}" telah dihapus secara permanen dari MongoDB.`,
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
          });
          setNotification(`Data guru "${guru.name}" telah dihapus dari database.`);
        } else {
          // Beri tahu pengguna jika database gagal menghapus data
          Swal.fire({
            title: 'Gagal Menghapus',
            text: json.error || 'Data guru tidak ditemukan di MongoDB Compass.',
            icon: 'error',
            confirmButtonColor: '#086288',
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'Koneksi Terputus',
          text: err?.message || 'Gagal tersambung ke server atau database.',
          icon: 'error',
          confirmButtonColor: '#086288',
        });
      } finally {
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Helper untuk menentukan kelas yang diampu oleh guru dari data kelas
  const getAssignedClasses = (guru: Guru): string => {
    const guruName = (guru.name || '').trim().toLowerCase();
    if (!guruName) return guru.wali || '-';

    const assigned = kelasList
      .filter(k => {
        const waliItems: string[] = Array.isArray(k.waliList) && k.waliList.length > 0
          ? k.waliList
          : k.wali
          ? k.wali.split(/\s*[|•]\s*/).map(w => w.trim()).filter(Boolean)
          : [];

        const inList = waliItems.some(w => {
          const lowerW = w.trim().toLowerCase();
          return lowerW === guruName || lowerW.includes(guruName) || guruName.includes(lowerW);
        });

        if (inList) return true;

        if (k.wali) {
          const lowerWali = k.wali.toLowerCase();
          return lowerWali.includes(guruName) || guruName.includes(lowerWali);
        }

        return false;
      })
      .map(k => k.nama);

    if (assigned.length > 0) {
      return assigned.join(', ');
    }
    return guru.wali || '-';
  };

  // Filter pencarian nama atau kelas
  const filteredGuru = guruList.filter(guru => {
    const q = searchQuery.toLowerCase();
    const assigned = getAssignedClasses(guru).toLowerCase();
    const matchName = guru.name.toLowerCase().includes(q);
    const matchKelas = assigned.includes(q);
    return matchName || matchKelas;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Data Dewan Asatidz &amp; Pengajar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manajemen pendataan asatidz dan pembina halaqah raport Qur&apos;an.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-medium animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Split Grid: KIRI = Input Mendata Guru Baru, KANAN = Tabel Guru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================= PANEL KIRI: FORM PENDATAAN GURU BARU ================= */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
          {/* Card Header Form */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#086288] text-[#FFEFC4] flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {editingGuru ? 'Edit Data Guru' : 'Pendataan Guru Baru'}
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {editingGuru ? 'Perbarui nama asatidz & gelar' : 'Input nama asatidz dan pembina baru'}
                </p>
              </div>
            </div>

            {editingGuru && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded transition-colors cursor-pointer"
                title="Batal Edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Batal</span>
              </button>
            )}
          </div>

          {/* Form Body: Hanya Nama Asatidz & Gelar */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* Nama Lengkap Guru / Asatidz */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Asatidz &amp; Gelar <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ustadz Ahmad, S.Pd.I"
                className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="w-full py-2 px-4 bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke MongoDB...</span>
                  </>
                ) : (
                  <>
                    {editingGuru ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFEFC4]" />
                        <span>Perbarui Data Guru</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 text-[#FFEFC4]" />
                        <span>Simpan Data Guru Baru</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Tip Footer */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Data tersinkron otomatis ke koleksi <b>raport_quran.guru</b> di MongoDB Compass.</span>
            </p>
          </div>
        </div>

        {/* ================= PANEL KANAN: TABEL GURU (No, Nama, Kelas yang Diisi, Aksi) ================= */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
          
          {/* Top Filter Bar */}
          <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama guru atau kelas..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <Users className="w-3.5 h-3.5 text-[#086288]" />
              <span>{filteredGuru.length} Guru Terdaftar</span>
            </div>
          </div>

          {/* Tabel Guru Sesuai Format: No, Nama, Kelas yang Diisi, Aksi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kelas yang Diisi</th>
                  <th className="px-4 py-3 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#086288]" />
                        <span>Memuat data guru dari MongoDB...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGuru.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                      Tidak ditemukan data guru yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map((guru, idx) => {
                    const isSelected = editingGuru?.id === guru.id;
                    const assignedClass = getAssignedClasses(guru);
                    return (
                      <tr 
                        key={guru.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-amber-50/70 dark:bg-amber-950/20' 
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* 1. NO */}
                        <td className="px-4 py-3 text-center text-zinc-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* 2. NAMA */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            {guru.name}
                          </div>
                          {guru.nip && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              NIP: {guru.nip}
                            </span>
                          )}
                        </td>

                        {/* 3. KELAS YANG DIISI */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-[#086288] dark:text-[#97D7FF] border border-sky-200 dark:border-sky-800/50">
                            <Layers className="w-3 h-3 text-[#086288] dark:text-[#97D7FF]" />
                            <span>{assignedClass}</span>
                          </span>
                        </td>

                        {/* 4. AKSI */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(guru)}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#086288] text-[#FFEFC4]'
                                  : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                              title="Edit Data Guru"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(guru)}
                              className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Hapus Data Guru"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Menampilkan {filteredGuru.length} guru</span>
            <span className="text-[11px] text-zinc-400">
              Total {guruList.length} asatidz terdaftar
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
