"use client";

import { useState } from 'react';
import { 
  Save, 
  School, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Printer,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'lembaga' | 'akademik' | 'penilaian'>('lembaga');
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Konfigurasi sistem dan parameter akademik berhasil disimpan.");
    setTimeout(() => setNotification(null), 3500);
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
                  Nama Mudir Ma&apos;had / Pimpinan Pesantren
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Kriteria Penilaian & Rentang Predikat Kelulusan
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Standar baku 6 kriteria tajwid dan pembobotan nilai akhir raport
              </p>
            </div>

            {/* 6 Kriteria Tajwid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                6 Kriteria Baku Tajwid & Fashahah
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: '1', title: 'Makhorijul Huruf', bobot: '20%', desc: 'Ketepatan tempat keluarnya huruf hijaiyah' },
                  { id: '2', title: 'Shifatul Huruf', bobot: '20%', desc: 'Hams, Jahr, Qolqolah, Isti\'la, dll' },
                  { id: '3', title: 'Ahkamul Huruf', bobot: '15%', desc: 'Idzhar, Idgham, Ikhfa, Iqlab' },
                  { id: '4', title: 'Ahkamul Mad wal Qashr', bobot: '15%', desc: 'Kadar panjang mad thobi\'i & mad far\'i' },
                  { id: '5', title: 'Ahkamul Waqf wal Ibtida', bobot: '15%', desc: 'Ketepatan tempat berhenti & memulai bacaan' },
                  { id: '6', title: 'Kelancaran (Fashahah)', bobot: '15%', desc: 'Irama murottal, intonasi, & kelancaran lafadz' },
                ].map((crit) => (
                  <div key={crit.id} className="p-3 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{crit.title}</span>
                      <span className="font-mono font-bold text-[#086288] dark:text-[#97D7FF]">{crit.bobot}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">{crit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rentang Predikat */}
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Konversi Nilai ke Predikat Resmi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 font-semibold text-zinc-600 dark:text-zinc-400">
                    <tr>
                      <th className="p-2.5">Rentang Nilai</th>
                      <th className="p-2.5">Predikat Bahasa Arab</th>
                      <th className="p-2.5">Keterangan Bahasa Indonesia</th>
                      <th className="p-2.5 text-center">Status Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="p-2.5 font-mono font-bold">90.00 – 100.00</td>
                      <td className="p-2.5 font-bold text-[#086288] dark:text-[#97D7FF]">Mumtaz (ممتاز)</td>
                      <td className="p-2.5">Istimewa / Sangat Memuaskan</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Lulus</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">80.00 – 89.99</td>
                      <td className="p-2.5 font-bold">Jayyid Jiddan (جيد جدا)</td>
                      <td className="p-2.5">Baik Sekali</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Lulus</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">70.00 – 79.99</td>
                      <td className="p-2.5 font-bold">Jayyid (جيد)</td>
                      <td className="p-2.5">Baik / Memenuhi Standar</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Lulus</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">60.00 – 69.99</td>
                      <td className="p-2.5 font-bold text-amber-600">Maqbul (مقبول)</td>
                      <td className="p-2.5">Cukup (Perlu bimbingan khusus)</td>
                      <td className="p-2.5 text-center text-amber-600 font-bold">Remedial</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">&lt; 60.00</td>
                      <td className="p-2.5 font-bold text-red-600">Dho&apos;if (ضعيف)</td>
                      <td className="p-2.5">Kurang (Wajib mengulang halaqah)</td>
                      <td className="p-2.5 text-center text-red-600 font-bold">Tidak Lulus</td>
                    </tr>
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
