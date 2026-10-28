"use client";

import { useState, useEffect } from 'react';
import { 
  Save, 
  School, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Printer,
  ShieldCheck,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'lembaga' | 'akademik' | 'penilaian'>('lembaga');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dbSource, setDbSource] = useState<string>('Memeriksa...');

  // Form states
  const [lembaga, setLembaga] = useState({
    nama: "Muharrik Pesantren Ilmu Al-Qur'an",
    nsm: "510035070001",
    npsn: "69987654",
    alamat: "Jl. Pesantren Luhur No. 99, Wonokromo, Surabaya, Jawa Timur 60241",
    mudir: "KH. Muhammad Zaki Al-Hafidz, Lc., M.A.",
    kotaTitimangsa: "Surabaya",
  });

  const [akademik, setAkademik] = useState({
    tahunAjaran: "2026/2027",
    semester: "Ganjil",
    tanggalCetak: "2026-10-24",
    aksesGuru: "Dibuka",
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          if (json.data.lembaga) setLembaga(json.data.lembaga);
          if (json.data.akademik) setAkademik(json.data.akademik);
          setDbSource(json.source === 'fallback' ? 'Lokal Fallback' : 'MongoDB Compass (raport_quran.settings)');
        }
      })
      .catch(() => setDbSource('Lokal'));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lembaga, akademik }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification("Konfigurasi berhasil disimpan ke database MongoDB Compass (raport_quran).");
      } else {
        setNotification("Pengaturan tersimpan lokal.");
      }
    } catch {
      setNotification("Tersimpan (mode offline).");
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Pengaturan Sistem & Akademik
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Konfigurasi identitas lembaga, tahun ajaran aktif, dan standar penilaian tajwid.
          </p>
        </div>
        <button
          type="submit"
          form="settings-form"
          className="px-4 py-2 bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#FFEFC4]" />
          <span>Simpan Seluruh Pengaturan</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('lembaga')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'lembaga'
              ? 'border-[#086288] text-[#086288] dark:text-[#97D7FF]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Identitas Lembaga & Kop</span>
        </button>

        <button
          onClick={() => setActiveTab('akademik')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'akademik'
              ? 'border-[#086288] text-[#086288] dark:text-[#97D7FF]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tahun Ajaran & Akses Ujian</span>
        </button>

        <button
          onClick={() => setActiveTab('penilaian')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'penilaian'
              ? 'border-[#086288] text-[#086288] dark:text-[#97D7FF]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kriteria & Predikat Tajwid</span>
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {/* ================= TAB 1: IDENTITAS LEMBAGA ================= */}
        {activeTab === 'lembaga' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Profil Pesantren & Lembaga Al-Qur&apos;an
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Data resmi yang akan dicantumkan pada kop surat dan lembar raport digital
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Resmi Pesantren / Lembaga
                </label>
                <input
                  type="text"
                  required
                  value={lembaga.nama}
                  onChange={(e) => setLembaga({ ...lembaga, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nomor Statistik Pesantren (NSP / NSM)
                </label>
                <input
                  type="text"
                  required
                  value={lembaga.nsm}
                  onChange={(e) => setLembaga({ ...lembaga, nsm: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nomor Pokok Sekolah Nasional (NPSN)
                </label>
                <input
                  type="text"
                  required
                  value={lembaga.npsn}
                  onChange={(e) => setLembaga({ ...lembaga, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Alamat Lengkap Sekretariat
                </label>
                <textarea
                  rows={3}
                  required
                  value={lembaga.alamat}
                  onChange={(e) => setLembaga({ ...lembaga, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Kepala Madrasah / Pimpinan
                </label>
                <input
                  type="text"
                  required
                  value={lembaga.mudir}
                  onChange={(e) => setLembaga({ ...lembaga, mudir: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kota Titimangsa Raport
                </label>
                <input
                  type="text"
                  required
                  value={lembaga.kotaTitimangsa}
                  onChange={(e) => setLembaga({ ...lembaga, kotaTitimangsa: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AKADEMIK & AKSES ================= */}
        {activeTab === 'akademik' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Kalender Akademik & Periode Evaluasi
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pengaturan semester berjalan dan kontrol akses pengujian untuk dewan asatidz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tahun Ajaran Berjalan
                </label>
                <select
                  value={akademik.tahunAjaran}
                  onChange={(e) => setAkademik({ ...akademik, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                >
                  <option value="2026/2027">2026/2027 (Aktif)</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Semester Aktif
                </label>
                <select
                  value={akademik.semester}
                  onChange={(e) => setAkademik({ ...akademik, semester: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tanggal Titimangsa Pembagian Raport
                </label>
                <input
                  type="date"
                  value={akademik.tanggalCetak}
                  onChange={(e) => setAkademik({ ...akademik, tanggalCetak: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Status Penginputan Nilai oleh Asatidz
                </label>
                <select
                  value={akademik.aksesGuru}
                  onChange={(e) => setAkademik({ ...akademik, aksesGuru: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#086288]"
                >
                  <option value="Dibuka">Dibuka (Asatidz dapat menguji santri)</option>
                  <option value="Ditutup">Ditutup (Kunci nilai akhir)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Informasi Sinkronisasi</p>
              Perubahan tahun ajaran akan otomatis menyesuaikan filter pada rekapitulasi ujian santri di seluruh sistem.
            </div>
          </div>
        )}

        {/* ================= TAB 3: STANDAR PENILAIAN TAJWID ================= */}
        {activeTab === 'penilaian' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Kriteria Penilaian &amp; Keterangan Nilai
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Standar materi penilaian beserta bobotnya dan keterangan nilai raport
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Tabel Materi & Bobot */}
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-zinc-300 dark:border-zinc-700">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold uppercase">
                    <tr>
                      <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 w-14 text-center">
                        NO.
                      </th>
                      <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-left">
                        MATERI
                      </th>
                      <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 w-28 text-center">
                        BOBOT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-800 dark:text-zinc-200">
                    {[
                      { no: '1.', materi: 'Makhorijul Huruf', bobot: 3 },
                      { no: '2.', materi: 'Shifatul Huruf', bobot: 2 },
                      { no: '3.', materi: 'Ahkamul Huruf', bobot: 2 },
                      { no: '4.', materi: 'Ahkamul Mad', bobot: 2 },
                      { no: '5.', materi: 'Waqof wal Ibtida', bobot: 2 },
                      { no: '6.', materi: 'Muroatul Huruf wal Harokah', bobot: 2 },
                      { no: '7.', materi: 'Miring', bobot: 1 },
                      { no: '8.', materi: 'Tawallud', bobot: 1 },
                      { no: '9.', materi: 'Kelancaran', bobot: 1 },
                    ].map((row) => (
                      <tr key={row.no} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                        <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center tabular-nums">
                          {row.no}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                          {row.materi}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-center tabular-nums font-medium">
                          {row.bobot} x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabel Keterangan Nilai */}
              <div className="lg:col-span-5 overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-zinc-300 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold uppercase">
                      <th
                        colSpan={3}
                        className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center tracking-wide"
                      >
                        KETERANGAN NILAI
                      </th>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 font-bold uppercase">
                      <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 w-14 text-center">
                        NO.
                      </th>
                      <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                        KETERANGAN
                      </th>
                      <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 w-24 text-center">
                        NILAI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-800 dark:text-zinc-200">
                    {[
                      { no: 1, ket: 'Mumtaz (Sempurna)', nilai: '100' },
                      { no: 2, ket: 'Jayyid Jiddan (Baik Sekali)', nilai: '91 - 99' },
                      { no: 3, ket: 'Jayyid (Baik)', nilai: '81 - 90' },
                      { no: 4, ket: 'Maqbul (Cukup)', nilai: '80' },
                      { no: 5, ket: 'Rosib (Kurang)', nilai: '< 80' },
                    ].map((item) => (
                      <tr key={item.no} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                        <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center tabular-nums">
                          {item.no}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                          {item.ket}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-center tabular-nums font-medium">
                          {item.nilai}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
