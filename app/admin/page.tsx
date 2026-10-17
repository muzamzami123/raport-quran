"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  Download,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

interface ExamRecord {
  id: string;
  tanggal: string;
  nama: string;
  nis: string;
  kelas: string;
  program: 'Murottal' | 'Murojaah' | 'Tafsir';
  penguji: string;
  nilai: number;
  predikat: string;
  statusCetak: 'Sudah Dicetak' | 'Siap Cetak';
}

const mockExams: ExamRecord[] = [
  { id: '1', tanggal: '17 Okt 2026', nama: 'Ahmad Zaki Al-Faruq', nis: '202601001', kelas: 'Kelas 1A', program: 'Murottal', penguji: 'Ust. Ahmad, S.Pd.I', nilai: 94, predikat: 'Mumtaz (Istimewa)', statusCetak: 'Sudah Dicetak' },
  { id: '2', tanggal: '17 Okt 2026', nama: 'Fatimah Az-Zahra', nis: '202601002', kelas: 'Kelas 1A', program: 'Murottal', penguji: 'Ust. Ahmad, S.Pd.I', nilai: 96, predikat: 'Mumtaz (Istimewa)', statusCetak: 'Siap Cetak' },
  { id: '3', tanggal: '16 Okt 2026', nama: 'Muhammad Umar Said', nis: '202602005', kelas: 'Kelas 2A', program: 'Murojaah', penguji: 'Ust. Umar', nilai: 88, predikat: 'Jayyid Jiddan', statusCetak: 'Sudah Dicetak' },
  { id: '4', tanggal: '16 Okt 2026', nama: 'Aisyah Putri Nabila', nis: '202603008', kelas: 'Kelas 3A', program: 'Murojaah', penguji: 'Usth. Maryam, M.Ag', nilai: 91, predikat: 'Mumtaz (Istimewa)', statusCetak: 'Siap Cetak' },
  { id: '5', tanggal: '15 Okt 2026', nama: 'Abdullah bin Mas\'ud', nis: '202605014', kelas: 'Kelas 5A', program: 'Murottal', penguji: 'Ust. Zulkifli, S.Th.I', nilai: 85, predikat: 'Jayyid Jiddan', statusCetak: 'Sudah Dicetak' },
  { id: '6', tanggal: '15 Okt 2026', nama: 'Maryam Khadijah', nis: '202606017', kelas: 'Kelas 6A', program: 'Tafsir', penguji: 'Ust. Hasan Basri', nilai: 95, predikat: 'Mumtaz (Istimewa)', statusCetak: 'Siap Cetak' },
  { id: '7', tanggal: '14 Okt 2026', nama: 'Ibrahim Ali Basayev', nis: '202604011', kelas: 'Kelas 4A', program: 'Murottal', penguji: 'Ust. Umar', nilai: 79, predikat: 'Jayyid (Baik)', statusCetak: 'Sudah Dicetak' },
];

