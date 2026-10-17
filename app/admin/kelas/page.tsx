"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  FileDown, 
  CheckCircle2, 
  X,
  Layers,
  DoorOpen
} from 'lucide-react';

interface KelasItem {
  id: string;
  kode: string;
  nama: string;
  program: 'Murottal' | 'Murojaah' | 'Tafsir';
  wali: string;
  jumlah: number;
  kapasitas: number;
  ruangan: string;
  status: 'Aktif' | 'Nonaktif';
}

const initialDataKelas: KelasItem[] = [
  { id: '1', kode: 'HAL-01A', nama: "Kelas 1A", program: "Murottal", wali: "Ustadz Ahmad, S.Pd.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ula 101", status: "Aktif" },
  { id: '2', kode: 'HAL-01B', nama: "Kelas 1B", program: "Murojaah", wali: "Ustadzah Fatimah, Lc", jumlah: 24, kapasitas: 25, ruangan: "Gedung Ula 102", status: "Aktif" },
  { id: '3', kode: 'HAL-02A', nama: "Kelas 2A", program: "Murottal", wali: "Ustadz Umar", jumlah: 22, kapasitas: 25, ruangan: "Gedung Wustha 201", status: "Aktif" },
  { id: '4', kode: 'HAL-03A', nama: "Kelas 3A", program: "Murojaah", wali: "Ustadzah Maryam, M.Ag", jumlah: 25, kapasitas: 25, ruangan: "Gedung Wustha 202", status: "Aktif" },
  { id: '5', kode: 'HAL-05A', nama: "Kelas 5A", program: "Murottal", wali: "Ustadz Zulkifli, S.Th.I", jumlah: 25, kapasitas: 25, ruangan: "Gedung Ulya 301", status: "Aktif" },
  { id: '6', kode: 'HAL-06A', nama: "Kelas 6A", program: "Tafsir", wali: "Ustadz Hasan Basri", jumlah: 20, kapasitas: 20, ruangan: "Gedung Ma'had Utama", status: "Aktif" },
];

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<KelasItem[]>(initialDataKelas);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/kelas')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setKelasList(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    program: 'Murottal' as 'Murottal' | 'Murojaah' | 'Tafsir',
    wali: 'Ustadz Ahmad, S.Pd.I',
    kapasitas: 25,
    ruangan: '',
  });

  const handleOpenModal = () => {
    const autoKode = `HAL-0${kelasList.length + 1}A`;
    setFormData({
      kode: autoKode,
      nama: '',
      program: 'Murottal',
      wali: 'Ustadz Ahmad, S.Pd.I',
      kapasitas: 25,
      ruangan: 'Gedung Halaqah Baru',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newKelas: KelasItem = {
      id: Date.now().toString(),
      kode: formData.kode,
      nama: formData.nama.trim(),
      program: formData.program,
      wali: formData.wali,
      jumlah: 0,
      kapasitas: Number(formData.kapasitas) || 25,
      ruangan: formData.ruangan,
      status: 'Aktif',
    };

    try {
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKelas),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setKelasList([...kelasList, json.data]);
      } else {
        setKelasList([...kelasList, newKelas]);
      }
    } catch {
      setKelasList([...kelasList, newKelas]);
    }

    setIsModalOpen(false);
    setNotification(`Rombel halaqah "${newKelas.nama}" berhasil dibentuk.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus rombel halaqah "${nama}"?`)) {
      try {
        await fetch(`/api/kelas?id=${id}`, { method: 'DELETE' });
      } catch {}
      setKelasList(prev => prev.filter(k => k.id !== id));
      setNotification(`Halaqah "${nama}" telah dihapus.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredKelas = kelasList.filter(k => {
    const matchProgram = selectedProgram === 'Semua' || k.program === selectedProgram;
    const matchSearch = k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        k.wali.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        k.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        k.ruangan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProgram && matchSearch;
  });

  const totalSantriTertampung = kelasList.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Data Halaqah & Rombel Diniyah
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pembagian rombongan belajar, asatidz pengampu, dan kapasitas ruangan halaqah.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-md transition-colors shadow-xs flex items-center gap-2"
          >
            <FileDown className="w-4 h-4 text-zinc-500" />
            <span>Ekspor Rombel</span>
          </button>
          <button 
            onClick={handleOpenModal}
            className="px-3.5 py-2 bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFEFC4]" />
            <span>Buat Halaqah Baru</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Rombel Halaqah</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{kelasList.length} Halaqah</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
            <Layers className="w-4 h-4 text-[#086288]" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Santri Tertampung</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{totalSantriTertampung} Santri</p>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Rata-rata 24/halaqah</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Fasilitas Ruangan</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Semua Digunakan</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
            <DoorOpen className="w-4 h-4 text-[#086288]" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari halaqah, wali, atau ruangan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#086288]"
            >
              <option value="Semua">Semua Program Keilmuan</option>
              <option value="Murottal">Program Murottal</option>
              <option value="Murojaah">Program Murojaah</option>
              <option value="Tafsir">Program Tafsir</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-4 py-3 w-10 text-center">No</th>
                <th className="px-4 py-3">Kode Halaqah</th>
                <th className="px-4 py-3">Nama Rombel</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Asatidz Pengampu</th>
                <th className="px-4 py-3">Ruangan</th>
                <th className="px-4 py-3 text-center">Jumlah Santri</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {filteredKelas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
                    Tidak ditemukan data halaqah yang cocok.
                  </td>
                </tr>
              ) : (
                filteredKelas.map((kelas, idx) => (
                  <tr key={kelas.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-center text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                      {kelas.kode}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {kelas.nama}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-semibold uppercase ${
                        kelas.program === 'Murottal' 
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                          : kelas.program === 'Murojaah'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {kelas.program}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 font-medium">
                      {kelas.wali}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {kelas.ruangan}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {kelas.jumlah} / {kelas.kapasitas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => alert(`Edit rombel halaqah: ${kelas.nama}`)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(kelas.id, kelas.nama)}
                          className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus"
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

        {/* Table Footer */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Menampilkan {filteredKelas.length} dari {kelasList.length} rombel</span>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <span className="px-2.5 py-1 rounded bg-[#086288] text-white font-semibold">1</span>
            <button className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Rombel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Pembentukan Rombel Halaqah Baru
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tentukan kode, nama kelas, program, dan asatidz pengampu
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kode Halaqah
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Nama Rombel
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Kelas 4B"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Program Keilmuan
                  </label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  >
                    <option value="Murottal">Murottal</option>
                    <option value="Murojaah">Murojaah</option>
                    <option value="Tafsir">Tafsir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kapasitas Maksimal
                  </label>
                  <input
                    type="number"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Asatidz Pengampu
                </label>
                <input
                  type="text"
                  required
                  value={formData.wali}
                  onChange={(e) => setFormData({ ...formData, wali: e.target.value })}
                  placeholder="Contoh: Ustadz Ahmad, S.Pd.I"
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ruangan / Lokasi Belajar
                </label>
                <input
                  type="text"
                  required
                  value={formData.ruangan}
                  onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                  placeholder="Contoh: Gedung Wustha 203"
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-md text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-[#086288] text-[#FFEFC4] hover:bg-[#064e6d] transition-colors shadow-xs"
                >
                  Buat Halaqah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
