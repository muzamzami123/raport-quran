"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  X,
  UserCheck
} from 'lucide-react';

interface Guru {
  id: string;
  nip: string;
  name: string;
  bidang: string;
  wali: string;
  kontak: string;
  status: 'Aktif' | 'Cuti';
}

const initialDataGuru: Guru[] = [
  { id: '1', nip: "G-001", name: "Ustadz Ahmad, S.Pd.I", bidang: "Tahfidz & Murojaah", wali: "Kelas 1A & 5A", kontak: "+62 812-3456-7890", status: "Aktif" },
  { id: '2', nip: "G-002", name: "Ustadzah Fatimah, Lc", bidang: "Tafsir & Hadits", wali: "Kelas 1B & 6B", kontak: "+62 813-4567-8901", status: "Aktif" },
  { id: '3', nip: "G-003", name: "Ustadz Umar", bidang: "Tajwid & Makhorijul Huruf", wali: "Kelas 2A & 4A", kontak: "+62 814-5678-9012", status: "Aktif" },
  { id: '4', nip: "G-004", name: "Ustadzah Maryam, M.Ag", bidang: "Murojaah & Fiqih Ibadah", wali: "Kelas 3A", kontak: "+62 815-6789-0123", status: "Aktif" },
  { id: '5', nip: "G-005", name: "Ustadz Zulkifli, S.Th.I", bidang: "Tahfidz & Aqidah Akhlak", wali: "Kelas 5B", kontak: "+62 816-7890-1234", status: "Aktif" },
  { id: '6', nip: "G-006", name: "Ustadz Hasan Basri", bidang: "Tafsir Al-Qur'an & Tahsin", wali: "Kelas 6A", kontak: "+62 817-8901-2345", status: "Aktif" },
];

export default function DataGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>(initialDataGuru);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    bidang: 'Tahfidz & Murojaah',
    wali: 'Kelas 1A',
    kontak: '',
    status: 'Aktif' as 'Aktif' | 'Cuti',
  });

  useEffect(() => {
    fetch('/api/guru')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setGuruList(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenModal = () => {
    const autoNIP = `G-00${guruList.length + 1}`;
    setFormData({
      nip: autoNIP,
      name: '',
      bidang: 'Tahfidz & Murojaah',
      wali: 'Kelas 1A',
      kontak: '+62 8',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newGuru: Guru = {
      id: Date.now().toString(),
      nip: formData.nip,
      name: formData.name.trim(),
      bidang: formData.bidang,
      wali: formData.wali,
      kontak: formData.kontak,
      status: formData.status,
    };

    try {
      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuru),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGuruList([...guruList, json.data]);
      } else {
        setGuruList([...guruList, newGuru]);
      }
    } catch {
      setGuruList([...guruList, newGuru]);
    }

    setIsModalOpen(false);
    setNotification(`Data asatidz "${newGuru.name}" berhasil ditambahkan.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data asatidz "${name}"?`)) {
      try {
        await fetch(`/api/guru?id=${id}`, { method: 'DELETE' });
      } catch {}
      setGuruList(prev => prev.filter(g => g.id !== id));
      setNotification(`Data "${name}" telah dihapus.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredGuru = guruList.filter(g => {
    const matchBidang = selectedBidang === 'Semua' || g.bidang.toLowerCase().includes(selectedBidang.toLowerCase());
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.wali.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBidang && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Direktori Dewan Asatidz & Penguji
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manajemen data asatidz, pembina halaqah, dan dewan penguji raport Qur&apos;an.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-md transition-colors shadow-xs flex items-center gap-2"
          >
            <FileDown className="w-4 h-4 text-zinc-500" />
            <span>Ekspor Data</span>
          </button>
          <button 
            onClick={handleOpenModal}
            className="px-3.5 py-2 bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFEFC4]" />
            <span>Tambah Asatidz Baru</span>
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

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Dewan Asatidz</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{guruList.length} Pengajar</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
            <UserCheck className="w-4 h-4 text-[#086288]" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pembina Halaqah Aktif</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {guruList.filter(g => g.status === 'Aktif').length} Ustadz/Ustadzah
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            100% Aktif
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Bidang Keilmuan</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">3 Cabang Utama</p>
          </div>
          <p className="text-xs text-zinc-500">Tahfidz • Tafsir • Tajwid</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari asatidz, NIP, atau binaan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#086288]"
            >
              <option value="Semua">Semua Bidang Keilmuan</option>
              <option value="Tahfidz">Tahfidz & Murojaah</option>
              <option value="Tafsir">Tafsir & Hadits</option>
              <option value="Tajwid">Tajwid & Tahsin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-4 py-3 w-10 text-center">No</th>
                <th className="px-4 py-3">NIP / ID</th>
                <th className="px-4 py-3">Nama Asatidz & Gelar</th>
                <th className="px-4 py-3">Bidang Keilmuan</th>
                <th className="px-4 py-3">Halaqah Binaan</th>
                <th className="px-4 py-3">Kontak Resmi</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
                    Tidak ditemukan data asatidz yang cocok.
                  </td>
                </tr>
              ) : (
                filteredGuru.map((guru, idx) => (
                  <tr key={guru.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-center text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                      {guru.nip}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {guru.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {guru.bidang}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {guru.wali}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {guru.kontak}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {guru.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => alert(`Edit data pengajar: ${guru.name}`)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit Data"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guru.id, guru.name)}
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
          <span>Menampilkan {filteredGuru.length} dari {guruList.length} asatidz</span>
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

      {/* Modal Tambah Asatidz */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Tambah Data Dewan Asatidz
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Input data identitas asatidz pembina halaqah baru
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
                    Nomor Induk Pengajar (NIP)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  >
                    <option value="Aktif">Aktif Mengajar</option>
                    <option value="Cuti">Cuti Akademik</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap & Gelar Akademik
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ustadz H. Abdullah Said, Lc., M.A."
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Bidang Keilmuan Utama
                  </label>
                  <select
                    value={formData.bidang}
                    onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  >
                    <option value="Tahfidz & Murojaah">Tahfidz & Murojaah</option>
                    <option value="Tafsir & Hadits">Tafsir & Hadits</option>
                    <option value="Tajwid & Tahsin">Tajwid & Tahsin</option>
                    <option value="Fiqih Ibadah">Fiqih Ibadah</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Halaqah Binaan
                  </label>
                  <input
                    type="text"
                    value={formData.wali}
                    onChange={(e) => setFormData({ ...formData, wali: e.target.value })}
                    placeholder="Contoh: Kelas 2A & 5B"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nomor Kontak WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  placeholder="+62 8..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
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
                  Simpan Data Asatidz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