export default function AdminDashboard() {
  const [selectedProgram, setSelectedProgram] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewStudent, setPreviewStudent] = useState<ExamRecord | null>(null);

  const filteredExams = mockExams.filter(exam => {
    const matchProgram = selectedProgram === 'Semua' || exam.program === selectedProgram;
    const matchSearch = exam.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        exam.nis.includes(searchQuery) ||
                        exam.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProgram && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Dashboard Eksekutif Akademik
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Ringkasan data santri, evaluasi halaqah, dan rekapitulasi ujian semester.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-md transition-colors shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Ekspor Rekapitulasi</span>
          </button>
          <Link
            href="/admin/santri"
            className="px-3.5 py-2 bg-[#086288] hover:bg-[#064e6d] text-[#FFEFC4] text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFEFC4]" />
            <span>Daftarkan Santri</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip (4 institutional cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Santri Aktif</span>
            <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Users className="w-4 h-4 text-[#086288] dark:text-[#97D7FF]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">1,248</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              12 Rombel aktif • 6 jenjang halaqah
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dewan Asatidz</span>
            <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <UserCheck className="w-4 h-4 text-[#086288] dark:text-[#97D7FF]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">45 Pengajar</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              42 aktif membina semester ini
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Progres Ujian Semester</span>
            <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-[#086288] dark:text-[#97D7FF]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">82.4%</span>
              <span className="text-xs text-zinc-500 font-mono">984 / 1,248</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-[#086288] dark:bg-[#4D8DBA] rounded-full" style={{ width: '82.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-Rata Nilai</span>
            <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Award className="w-4 h-4 text-[#086288] dark:text-[#97D7FF]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">88.5 <span className="text-sm font-normal text-zinc-500">/ 100</span></div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Predikat Jayyid Jiddan (Sangat Baik)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Table (8 cols) + Side Monitoring (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: TABEL REKAPITULASI UJIAN ================= */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
          {/* Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Rekapitulasi Ujian & Setoran Terkini
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Daftar nilai santri yang telah dievaluasi oleh asatidz pembina
                </p>
              </div>

              {/* Program Filter Pills */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md text-xs font-medium">
                {['Semua', 'Murottal', 'Murojaah', 'Tafsir'].map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setSelectedProgram(prog)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedProgram === prog
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari santri, NIS, atau kelas..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">No</th>
                  <th className="px-4 py-3">Nama Santri & NIS</th>
                  <th className="px-4 py-3">Kelas / Program</th>
                  <th className="px-4 py-3">Asatidz Penguji</th>
                  <th className="px-4 py-3 text-center">Nilai</th>
                  <th className="px-4 py-3">Predikat</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                      Tidak ada data ujian yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, index) => (
                    <tr key={exam.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 text-center text-zinc-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{exam.nama}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">NIS: {exam.nis}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-200">{exam.kelas}</div>
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-semibold uppercase ${
                          exam.program === 'Murottal' 
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                            : exam.program === 'Murojaah'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {exam.program}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {exam.penguji}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                          {exam.nilai}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          exam.nilai >= 90
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                            : exam.nilai >= 80
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}>
                          {exam.predikat}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setPreviewStudent(exam)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Cetak Raport"
                        >
                          <Printer className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Raport</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Menampilkan {filteredExams.length} santri terbaru</span>
            <Link
              href="/admin/santri"
              className="font-semibold text-[#086288] dark:text-[#97D7FF] hover:underline flex items-center gap-1"
            >
              Lihat Seluruh Data Santri
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MONITORING & AKTIVITAS ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Capaian Ujian per Jenjang */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Monitoring Capaian per Jenjang
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Persentase santri yang telah selesai diuji
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {[
                { kelas: 'Kelas 1 (Ula)', selesai: 24, total: 25, pct: 96 },
                { kelas: 'Kelas 2 (Tsanawiyah)', selesai: 22, total: 25, pct: 88 },
                { kelas: 'Kelas 3', selesai: 21, total: 25, pct: 84 },
                { kelas: 'Kelas 4', selesai: 20, total: 25, pct: 80 },
                { kelas: 'Kelas 5', selesai: 19, total: 25, pct: 76 },
                { kelas: 'Kelas 6 (Aliyah)', selesai: 18, total: 20, pct: 90 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold">{item.kelas}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      {item.selesai}/{item.total} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.pct >= 90 ? 'bg-emerald-600' : item.pct >= 80 ? 'bg-[#086288]' : 'bg-amber-600'
                      }`} 
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Aktivitas Terkini */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Log Aktivitas Akademik
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Riwayat input nilai dan pencatatan raport
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                { time: '10:45 WIB', user: 'Ust. Ahmad', action: 'Menginput nilai ujian', santri: 'Ahmad Zaki', grade: '94 (Mumtaz)' },
                { time: '09:30 WIB', user: 'Usth. Maryam', action: 'Mencetak raport halaqah', santri: 'Kelas 3A', grade: '12 Berkas' },
                { time: '08:15 WIB', user: 'Ust. Umar', action: 'Menyelesaikan penilaian', santri: 'Muhammad Umar', grade: '88 (Jayyid)' },
                { time: 'Kemarin', user: 'Admin Akademik', action: 'Sinkronisasi data santri', santri: 'Tahun Ajaran 26/27', grade: 'Selesai' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#086288] mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-800 dark:text-zinc-200">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{log.user}</span>{' '}
                      {log.action} <span className="font-medium text-[#086288] dark:text-[#97D7FF]">{log.santri}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{log.time}</span>
                      <span>•</span>
                      <span className="font-mono text-zinc-500">{log.grade}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Raport Preview Modal */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Pratinjau Lembar Raport Qur&apos;an
                </h3>
                <p className="text-xs text-zinc-500">Arsip Nilai Resmi Pesantren Ilmu Al-Qur&apos;an</p>
              </div>
              <button 
                onClick={() => setPreviewStudent(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nama Santri:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{previewStudent.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">NIS:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{previewStudent.nis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Kelas / Program:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{previewStudent.kelas} ({previewStudent.program})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Asatidz Penguji:</span>
                <span className="text-zinc-900 dark:text-zinc-100">{previewStudent.penguji}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 font-bold">
                <span className="text-zinc-700 dark:text-zinc-300">Nilai Akhir:</span>
                <span className="text-sm text-[#086288] dark:text-[#97D7FF] font-mono">{previewStudent.nilai} / 100 ({previewStudent.predikat})</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewStudent(null)}
                className="px-3.5 py-1.5 rounded text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-[#086288] text-[#FFEFC4] hover:bg-[#064e6d] transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
