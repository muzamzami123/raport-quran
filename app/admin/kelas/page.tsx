"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Search, 
  Pencil, 
  Trash2, 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Check,
  ChevronDown
} from 'lucide-react';

interface KelasItem {
  id: string;
  kode?: string;
  nama: string;
  program?: string;
  wali: string;
  waliList?: string[];
  jumlah?: number;
  kapasitas?: number;
  ruangan?: string;
  status?: string;
}

interface SantriItem {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jenjang?: string;
  program?: string;
  pembina?: string;
}

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [santriList, setSantriList] = useState<SantriItem[]>([]);
  const [guruOptions, setGuruOptions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [santriSearchQuery, setSantriSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [editingKelas, setEditingKelas] = useState<KelasItem | null>(null);
  const [isClassInfoEditMode, setIsClassInfoEditMode] = useState(false);
  const [isSantriEditMode, setIsSantriEditMode] = useState(false);
  const [isAddingSantriMode, setIsAddingSantriMode] = useState(false);
  const [isGuruDropdownOpen, setIsGuruDropdownOpen] = useState(false);
  const [selectedAddingJenjang, setSelectedAddingJenjang] = useState<string>('Kelas 1');
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hanya tampilkan skeleton jika pemuatan data memakan waktu (>200ms)
  // Jika respons cepat, langsung tampilkan konten tanpa kedipan skeleton
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  // Form State: Nama Kelas, Kategori, & Guru Pengampu (bisa 1, 2, atau lebih guru)
  const [formData, setFormData] = useState({
    nama: '',
    program: 'Murottal',
    wali: '',
    waliList: [] as string[],
  });

  // Helper untuk memisahkan daftar guru pengampu dari string atau array
  const parseWaliList = (kelas: { wali?: string; waliList?: string[] }, options = guruOptions): string[] => {
    let list: string[] = [];
    if (Array.isArray(kelas.waliList) && kelas.waliList.length > 0) {
      list = kelas.waliList.filter(Boolean);
    } else {
      const raw = (kelas.wali || '').trim();
      if (!raw || raw === '-') return [];
      if (raw.includes(' | ') || raw.includes(' • ')) {
        list = raw.split(/\s*[|•]\s*/).map((s) => s.trim()).filter(Boolean);
      } else {
        list = [raw];
      }
    }

    // Jika daftar guru aktif sudah dimuat, sinkronkan nama lama
    if (options.length > 0) {
      const mapped = list.map((item) => {
        if (options.includes(item)) return item;
        // Jika nama lama mengandung "arif" dan ada guru "rendra" di options
        if (item.toLowerCase().includes('arif') && options.some((g) => g.toLowerCase().includes('rendra'))) {
          return options.find((g) => g.toLowerCase().includes('rendra'))!;
        }
        // Cari kecocokan parsial
        const partial = options.find(
          (g) => g.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(g.toLowerCase())
        );
        if (partial) return partial;
        return item;
      });

      // Filter hanya guru yang benar-benar terdaftar di options
      const valid = mapped.filter((item) => options.includes(item));
      if (valid.length > 0) return Array.from(new Set(valid));
    }

    return list;
  };

  const toggleGuruSelection = (guruName: string) => {
    setFormData((prev) => {
      const exists = prev.waliList.includes(guruName);
      const nextList = exists
        ? prev.waliList.filter((g) => g !== guruName)
        : [...prev.waliList, guruName];
      return {
        ...prev,
        waliList: nextList,
        wali: nextList.join(' | '),
      };
    });
  };

  // Load Data Kelas, Guru & Santri dari MongoDB via API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Load Kelas dari MongoDB
        const resKelas = await fetch('/api/kelas', { cache: 'no-store' });
        const jsonKelas = await resKelas.json();
        if (jsonKelas.success && Array.isArray(jsonKelas.data)) {
          setKelasList(jsonKelas.data);
        }

        // 2. Load Guru dari MongoDB untuk opsi dropdown pengampu
        const resGuru = await fetch('/api/guru', { cache: 'no-store' });
        const jsonGuru = await resGuru.json();
        if (jsonGuru.success && Array.isArray(jsonGuru.data) && jsonGuru.data.length > 0) {
          const names = jsonGuru.data.map((g: any) => g.name);
          setGuruOptions(names);
        }

        // 3. Load Santri dari MongoDB untuk menghubungkan data santri di kelas
        const resSantri = await fetch('/api/santri', { cache: 'no-store' });
        const jsonSantri = await resSantri.json();
        if (jsonSantri.success && Array.isArray(jsonSantri.data)) {
          setSantriList(jsonSantri.data);
        }
      } catch (err: any) {
        console.warn('Gagal memuat data kelas:', err?.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      nama: '',
      program: 'Murottal',
      wali: '',
      waliList: [],
    });
    setEditingKelas(null);
    setIsClassInfoEditMode(false);
    setSantriSearchQuery('');
    setIsSantriEditMode(false);
    setIsAddingSantriMode(false);
    setIsGuruDropdownOpen(false);
  };

  const syncFormDataWithKelas = (kelas: KelasItem) => {
    const resolvedProg =
      kelas.program ||
      (kelas.nama.toLowerCase().includes('murojaah')
        ? 'Murojaah'
        : kelas.nama.toLowerCase().includes('tafsir')
        ? 'Tafsir'
        : 'Murottal');
    const parsedWali = parseWaliList(kelas);
    setFormData({
      nama: kelas.nama,
      program: resolvedProg,
      wali: parsedWali.join(' | '),
      waliList: parsedWali,
    });
  };

  const handleStartEdit = (kelas: KelasItem) => {
    setEditingKelas(kelas);
    setIsClassInfoEditMode(false);
    setSantriSearchQuery('');
    setIsSantriEditMode(false);
    setIsAddingSantriMode(false);
    setIsGuruDropdownOpen(false);
    syncFormDataWithKelas(kelas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelClassInfoEdit = () => {
    if (editingKelas) {
      syncFormDataWithKelas(editingKelas);
    }
    setIsGuruDropdownOpen(false);
    setIsClassInfoEditMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    setIsSubmitting(true);
    const finalWaliList = formData.waliList.filter(Boolean);
    const finalWaliString = finalWaliList.length > 0 ? finalWaliList.join(' | ') : formData.wali.trim();

    if (editingKelas) {
      // MODE EDIT (PUT)
      const updatedPayload: KelasItem = {
        id: editingKelas.id,
        kode: editingKelas.kode || 'HAL-01A',
        nama: formData.nama.trim(),
        program: formData.program,
        wali: finalWaliString,
        waliList: finalWaliList,
        status: editingKelas.status || 'Aktif',
      };

      try {
        const res = await fetch('/api/kelas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload),
        });
        const json = await res.json();
        if (json.success) {
          setKelasList(prev =>
            prev.map(item =>
              item.id === editingKelas.id
                ? { ...item, ...updatedPayload }
                : item
            )
          );
          setEditingKelas(prev => prev ? { ...prev, ...updatedPayload } : null);
          setIsClassInfoEditMode(false);
          setIsGuruDropdownOpen(false);
          Swal.fire({
            title: 'Perubahan Disimpan!',
            text: `Data kelas "${updatedPayload.nama}" berhasil diperbarui di MongoDB.`,
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
          });
        } else {
          throw new Error(json.error || 'Gagal update');
        }
      } catch {
        setKelasList(prev =>
          prev.map(item =>
            item.id === editingKelas.id
              ? { ...item, ...updatedPayload }
              : item
          )
        );
        setEditingKelas(prev => prev ? { ...prev, ...updatedPayload } : null);
        setIsClassInfoEditMode(false);
        setIsGuruDropdownOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // MODE TAMBAH BARU (POST)
      const autoKode = `HAL-0${kelasList.length + 1}A`;
      const newKelasPayload: KelasItem = {
        id: Date.now().toString(),
        kode: autoKode,
        nama: formData.nama.trim(),
        program: formData.program,
        wali: finalWaliString,
        waliList: finalWaliList,
        jumlah: 0,
        status: 'Aktif',
      };

      try {
        const res = await fetch('/api/kelas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newKelasPayload),
        });
        const json = await res.json();
        if (json.success) {
          setKelasList(prev => [json.data, ...prev]);
          Swal.fire({
            title: 'Berhasil Ditambahkan!',
            text: `Kelas "${formData.nama}" berhasil disimpan ke MongoDB.`,
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
          });
        }
      } catch {
        setKelasList(prev => [newKelasPayload, ...prev]);
      } finally {
        setIsSubmitting(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (kelas: KelasItem) => {
    const result = await Swal.fire({
      title: 'Hapus Data Kelas?',
      html: `Apakah Anda yakin ingin menghapus kelas <b>${kelas.nama}</b>?<br/><span style="font-size: 11px; color: #71717a;">Data akan dihapus secara permanen dari MongoDB.</span>`,
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
        if (kelas.id) queryParams.set('id', kelas.id);
        if (kelas.nama) queryParams.set('nama', kelas.nama);

        const res = await fetch(`/api/kelas?${queryParams.toString()}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success && json.deletedCount > 0) {
          setKelasList(prev => prev.filter(item => item.id !== kelas.id && item.nama !== kelas.nama));
          if (editingKelas && (editingKelas.id === kelas.id || editingKelas.nama === kelas.nama)) {
            resetForm();
          }
          Swal.fire({
            title: 'Berhasil Dihapus!',
            text: `Data kelas "${kelas.nama}" telah dihapus secara permanen dari MongoDB.`,
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Gagal Menghapus',
            text: json.error || 'Data kelas tidak ditemukan di MongoDB Compass.',
            icon: 'error',
            confirmButtonColor: '#086288',
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'Koneksi Terputus',
          text: err?.message || 'Gagal tersambung ke database.',
          icon: 'error',
          confirmButtonColor: '#086288',
        });
      }
    }
  };

  // Helper untuk menghapus atau mengeluarkan santri dari kelas
  const handleDeleteSantri = async (santri: SantriItem) => {
    const result = await Swal.fire({
      title: 'Hapus Santri dari Kelas?',
      html: `Apakah Anda yakin ingin mengeluarkan santri <b>${santri.nama}</b> dari kelas <b>${editingKelas?.nama}</b>?<br/><span style="font-size: 11px; color: #71717a;">Pilih opsi untuk mengeluarkan dari kelas ini atau hapus permanen data santri.</span>`,
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#086288',
      denyButtonColor: '#dc2626',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Keluarkan dari Kelas',
      denyButtonText: 'Hapus Permanen',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      // 1. Keluarkan santri dari rombel (Ubah kelas jadi '-')
      try {
        const res = await fetch('/api/santri', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: santri.id,
            nama: santri.nama,
            kelas: '-',
          }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Gagal update database');
        }
      } catch (err: any) {
        console.warn('Update santri status offline / fallback:', err?.message);
      } finally {
        // Update state santriList secara optimis agar nama santri langsung hilang dari rombel
        setSantriList(prev => prev.map(s => s.id === santri.id ? { ...s, kelas: '-' } : s));
        Swal.fire({
          title: 'Berhasil Dikeluarkan!',
          text: `Santri "${santri.nama}" telah dikeluarkan dari kelas ${editingKelas?.nama}.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } else if (result.isDenied) {
      // 2. Hapus permanen santri dari database MongoDB
      try {
        const res = await fetch(`/api/santri?id=${santri.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Gagal menghapus santri');
        }
      } catch (err: any) {
        console.warn('Delete santri status offline / fallback:', err?.message);
      } finally {
        // Hapus permanen dari state
        setSantriList(prev => prev.filter(s => s.id !== santri.id));
        Swal.fire({
          title: 'Berhasil Dihapus!',
          text: `Data santri "${santri.nama}" telah dihapus permanen.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
        });
      }
    }
  };

  // Toggle santri masuk atau keluar dari kelas yang sedang diedit (fitur centang)
  const handleToggleSantriInClass = async (santri: SantriItem) => {
    if (!editingKelas) return;

    const isCurrentlyInClass = santriInClass.some((sc) => sc.id === santri.id);
    const newKelas = isCurrentlyInClass ? '-' : editingKelas.nama;

    // Optimistic state update langsung agar centang berganti tanpa lag
    setSantriList((prev) =>
      prev.map((s) => (s.id === santri.id ? { ...s, kelas: newKelas } : s))
    );

    // Kirim sinkronisasi ke MongoDB di latar belakang tanpa notifikasi lompat layar
    try {
      await fetch('/api/santri', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: santri.id,
          nama: santri.nama,
          kelas: newKelas,
        }),
      });
    } catch (err: any) {
      console.warn('Sync offline:', err?.message);
    }
  };


  // Helper untuk menentukan kategori program kelas
  const getKategori = (kelas: KelasItem): string => {
    if (kelas.program) return kelas.program;
    const lower = kelas.nama.toLowerCase();
    if (lower.includes('murojaah')) return 'Murojaah';
    if (lower.includes('tafsir')) return 'Tafsir';
    return 'Murottal';
  };

  // Helper untuk mencocokkan santri yang terhubung dengan suatu kelas
  const getSantriInClass = (kelas: KelasItem | null): SantriItem[] => {
    if (!kelas) return [];

    // Normalisasi string: hilangkan kata umum seperti 'kelas' / 'halaqah' dan karakter pemisah
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/\b(kelas|halaqah|rombel)\b/g, '')
        .replace(/[^a-z0-9]/g, '');

    const normKelasNama = normalize(kelas.nama);
    const normKelasKode = kelas.kode ? normalize(kelas.kode) : '';

    return santriList.filter((s) => {
      // Jika santri belum punya kelas atau dikeluarkan (tanda '-' atau kosong), jangan masukkan ke kelas manapun
      if (!s.kelas || s.kelas.trim() === '-' || s.kelas.trim() === '' || s.kelas.toLowerCase() === 'belum ada') {
        return false;
      }

      const normSantriKelas = normalize(s.kelas);
      if (!normSantriKelas) return false;

      // 1. Pencocokan nama sama persis (case-insensitive)
      if (s.kelas.trim().toLowerCase() === kelas.nama.trim().toLowerCase()) return true;

      // 2. Pencocokan hasil normalisasi (cth: "Kelas 1A" vs "1-A" keduanya menghasilkan "1a")
      if (normSantriKelas === normKelasNama) return true;

      // 3. Pencocokan terhadap kode kelas (cth: "HAL-01A" vs "01a")
      if (normKelasKode && normSantriKelas === normKelasKode) return true;

      return false;
    });
  };

  // Filter pencarian dan kategori kelas (untuk tabel list)
  const filteredKelas = kelasList.filter((kelas) => {
    const q = searchQuery.toLowerCase();
    const kategori = getKategori(kelas);
    const matchCategory = selectedCategory === 'Semua' || kategori.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery = kelas.nama.toLowerCase().includes(q) ||
                       (kelas.wali || '').toLowerCase().includes(q) ||
                       kategori.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  // Santri di dalam kelas yang sedang diedit
  const santriInClass = editingKelas ? getSantriInClass(editingKelas) : [];
  const filteredSantriInClass = santriInClass.filter((s) => {
    const q = santriSearchQuery.toLowerCase();
    return s.nama.toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
  });

  // Ringkasan distribusi jenjang santri di kelas ini
  const jenjangDistribution = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']
    .map((jenjang) => ({
      jenjang,
      count: santriInClass.filter((s) => (s.jenjang || 'Kelas 1') === jenjang).length,
    }))
    .filter((item) => item.count > 0);

  // Daftar guru pengampu pada kelas yang sedang dilihat
  const currentEditingWaliList = editingKelas ? parseWaliList(editingKelas) : [];

  // Santri yang tampil dalam mode penambahan: jika sedang mencari nama santri, cari di seluruh jenjang
  const isSearchingAddingSantri = santriSearchQuery.trim().length > 0;
  const availableSantriList = santriList.filter((s) => {
    const q = santriSearchQuery.trim().toLowerCase();
    if (isSearchingAddingSantri) {
      return s.nama.toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
    }
    return selectedAddingJenjang === 'Semua' || (s.jenjang || 'Kelas 1') === selectedAddingJenjang;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          {editingKelas && (
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Kembali ke Daftar Kelas"
              aria-label="Kembali ke Daftar Kelas"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {editingKelas ? `Detail Kelas: ${editingKelas.nama}` : 'Data Kelas'}
            </h1>
            {editingKelas && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Program {getKategori(editingKelas)} • {santriInClass.length} santri terdaftar
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KONDISIONAL TAMPILAN: JIKA SEDANG EDIT/DETAIL vs JIKA SEDANG LIHAT DAFTAR */}
      {/* ========================================================================= */}

      {editingKelas ? (
        /* ================= TAMPILAN DETAIL KELAS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Panel Kiri: Informasi Kelas (Read-Only secara default, hanya bisa diedit jika menekan tombol Edit) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Informasi Kelas
              </h2>
              {!isClassInfoEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    syncFormDataWithKelas(editingKelas);
                    setIsClassInfoEditMode(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isClassInfoEditMode ? (
              /* MODE EDIT INFORMASI KELAS */
              <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
                {/* Nama Kelas */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: 1-A"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
                  />
                </div>

                {/* Kategori Program */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Kategori Program
                  </label>
                  <select
                    value={formData.program}
                    disabled={isSubmitting}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
                  >
                    <option value="Murottal">Murottal</option>
                    <option value="Murojaah">Murojaah</option>
                    <option value="Tafsir">Tafsir</option>
                  </select>
                </div>

                {/* Guru Pengampu (Dropdown dengan Ceklis di dalamnya) */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Guru Pengampu
                    </label>
                    {formData.waliList.length > 0 && (
                      <span className="text-[11px] text-zinc-500">
                        {formData.waliList.length} dipilih
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsGuruDropdownOpen((prev) => !prev)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60 cursor-pointer"
                  >
                    <span
                      className={`truncate ${
                        formData.waliList.length > 0
                          ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-400'
                      }`}
                    >
                      {formData.waliList.length > 0
                        ? formData.waliList.join(', ')
                        : 'Pilih guru pengampu'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                        isGuruDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isGuruDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsGuruDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg divide-y divide-zinc-100 dark:divide-zinc-700/60">
                        {guruOptions.length === 0 ? (
                          <div className="px-3 py-2.5 text-xs text-zinc-400">
                            Belum ada data guru tersedia.
                          </div>
                        ) : (
                          guruOptions.map((guru) => {
                            const isChecked = formData.waliList.includes(guru);
                            return (
                              <label
                                key={guru}
                                className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors select-none ${
                                  isChecked
                                    ? 'bg-zinc-50 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 font-medium'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={isSubmitting}
                                  checked={isChecked}
                                  onChange={() => toggleGuruSelection(guru)}
                                  className="w-3.5 h-3.5 rounded text-[#086288] border-zinc-300 dark:border-zinc-600 focus:ring-0 cursor-pointer accent-[#086288] shrink-0"
                                />
                                <span className="truncate">{guru}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Submit & Batal Button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.nama.trim()}
                    className="flex-1 py-2 px-4 bg-[#086288] hover:bg-[#064e6d] text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelClassInfoEdit}
                    className="py-2 px-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              /* MODE LIHAT INFORMASI KELAS (READ-ONLY & INFORMATIF) */
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">Nama Kelas</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {editingKelas.nama}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">Kategori Program</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {getKategori(editingKelas)}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="text-zinc-500 dark:text-zinc-400">Status Kelas</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {editingKelas.status || 'Aktif'}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Guru Pengampu</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {currentEditingWaliList.length} guru
                    </span>
                  </div>
                  {currentEditingWaliList.length > 0 ? (
                    <div className="space-y-1.5 pt-0.5">
                      {currentEditingWaliList.map((guru, index) => (
                        <div
                          key={guru}
                          className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                        >
                          <span className="text-zinc-400 tabular-nums shrink-0">{index + 1}.</span>
                          <span className="leading-snug">{guru}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 italic">Belum ada guru pengampu ditentukan.</p>
                  )}
                </div>

                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Jumlah Santri</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {santriInClass.length} santri
                    </span>
                  </div>
                  {jenjangDistribution.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {jenjangDistribution.map((item) => (
                        <span
                          key={item.jenjang}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]"
                        >
                          <span className="font-medium">{item.jenjang}:</span>
                          <span>{item.count}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400">Belum ada santri terdaftar di kelas ini.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Panel Kanan: Tabel Santri dalam Kelas Ini */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {isAddingSantriMode ? 'Pilih Santri' : 'Daftar Santri'}
                </h3>
                <span className="text-xs text-zinc-500">
                  ({santriInClass.length} santri)
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                {/* Pencarian Santri */}
                <div className="relative w-full sm:w-48">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={santriSearchQuery}
                    onChange={(e) => setSantriSearchQuery(e.target.value)}
                    placeholder="Cari nama santri..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] transition-all"
                  />
                </div>

                {/* Tombol Kontrol Header */}
                {isAddingSantriMode ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingSantriMode(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#086288] hover:bg-[#064e6d] text-white transition-all shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                ) : isSantriEditMode ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const match = editingKelas.nama.match(/([1-6])/);
                        const targetJenjang = match ? `Kelas ${match[1]}` : 'Kelas 1';
                        setSelectedAddingJenjang(targetJenjang);
                        setIsAddingSantriMode(true);
                        setSantriSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-[#086288] hover:bg-[#064e6d] text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Santri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSantriEditMode(false);
                        setIsAddingSantriMode(false);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Selesai</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSantriEditMode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sub-bar Tab Jenjang Kelas (Model Tab Per Kelas) */}
            {isAddingSantriMode && (
              <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-xs font-medium">
                  {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Semua'].map((jenjang) => {
                    const isActive = selectedAddingJenjang === jenjang;
                    return (
                      <button
                        type="button"
                        key={jenjang}
                        onClick={() => setSelectedAddingJenjang(jenjang)}
                        className={`px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-zinc-900 text-[#086288] dark:text-[#FFEFC4] font-semibold shadow-2xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        {jenjang}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Area Tabel */}
            <div className="overflow-x-auto">
              {isAddingSantriMode ? (
                /* ================= TABEL PILIHAN SANTRI (MODE CENTANG) ================= */
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-medium">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">Pilih</th>
                      <th className="px-4 py-2.5">Nama Santri</th>
                      <th className="px-4 py-2.5 w-28">Jenjang</th>
                      <th className="px-4 py-2.5 w-32 text-right">Kelas Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {availableSantriList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-zinc-400">
                          {isSearchingAddingSantri
                            ? `Tidak ada nama santri yang cocok dengan "${santriSearchQuery}".`
                            : `Tidak ada data santri pada ${selectedAddingJenjang}.`}
                        </td>
                      </tr>
                    ) : (
                      availableSantriList.map((santri) => {
                        const inThisClass = santriInClass.some((sc) => sc.id === santri.id);
                        const hasAnotherClass = santri.kelas && santri.kelas !== '-' && !inThisClass;

                        return (
                          <tr
                            key={santri.id}
                            onClick={() => handleToggleSantriInClass(santri)}
                            className={`transition-colors cursor-pointer select-none ${
                              inThisClass
                                ? 'bg-zinc-50 dark:bg-zinc-800/60'
                                : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                            }`}
                          >
                            <td className="px-4 py-2.5 text-center w-12" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={inThisClass}
                                onChange={() => handleToggleSantriInClass(santri)}
                                className="w-3.5 h-3.5 rounded text-[#086288] border-zinc-300 dark:border-zinc-600 focus:ring-0 cursor-pointer accent-[#086288]"
                              />
                            </td>
                            <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                              {santri.nama}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-500">
                              {santri.jenjang || 'Kelas 1'}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {inThisClass ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                  {editingKelas.nama}
                                </span>
                              ) : hasAnotherClass ? (
                                <span className="text-zinc-600 dark:text-zinc-400">
                                  {santri.kelas}
                                </span>
                              ) : (
                                <span className="text-zinc-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                /* ================= TABEL SANTRI TERDAFTAR BIASA ================= */
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-medium">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">No</th>
                      <th className="px-4 py-2.5">Nama Santri</th>
                      <th className="px-4 py-2.5 w-28">Jenjang</th>
                      {isSantriEditMode && (
                        <th className="px-4 py-2.5 w-16 text-right">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {santriInClass.length === 0 ? (
                      <tr>
                        <td colSpan={isSantriEditMode ? 4 : 3} className="px-4 py-10 text-center text-zinc-400">
                          Belum ada santri terdaftar di kelas ini.
                        </td>
                      </tr>
                    ) : filteredSantriInClass.length === 0 ? (
                      <tr>
                        <td colSpan={isSantriEditMode ? 4 : 3} className="px-4 py-8 text-center text-zinc-400">
                          Santri tidak ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredSantriInClass.map((santri, idx) => (
                        <tr key={santri.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-2.5 text-center text-zinc-400 tabular-nums w-12">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                            {santri.nama}
                          </td>
                          <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                            {santri.jenjang || 'Kelas 1'}
                          </td>
                          {isSantriEditMode && (
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSantri(santri)}
                                className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                                title={`Keluarkan ${santri.nama}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAMPILAN DEFAULT: SPLIT GRID DAFTAR KELAS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================= PANEL KIRI: FORM TAMBAH KELAS ================= */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tambah Kelas
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {/* Nama Kelas */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: 1-A"
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
                />
              </div>

              {/* Kategori Program */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Kategori Program
                </label>
                <select
                  value={formData.program}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60"
                >
                  <option value="Murottal">Murottal</option>
                  <option value="Murojaah">Murojaah</option>
                  <option value="Tafsir">Tafsir</option>
                </select>
              </div>

              {/* Guru Pengampu (Dropdown dengan Ceklis di dalamnya) */}
              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Guru Pengampu
                  </label>
                  {formData.waliList.length > 0 && (
                    <span className="text-[11px] text-zinc-500">
                      {formData.waliList.length} dipilih
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsGuruDropdownOpen((prev) => !prev)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#086288] disabled:opacity-60 cursor-pointer"
                >
                  <span
                    className={`truncate ${
                      formData.waliList.length > 0
                        ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-400'
                    }`}
                  >
                    {formData.waliList.length > 0
                      ? formData.waliList.join(', ')
                      : 'Pilih guru pengampu'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                      isGuruDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isGuruDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsGuruDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg divide-y divide-zinc-100 dark:divide-zinc-700/60">
                      {guruOptions.length === 0 ? (
                        <div className="px-3 py-2.5 text-xs text-zinc-400">
                          Belum ada data guru tersedia.
                        </div>
                      ) : (
                        guruOptions.map((guru) => {
                          const isChecked = formData.waliList.includes(guru);
                          return (
                            <label
                              key={guru}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors select-none ${
                                isChecked
                                  ? 'bg-zinc-50 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 font-medium'
                                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={isChecked}
                                onChange={() => toggleGuruSelection(guru)}
                                className="w-3.5 h-3.5 rounded text-[#086288] border-zinc-300 dark:border-zinc-600 focus:ring-0 cursor-pointer accent-[#086288] shrink-0"
                              />
                              <span className="truncate">{guru}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.nama.trim()}
                  className="w-full py-2 px-4 bg-[#086288] hover:bg-[#064e6d] text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kelas</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ================= PANEL KANAN: TABEL KELAS ================= */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* Top Filter Bar */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kelas atau guru..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Murottal">Murottal</option>
                  <option value="Murojaah">Murojaah</option>
                  <option value="Tafsir">Tafsir</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-medium">
                  <tr>
                    <th className="px-4 py-2.5 w-12 text-center">No</th>
                    <th className="px-4 py-2.5">Kelas</th>
                    <th className="px-4 py-2.5 w-28">Kategori</th>
                    <th className="px-4 py-2.5">Guru Pengampu</th>
                    <th className="px-4 py-2.5 w-24 text-center">Santri</th>
                    <th className="px-4 py-2.5 w-20 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {showSkeleton ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 py-3 text-center">
                          <div className="h-4 w-5 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredKelas.length > 0 ? (
                    filteredKelas.map((kelas, idx) => {
                      const kategori = getKategori(kelas);
                      const waliNames = parseWaliList(kelas);
                      const jumlahSantri = getSantriInClass(kelas).length;
                      return (
                        <tr
                          key={kelas.id}
                          onClick={() => handleStartEdit(kelas)}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                        >
                          {/* 1. NO */}
                          <td className="px-4 py-3 text-center text-zinc-400 tabular-nums">
                            {idx + 1}
                          </td>

                          {/* 2. KELAS */}
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {kelas.nama}
                          </td>

                          {/* 3. KATEGORI */}
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                            {kategori}
                          </td>

                          {/* 4. GURU */}
                          <td className="px-4 py-3">
                            {waliNames.length > 0 ? (
                              <div className="space-y-0.5">
                                {waliNames.map((guruName) => (
                                  <div
                                    key={guruName}
                                    className="text-zinc-800 dark:text-zinc-200 leading-snug"
                                  >
                                    {guruName}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </td>

                          {/* 5. SANTRI */}
                          <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-300 tabular-nums">
                            {jumlahSantri} santri
                          </td>

                          {/* 6. AKSI */}
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(kelas)}
                                className="p-1.5 rounded transition-colors cursor-pointer text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                title="Detail Kelas"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(kelas)}
                                className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Hapus Kelas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : !isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                        Tidak ada data kelas.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
