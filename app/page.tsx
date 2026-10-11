"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Trash2, 
  Eye, 
  User, 
  GraduationCap, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  Filter,
  X,
  Sparkles,
  BookMarked,
  Check,
  RefreshCw,
  Home,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

// 9 Kriteria Kesalahan Baca Santri sesuai instruksi & gambar
export interface KriteriaKesalahan {
  key: string;
  nama: string;
  max: number;
  keterangan: string;
}

export const KRITERIA_LIST: KriteriaKesalahan[] = [
  { key: 'makhorijulHuruf', nama: 'Makhorijul Huruf', max: 5, keterangan: 'Ketepatan tempat keluarnya huruf hijaiyah' },
  { key: 'shifatulHuruf', nama: 'Shifatul Huruf', max: 5, keterangan: 'Ketepatan sifat-sifat huruf (hams, qalqalah, dll)' },
  { key: 'ahkamulHuruf', nama: 'Ahkamul Huruf', max: 5, keterangan: 'Hukum nun sukun/tanwin, mim sukun, idgham, dll' },
  { key: 'ahkamulMad', nama: 'Ahkamul Mad', max: 5, keterangan: 'Ketepatan panjang mad thobi\'i & mad far\'i' },
  { key: 'waqofWalIbtida', nama: 'Waqof wal Ibtida', max: 5, keterangan: 'Ketepatan tempat berhenti dan memulai bacaan' },
  { key: 'muroatulHuruf', nama: 'Muroatul Huruf wal Harokah', max: 5, keterangan: 'Ketelitian harakat (fathah, kasrah, dhammah, sukun)' },
  { key: 'miring', nama: 'Miring', max: 9, keterangan: 'Vokal miring/imalah tidak pada tempatnya (seperti O atau E)' },
  { key: 'tawallud', nama: 'Tawallud', max: 9, keterangan: 'Memantulkan huruf yang bukan qalqalah / mengayun huruf sukun' },
  { key: 'kelancaran', nama: 'Kelancaran', max: 9, keterangan: 'Kelancaran tartil bacaan & tidak terbata-bata' },
];

export interface KelasDetail {
  nama: string;
  wali: string;
  jumlahSantri: number;
  ruangan: string;
}

export interface KategoriKelas {
  id: string;
  nama: string;
  fokus: string;
  deskripsi: string;
  warnaBadge: string;
  warnaAksen: string;
  kelasList: KelasDetail[];
}

export const KATEGORI_KELAS_LIST: KategoriKelas[] = [
  {
    id: 'murottal',
    nama: 'Program Murottal',
    fokus: 'Tartil & Makhorijul Dasar',
    deskripsi: 'Pembelajaran makharijul huruf dasar, ketepatan harakat fashahah, dan kelancaran tartil awal.',
    warnaBadge: 'bg-[#FFF6A9]/40 text-[#857b22] border-[#FFF6A9]',
    warnaAksen: '#857b22',
    kelasList: [
      { nama: 'Kelas 1A', wali: 'Ustadz Ahmad, S.Pd.I', jumlahSantri: 25, ruangan: 'Gedung A-01' },
      { nama: 'Kelas 1B', wali: 'Ustadzah Fatimah, Lc', jumlahSantri: 24, ruangan: 'Gedung A-02' },
      { nama: 'Kelas 2A', wali: 'Ustadz Umar', jumlahSantri: 22, ruangan: 'Gedung A-03' },
      { nama: 'Kelas 5A', wali: 'Ustadz Zulkifli, S.Th.I', jumlahSantri: 25, ruangan: 'Gedung B-02' },
    ],
  },
  {
    id: 'murojaah',
    nama: 'Program Murojaah',
    fokus: 'Hafalan & Penguatan Tajwid',
    deskripsi: 'Penguatan tajwid mendalam, hukum ahkamul mad, ketepatan waqof wal ibtida, dan fashahah kelancaran.',
    warnaBadge: 'bg-[#B4E4D6]/30 text-[#2c7a61] border-[#B4E4D6]',
    warnaAksen: '#2c7a61',
    kelasList: [
      { nama: 'Kelas 2B', wali: 'Ustadzah Fatimah, Lc', jumlahSantri: 24, ruangan: 'Gedung A-04' },
      { nama: 'Kelas 3A', wali: 'Ustadzah Maryam, M.Ag', jumlahSantri: 26, ruangan: 'Gedung B-01' },
      { nama: 'Kelas 4A', wali: 'Ustadz Umar', jumlahSantri: 23, ruangan: 'Gedung B-03' },
      { nama: 'Kelas 5B', wali: 'Ustadz Zulkifli, S.Th.I', jumlahSantri: 24, ruangan: 'Gedung C-02' },
    ],
  },
  {
    id: 'tafsir',
    nama: 'Program Tafsir',
    fokus: 'Mutqin & Pendalaman Harakat',
    deskripsi: 'Tingkat mahir kajian tilawah, ketelitian muroatul harokah, dan penghayatan makna kalamullah.',
    warnaBadge: 'bg-[#FFCA88]/30 text-[#b37525] border-[#FFCA88]',
    warnaAksen: '#b37525',
    kelasList: [
      { nama: 'Kelas 6A', wali: 'Ustadz Hasan Basri', jumlahSantri: 20, ruangan: 'Gedung C-01' },
      { nama: 'Kelas 6B', wali: 'Ustadzah Fatimah, Lc', jumlahSantri: 21, ruangan: 'Gedung C-03' },
    ],
  },
  {
    id: 'diniyah',
    nama: 'Kelas Diniyah Reguler',
    fokus: 'Kurikulum Berjenjang 1 - 6',
    deskripsi: 'Evaluasi berjenjang berkala kurikulum kelas diniyah reguler tingkat 1 sampai tingkat 6.',
    warnaBadge: 'bg-[#DE7272]/20 text-[#DE7272] border-[#DE7272]/40',
    warnaAksen: '#DE7272',
    kelasList: [
      { nama: 'Kelas 1', wali: 'Ustadz Ahmad, S.Pd.I', jumlahSantri: 28, ruangan: 'Gedung D-01' },
      { nama: 'Kelas 2', wali: 'Ustadzah Fatimah, Lc', jumlahSantri: 26, ruangan: 'Gedung D-02' },
      { nama: 'Kelas 3', wali: 'Ustadzah Maryam, M.Ag', jumlahSantri: 27, ruangan: 'Gedung D-03' },
      { nama: 'Kelas 4', wali: 'Ustadz Umar', jumlahSantri: 25, ruangan: 'Gedung D-04' },
      { nama: 'Kelas 5', wali: 'Ustadz Zulkifli, S.Th.I', jumlahSantri: 24, ruangan: 'Gedung D-05' },
      { nama: 'Kelas 6', wali: 'Ustadz Hasan Basri', jumlahSantri: 22, ruangan: 'Gedung D-06' },
    ],
  },
];

export interface PenilaianSantri {
  id: string;
  tanggal: string;
  namaSantri: string;
  kategori: string;
  kelas: string;
  penguji: string;
  suratAyat: string;
  kesalahan: {
    makhorijulHuruf: number;
    shifatulHuruf: number;
    ahkamulHuruf: number;
    ahkamulMad: number;
    waqofWalIbtida: number;
    muroatulHuruf: number;
    miring: number;
    tawallud: number;
    kelancaran: number;
  };
  catatan?: string;
}

// Data Master Santri Awal
const santriPerKelasMap: { [key: string]: string[] } = {
  'Kelas 1A': ['Ahmad Zaki Al-Faruq', 'Fatimah Az-Zahra', 'Zaid bin Tsabit', 'Bilal bin Rabah'],
  'Kelas 1B': ['Ruqayyah binti Muhammad', 'Abdullah bin Abbas', 'Hasan bin Ali', 'Husain bin Ali'],
  'Kelas 2A': ['Muhammad Umar Said', 'Aisyah Humaira', 'Ali Zainal Abidin'],
  'Kelas 2B': ['Thalhah bin Ubaidillah', 'Sa\'ad bin Abi Waqqas', 'Said bin Zaid'],
  'Kelas 3A': ['Aisyah Putri Nabila', 'Salman Al-Farisi', 'Hafshah binti Umar'],
  'Kelas 4A': ['Ibrahim Ali Basayev', 'Khalid bin Walid', 'Asma binti Abi Bakar'],
  'Kelas 5A': ['Abdullah bin Mas\'ud', 'Zubair bin Awwam', 'Abu Ubaidah bin Jarrah'],
  'Kelas 5B': ['Mu\'adz bin Jabal', 'Abu Dzar Al-Ghifari', 'Miqdad bin Amr'],
  'Kelas 6A': ['Maryam Khadijah', 'Usamah bin Zaid', 'Ja\'far bin Abi Thalib'],
  'Kelas 6B': ['Hamzah bin Abdul Muthalib', 'Amr bin Ash', 'Khadijah binti Khuwailid'],
  'Kelas 1': ['Ahmad Zaki Al-Faruq', 'Fatimah Az-Zahra', 'Zaid bin Tsabit'],
  'Kelas 2': ['Muhammad Umar Said', 'Aisyah Humaira', 'Ali Zainal Abidin'],
  'Kelas 3': ['Aisyah Putri Nabila', 'Salman Al-Farisi', 'Hafshah binti Umar'],
  'Kelas 4': ['Ibrahim Ali Basayev', 'Khalid bin Walid', 'Asma binti Abi Bakar'],
  'Kelas 5': ['Abdullah bin Mas\'ud', 'Zubair bin Awwam'],
  'Kelas 6': ['Maryam Khadijah', 'Usamah bin Zaid'],
};

const initialGuruOptions = [
  'Ustadz Ahmad, S.Pd.I',
  'Ustadzah Fatimah, Lc',
  'Ustadz Umar',
  'Ustadzah Maryam, M.Ag',
  'Ustadz Zulkifli, S.Th.I',
  'Ustadz Hasan Basri',
];

const initialDataPenilaian: PenilaianSantri[] = [
  {
    id: '1',
    tanggal: '2026-10-11',
    namaSantri: 'Ahmad Zaki Al-Faruq',
    kategori: 'Program Murottal',
    kelas: 'Kelas 1A',
    penguji: 'Ustadz Ahmad, S.Pd.I',
    suratAyat: 'QS. An-Naba\' ayat 1-20',
    kesalahan: {
      makhorijulHuruf: 1,
      shifatulHuruf: 0,
      ahkamulHuruf: 1,
      ahkamulMad: 2,
      waqofWalIbtida: 0,
      muroatulHuruf: 1,
      miring: 2,
      tawallud: 1,
      kelancaran: 0,
    },
    catatan: 'Perhatikan panjang mad thobi\'i pada ayat ke-12 dan keluarnya huruf \'Ain.',
  },
  {
    id: '2',
    tanggal: '2026-10-11',
    namaSantri: 'Muhammad Umar Said',
    kategori: 'Program Murottal',
    kelas: 'Kelas 2A',
    penguji: 'Ustadzah Fatimah, Lc',
    suratAyat: 'QS. Maryam ayat 1-15',
    kesalahan: {
      makhorijulHuruf: 0,
      shifatulHuruf: 1,
      ahkamulHuruf: 0,
      ahkamulMad: 1,
      waqofWalIbtida: 1,
      muroatulHuruf: 0,
      miring: 1,
      tawallud: 0,
      kelancaran: 1,
    },
    catatan: 'Bacaan sudah sangat baik dan tenang, pertahankan kejelasan tajwid.',
  },
  {
    id: '3',
    tanggal: '2026-10-10',
    namaSantri: 'Aisyah Putri Nabila',
    kategori: 'Program Murojaah',
    kelas: 'Kelas 3A',
    penguji: 'Ustadzah Maryam, M.Ag',
    suratAyat: 'QS. Al-Kahfi ayat 1-10',
    kesalahan: {
      makhorijulHuruf: 2,
      shifatulHuruf: 2,
      ahkamulHuruf: 1,
      ahkamulMad: 1,
      waqofWalIbtida: 1,
      muroatulHuruf: 0,
      miring: 3,
      tawallud: 2,
      kelancaran: 2,
    },
    catatan: 'Hindari tawallud pada sukun lam dan mim.',
  },
  {
    id: '4',
    tanggal: '2026-10-10',
    namaSantri: 'Maryam Khadijah',
    kategori: 'Program Tafsir',
    kelas: 'Kelas 6A',
    penguji: 'Ustadz Hasan Basri',
    suratAyat: 'QS. Al-Baqarah ayat 255-257',
    kesalahan: {
      makhorijulHuruf: 0,
      shifatulHuruf: 0,
      ahkamulHuruf: 0,
      ahkamulMad: 0,
      waqofWalIbtida: 0,
      muroatulHuruf: 0,
      miring: 0,
      tawallud: 1,
      kelancaran: 0,
    },
    catatan: 'Mumtaz! Sangat mutqin dan tajwid terjaga rapi.',
  },
];

type FlowStep = 'welcome' | 'kategori' | 'kelas' | 'pendataan';

export default function HomeRaportQuranPage() {
  // Navigation Flow State
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [selectedKategori, setSelectedKategori] = useState<KategoriKelas>(KATEGORI_KELAS_LIST[0]);
  const [selectedKelas, setSelectedKelas] = useState<KelasDetail>(KATEGORI_KELAS_LIST[0].kelasList[0]);

  // Master Data Penilaian
  const [dataList, setDataList] = useState<PenilaianSantri[]>(initialDataPenilaian);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelasTabel, setFilterKelasTabel] = useState('Semua');

  // Pagination Table
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSizeOptions = [10, 15, 20, 25, 30];

  // State Form Evaluasi Bacaan
  const [selectedSantriNama, setSelectedSantriNama] = useState<string>('');
  const [customSantri, setCustomSantri] = useState('');
  const [isCustomSantri, setIsCustomSantri] = useState(false);
  const [selectedPenguji, setSelectedPenguji] = useState(initialGuruOptions[0]);
  const [suratAyat, setSuratAyat] = useState('');
  const [catatan, setCatatan] = useState('');

  // Counter 9 Kriteria Kesalahan
  const [counters, setCounters] = useState<{ [key: string]: number }>({
    makhorijulHuruf: 0,
    shifatulHuruf: 0,
    ahkamulHuruf: 0,
    ahkamulMad: 0,
    waqofWalIbtida: 0,
    muroatulHuruf: 0,
    miring: 0,
    tawallud: 0,
    kelancaran: 0,
  });

  // Modal Detail / Print
  const [detailItem, setDetailItem] = useState<PenilaianSantri | null>(null);

  // Helper Hitung Total Kesalahan & Nilai
  const hitungTotal = (kesalahan: PenilaianSantri['kesalahan']) => {
    return Object.values(kesalahan).reduce((a, b) => a + b, 0);
  };

  const hitungStatus = (kesalahan: PenilaianSantri['kesalahan']) => {
    let adaOverLimit = false;
    KRITERIA_LIST.forEach((k) => {
      const val = kesalahan[k.key as keyof typeof kesalahan] || 0;
      if (val >= k.max) adaOverLimit = true;
    });

    const total = hitungTotal(kesalahan);
    if (total === 0) return { status: 'Mumtaz (Sempurna)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (adaOverLimit || total > 15) return { status: 'Perlu Mengulang', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (total <= 5) return { status: 'Jayyid Jiddan (Sangat Baik)', color: 'bg-teal-100 text-teal-800 border-teal-300' };
    return { status: 'Jayyid (Cukup/Lulus)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  };

  // Navigasi Flow Handlers
  const handlePilihKategori = (kat: KategoriKelas) => {
    setSelectedKategori(kat);
    setCurrentStep('kelas');
  };

  const handlePilihKelas = (kls: KelasDetail) => {
    setSelectedKelas(kls);
    // Atur default santri untuk kelas terpilih
    const santriDiKelas = santriPerKelasMap[kls.nama] || [];
    if (santriDiKelas.length > 0) {
      setSelectedSantriNama(santriDiKelas[0]);
      setIsCustomSantri(false);
    } else {
      setSelectedSantriNama('');
      setIsCustomSantri(true);
    }
    setFilterKelasTabel(kls.nama);
    setCurrentStep('pendataan');
  };

  const handleIncrement = (key: string, max: number) => {
    setCounters((prev) => {
      const current = prev[key] || 0;
      if (current >= max) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: `Batas maksimal kesalahan ${key} adalah ${max}!`,
          showConfirmButton: false,
          timer: 2000,
        });
        return prev;
      }
      return { ...prev, [key]: current + 1 };
    });
  };

  const handleDecrement = (key: string) => {
    setCounters((prev) => {
      const current = prev[key] || 0;
      if (current <= 0) return prev;
      return { ...prev, [key]: current - 1 };
    });
  };

  const handleResetCounters = () => {
    setCounters({
      makhorijulHuruf: 0,
      shifatulHuruf: 0,
      ahkamulHuruf: 0,
      ahkamulMad: 0,
      waqofWalIbtida: 0,
      muroatulHuruf: 0,
      miring: 0,
      tawallud: 0,
      kelancaran: 0,
    });
  };

  const handleSubmitEvaluasi = (e: React.FormEvent) => {
    e.preventDefault();
    const namaFinal = isCustomSantri ? customSantri.trim() : selectedSantriNama;
    if (!namaFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Santri Kosong',
        text: 'Silakan pilih atau ketik nama santri terlebih dahulu!',
        confirmButtonColor: '#DE7272',
      });
      return;
    }

    const newItem: PenilaianSantri = {
      id: Date.now().toString(),
      tanggal: new Date().toISOString().split('T')[0],
      namaSantri: namaFinal,
      kategori: selectedKategori.nama,
      kelas: selectedKelas.nama,
      penguji: selectedPenguji,
      suratAyat: suratAyat.trim() || 'Latihan Bacaan Al-Quran',
      kesalahan: {
        makhorijulHuruf: counters.makhorijulHuruf,
        shifatulHuruf: counters.shifatulHuruf,
        ahkamulHuruf: counters.ahkamulHuruf,
        ahkamulMad: counters.ahkamulMad,
        waqofWalIbtida: counters.waqofWalIbtida,
        muroatulHuruf: counters.muroatulHuruf,
        miring: counters.miring,
        tawallud: counters.tawallud,
        kelancaran: counters.kelancaran,
      },
      catatan: catatan.trim(),
    };

    setDataList([newItem, ...dataList]);
    handleResetCounters();
    setSuratAyat('');
    setCatatan('');

    Swal.fire({
      icon: 'success',
      title: 'Penilaian Berhasil Disimpan!',
      text: `Data evaluasi bacaan santri "${newItem.namaSantri}" di ${newItem.kelas} telah dicatat.`,
      confirmButtonColor: '#DE7272',
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Catatan?',
      text: `Apakah Anda yakin ingin menghapus catatan penilaian santri "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DE7272',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setDataList((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dihapus!',
          text: `Data evaluasi santri "${nama}" telah dihapus.`,
          confirmButtonColor: '#DE7272',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter Data Tabel
  const filteredData = dataList.filter((item) => {
    const matchKelas = filterKelasTabel === 'Semua' || item.kelas === filterKelasTabel;
    const matchSearch = item.namaSantri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suratAyat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchSearch;
  });

  // Pagination Slicing
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const currentTotalErrors = Object.values(counters).reduce((a, b) => a + b, 0);
  const santriTersedia = santriPerKelasMap[selectedKelas.nama] || [];

  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentStep('welcome')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="bg-[#DE7272] p-2 text-white shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight uppercase text-zinc-900 dark:text-white">
                  RaportQuran
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 bg-[#B4E4D6]/40 text-emerald-800 dark:text-emerald-300 border border-[#B4E4D6]">
                  Portal Evaluasi Santri
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/admin" 
              className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-[#FFF6A9]/30 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#DE7272]" />
              Menu Admin
            </Link>
            <Link 
              href="/admin/santri" 
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#B4E4D6] border border-[#B4E4D6] text-zinc-900 hover:bg-[#a0d8c9] transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Data Santri
            </Link>
          </div>
        </div>
      </header>

      {/* ================= STEPPER BREADCRUMB INDICATOR ================= */}
      {currentStep !== 'welcome' && (
        <div className="bg-[#FFF6A9]/20 border-b border-[#FFF6A9]/60 dark:bg-zinc-900/60 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
            
            <div className="flex items-center gap-2 overflow-x-auto">
              <button 
                onClick={() => setCurrentStep('welcome')}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 shrink-0 font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </button>
              
              <span className="text-zinc-400">/</span>

              <button 
                onClick={() => setCurrentStep('kategori')}
                className={`flex items-center gap-1 shrink-0 font-medium ${currentStep === 'kategori' ? 'text-[#DE7272] font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'}`}
              >
                <span>Pilih Kategori</span>
                {currentStep !== 'kategori' && <span className="text-zinc-400">({selectedKategori.nama})</span>}
              </button>

              <span className="text-zinc-400">/</span>

              <button 
                onClick={() => setCurrentStep('kelas')}
                className={`flex items-center gap-1 shrink-0 font-medium ${currentStep === 'kelas' ? 'text-[#DE7272] font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'}`}
              >
                <span>Pilih Kelas</span>
                {currentStep === 'pendataan' && <span className="text-zinc-400">({selectedKelas.nama})</span>}
              </button>

              <span className="text-zinc-400">/</span>

              <span className={`shrink-0 ${currentStep === 'pendataan' ? 'text-[#DE7272] font-bold' : 'text-zinc-400'}`}>
                Pendataan Bacaan
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button 
                onClick={() => {
                  if (currentStep === 'pendataan') setCurrentStep('kelas');
                  else if (currentStep === 'kelas') setCurrentStep('kategori');
                  else setCurrentStep('welcome');
                }}
                className="px-2.5 py-1 text-[11px] font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Kembali
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= STEP 1: SELAMAT DATANG (WELCOME SCREEN) ================= */}
      {currentStep === 'welcome' && (
        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 animate-in fade-in duration-200">
          
          {/* Hero Banner */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF6A9]/50 border border-[#FFF6A9] text-amber-900 dark:text-amber-200 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#DE7272]" />
              Muharrik Qur'an Pesantren Ilmu Al-Qur'an
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Selamat Datang di Portal <br />
              <span className="text-[#DE7272]">Pendataan Kesalahan Baca Santri</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sistem digital pencatatan dan evaluasi tilawah santri secara realtime berdasarkan 
              <strong> 9 kriteria standar tajwid & makharijul huruf</strong>, untuk menghasilkan raport tilawah yang akurat dan objektif.
            </p>

            {/* Tombol Mulai Utama */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => setCurrentStep('kategori')}
                className="w-full sm:w-auto px-8 py-4 bg-[#DE7272] hover:bg-[#c96363] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>Mulai Penilaian Bacaan Santri</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/admin/santri"
                className="w-full sm:w-auto px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-[#FFF6A9]/30 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-zinc-500" />
                <span>Lihat Data Santri</span>
              </Link>
            </div>
          </div>

          {/* 3 Kartu Keunggulan / Informasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#FFF6A9] text-zinc-900 flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                  9 Kriteria Terstandar
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Pencatatan lengkap mulai dari Makhorijul Huruf, Shifatul Huruf, Ahkamul Mad, hingga Miring, Tawallud, dan Kelancaran.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Batas Max. 5 & Max. 9 Kesalahan
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#B4E4D6] text-zinc-900 flex items-center justify-center font-bold mb-4">
                  <RotateCcw className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                  Live Realtime Clicker
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Penguji dapat langsung menekan tombol counter kesalahan saat menyimak santri melafalkan bacaan secara langsung (talaqqi).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-[#DE7272]">
                ✓ Tombol +, -, dan Indikator Over Limit
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#FFCA88] text-zinc-900 flex items-center justify-center font-bold mb-4">
                  <Printer className="w-5 h-5 text-amber-800" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                  Rekap & Raport Siap Cetak
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Setiap evaluasi tersimpan rapi dalam tabel rekapitulasi lengkap bergaris resmi dan dapat dicetak menjadi lembar raport bacaan santri.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                ✓ Cetak format resmi Pesantren
              </div>
            </div>

          </div>

          {/* Quick Flow Hint */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
            Alur Penilaian: <strong>1. Selamat Datang</strong> ➔ <strong>2. Pilih Kategori Kelas</strong> ➔ <strong>3. Pilih Kelas Spesifik</strong> ➔ <strong>4. Input Evaluasi & Counter Kesalahan</strong>
          </div>

        </div>
      )}

      {/* ================= STEP 2: MEMILIH KATEGORI KELAS ================= */}
      {currentStep === 'kategori' && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
          
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#DE7272] uppercase tracking-wider">Langkah 1 dari 2</span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-0.5">
                Pilih Kategori Kelas
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Tentukan rumpun program pembelajaran Al-Qur'an santri yang akan dievaluasi.
              </p>
            </div>
            
            <button
              onClick={() => setCurrentStep('welcome')}
              className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
            </button>
          </div>

          {/* Grid Pilihan Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {KATEGORI_KELAS_LIST.map((kat) => (
              <div
                key={kat.id}
                onClick={() => handlePilihKategori(kat)}
                className="group p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#DE7272] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${kat.warnaBadge}`}>
                      {kat.fokus}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-[#DE7272] transition-colors flex items-center gap-1">
                      {kat.kelasList.length} Kelas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-[#DE7272] transition-colors mb-2">
                    {kat.nama}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {kat.deskripsi}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Rombel: {kat.kelasList.map(k => k.nama).join(', ')}</span>
                  </div>
                  <span className="text-xs font-bold text-[#DE7272] group-hover:underline flex items-center gap-1">
                    Pilih Kategori <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= STEP 3: MEMILIH KELAS SPESIFIK ================= */}
      {currentStep === 'kelas' && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
          
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#DE7272] uppercase tracking-wider">Langkah 2 dari 2</span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-0.5">
                Pilih Kelas Spesifik ({selectedKategori.nama})
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Pilih rombel santri yang akan diuji untuk langsung membuka form pendataan kesalahan baca.
              </p>
            </div>
            
            <button
              onClick={() => setCurrentStep('kategori')}
              className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Ganti Kategori
            </button>
          </div>

          {/* Grid Pilihan Kelas Spesifik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedKategori.kelasList.map((kls) => (
              <div
                key={kls.nama}
                onClick={() => handlePilihKelas(kls)}
                className="group p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#DE7272] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-zinc-400">
                      {kls.ruangan}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#B4E4D6]/30 text-emerald-800 dark:text-emerald-300 border border-[#B4E4D6]/60">
                      {kls.jumlahSantri} Santri
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white group-hover:text-[#DE7272] transition-colors mb-1">
                    {kls.nama}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mt-2">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Wali: <strong>{kls.wali}</strong></span>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-[#DE7272]">
                  <span>Buka Lembar Evaluasi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= STEP 4: TAMPILAN PENDATAAN KESALAHAN BACA SANTRI ================= */}
      {currentStep === 'pendataan' && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 animate-in fade-in duration-200">
          
          {/* Header Status Kelas Aktif & Tombol Ubah Kelas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-[#FFF6A9]/50 text-amber-900 border border-[#FFF6A9]">
                  {selectedKategori.nama}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-[#B4E4D6]/30 text-emerald-800 border border-[#B4E4D6]">
                  {selectedKelas.nama} ({selectedKelas.ruangan})
                </span>
                <span className="text-xs text-zinc-500">
                  Wali: {selectedKelas.wali}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Pendataan Kesalahan Baca Santri: {selectedKelas.nama}
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Catat dan evaluasi kekeliruan tajwid, makhraj, dan kelancaran bacaan santri secara realtime.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setCurrentStep('kelas')}
                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-[#FFF6A9]/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-1.5"
                title="Ganti ke kelas lain dalam kategori yang sama"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#DE7272]" />
                Ganti Kelas
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('kategori')}
                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Ganti kategori program"
              >
                Ganti Kategori
              </button>
            </div>
          </div>

          {/* ================= FORM LIVE PENDATAAN & COUNTER ================= */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            
            {/* Card Header Form */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-[#FFF6A9]/20 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#DE7272] p-2 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Form Penilaian & Live Counter Kesalahan ({selectedKelas.nama})
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Klik tombol <kbd className="font-bold">+</kbd> saat santri melakukan kesalahan saat menyimak bacaan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCounters}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"
                  title="Reset semua hitungan kesalahan ke 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Counter (0)
                </button>

                <div className="px-3.5 py-1.5 bg-[#DE7272] text-white text-xs font-bold flex items-center gap-1.5">
                  <span>Total:</span>
                  <span className="text-sm font-mono">{currentTotalErrors}</span>
                  <span>Kesalahan</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluasi} className="p-5 md:p-6 space-y-6">
              
              {/* Informasi Identitas Santri & Sesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/80">
                
                {/* Pilihan Santri */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      Nama Santri <span className="text-[#DE7272]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSantri(!isCustomSantri)}
                      className="text-[11px] text-[#DE7272] hover:underline"
                    >
                      {isCustomSantri ? 'Pilih dari rombel' : 'Ketik nama baru'}
                    </button>
                  </div>

                  {isCustomSantri ? (
                    <input
                      type="text"
                      required
                      value={customSantri}
                      onChange={(e) => setCustomSantri(e.target.value)}
                      placeholder="Masukkan nama santri..."
                      className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#DE7272]"
                    />
                  ) : (
                    <select
                      value={selectedSantriNama}
                      onChange={(e) => setSelectedSantriNama(e.target.value)}
                      className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#DE7272] cursor-pointer"
                    >
                      {santriTersedia.length > 0 ? (
                        santriTersedia.map((nm) => (
                          <option key={nm} value={nm}>{nm}</option>
                        ))
                      ) : (
                        <option value="">(Belum ada santri terdaftar di kelas ini)</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Kelas Terpilih (Read-only dengan info) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                    Kelas Aktif
                  </label>
                  <div className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/80 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>{selectedKelas.nama} ({selectedKategori.nama})</span>
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep('kelas')}
                      className="text-[10px] text-[#DE7272] hover:underline"
                    >
                      Ubah
                    </button>
                  </div>
                </div>

                {/* Penguji / Guru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    Ustadz / Penguji <span className="text-[#DE7272]">*</span>
                  </label>
                  <select
                    value={selectedPenguji}
                    onChange={(e) => setSelectedPenguji(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#DE7272] cursor-pointer"
                  >
                    {initialGuruOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Surat & Ayat yang dibaca */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    Materi Bacaan / Surat & Ayat
                  </label>
                  <input
                    type="text"
                    value={suratAyat}
                    onChange={(e) => setSuratAyat(e.target.value)}
                    placeholder="Misal: QS. Al-Baqarah 1-10"
                    className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:border-[#DE7272]"
                  />
                </div>

              </div>

              {/* GRID COUNTER 9 KRITERIA KESALAHAN BACA */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span>9 Kriteria Kesalahan Baca Santri</span>
                    <span className="text-[11px] font-normal text-zinc-500">(Batas merah menandakan over limit)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {KRITERIA_LIST.map((kriteria) => {
                    const count = counters[kriteria.key] || 0;
                    const isMaxReached = count >= kriteria.max;

                    return (
                      <div 
                        key={kriteria.key}
                        className={`p-3.5 border transition-all ${
                          isMaxReached 
                            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20' 
                            : count > 0 
                              ? 'border-amber-300 bg-[#FFF6A9]/15 dark:bg-zinc-800/80' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-zinc-900 dark:text-white">
                              {kriteria.nama}
                            </div>
                            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                              (Kesalahan max.{kriteria.max})
                            </div>
                          </div>

                          {/* Badge Status Counter */}
                          <span className={`px-2 py-0.5 text-[11px] font-mono font-bold border ${
                            isMaxReached 
                              ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                              : count > 0 
                                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {count} / {kriteria.max}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                          {kriteria.keterangan}
                        </p>

                        {/* Tombol Counter Besar */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecrement(kriteria.key)}
                            disabled={count === 0}
                            className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-colors"
                            title="Kurangi 1 kesalahan"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="w-14 text-center font-mono font-bold text-lg text-zinc-900 dark:text-white">
                            {count}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleIncrement(kriteria.key, kriteria.max)}
                            className={`flex-1 py-2 border font-bold flex items-center justify-center transition-all ${
                              isMaxReached 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600' 
                                : 'bg-[#DE7272] hover:bg-[#c96363] text-white border-[#DE7272]'
                            }`}
                            title={`Tambah kesalahan (maksimal ${kriteria.max})`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Evaluasi & Tombol Simpan */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Catatan / Rekomendasi Evaluasi Khusus Santri (Opsional)
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Misal: Perhatikan makhraj huruf 'Ain dan hati-hati tawallud pada sukun lam..."
                    className="block w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:border-[#DE7272]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full lg:w-auto px-6 py-2.5 bg-[#DE7272] hover:bg-[#c96363] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap h-[38px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Evaluasi Santri ({selectedKelas.nama})
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* ================= REKAP TABEL EVALUASI KESALAHAN BACA ================= */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              
              {/* Toolbar Filter Kelas & Pencarian */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
                  <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Filter Tabel:
                  </span>
                  {['Semua', ...selectedKategori.kelasList.map(k => k.nama)].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setFilterKelasTabel(k);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold border transition-all whitespace-nowrap ${
                        filterKelasTabel === k
                          ? 'border-[#DE7272] bg-[#DE7272] text-white shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari santri / surat..."
                      className="block w-full pl-8 pr-3 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:ring-1 focus:ring-[#DE7272]"
                    />
                  </div>

                  {/* Dropdown Maksimal */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 shrink-0">
                    <span className="hidden sm:inline">Maksimal:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#DE7272] cursor-pointer"
                    >
                      {pageSizeOptions.map((sz) => (
                        <option key={sz} value={sz}>{sz} data</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* TABEL DENGAN FORMAT HEADER PERSIS SEPERTI GAMBAR USER */}
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left border-collapse border-2 border-black dark:border-zinc-700">
                  
                  {/* HEADER TABEL HIJAU DENGAN TEKS MERAH BOLD SESUAI GAMBAR */}
                  <thead className="text-[11px] bg-[#9FD378] dark:bg-emerald-900/60 text-black dark:text-zinc-100 uppercase">
                    <tr>
                      <th rowSpan={2} className="px-3 py-2.5 font-bold text-center border border-black dark:border-zinc-700 w-12">
                        No
                      </th>
                      <th rowSpan={2} className="px-3 py-2.5 font-bold text-left border border-black dark:border-zinc-700 min-w-[140px]">
                        Nama Santri
                      </th>
                      <th rowSpan={2} className="px-2.5 py-2.5 font-bold text-center border border-black dark:border-zinc-700 min-w-[70px]">
                        Kelas
                      </th>

                      {/* 9 KOLOM KRITERIA PERSIS GAMBAR */}
                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Makhorijul</div>
                        <div>Huruf</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Shifatul Huruf</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Ahkamul</div>
                        <div>Huruf</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Ahkamul Mad</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Waqof wal</div>
                        <div>Ibtida</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Muroatul</div>
                        <div>Huruf wal</div>
                        <div>Harokah</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.5)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Miring</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.9)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Tawallud</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.9)</div>
                      </th>

                      <th className="px-2.5 py-2 font-bold text-center border border-black dark:border-zinc-700 leading-tight">
                        <div>Kelancaran</div>
                        <div className="text-red-700 dark:text-red-300 font-extrabold normal-case text-[10px]">(Kesalahan max.9)</div>
                      </th>

                      <th rowSpan={2} className="px-2.5 py-2.5 font-bold text-center border border-black dark:border-zinc-700 min-w-[70px]">
                        Total
                      </th>
                      <th rowSpan={2} className="px-3 py-2.5 font-bold text-center border border-black dark:border-zinc-700 min-w-[120px]">
                        Hasil Evaluasi
                      </th>
                      <th rowSpan={2} className="px-3 py-2.5 font-bold text-center border border-black dark:border-zinc-700 w-24">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  {/* ISI TABEL */}
                  <tbody className="divide-y divide-black dark:divide-zinc-700 bg-white dark:bg-zinc-900">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="px-5 py-12 text-center text-zinc-400 border border-black dark:border-zinc-700">
                          Belum ada data evaluasi santri {searchQuery ? `yang cocok dengan "${searchQuery}"` : ''}.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row, idx) => {
                        const total = hitungTotal(row.kesalahan);
                        const hasil = hitungStatus(row.kesalahan);

                        return (
                          <tr key={row.id} className="hover:bg-[#FFF6A9]/15 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-3 py-2.5 font-bold text-zinc-600 dark:text-zinc-400 text-center border border-black dark:border-zinc-700">
                              {startIndex + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 border border-black dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white">
                              <div>{row.namaSantri}</div>
                              <div className="text-[10px] font-normal text-zinc-500">{row.suratAyat}</div>
                            </td>
                            <td className="px-2.5 py-2.5 text-center border border-black dark:border-zinc-700">
                              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#B4E4D6]/30 text-emerald-800 dark:text-emerald-300 border border-[#B4E4D6]/60">
                                {row.kelas}
                              </span>
                            </td>

                            {/* 9 KOLOM NILAI */}
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.makhorijulHuruf >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.makhorijulHuruf}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.shifatulHuruf >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.shifatulHuruf}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.ahkamulHuruf >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.ahkamulHuruf}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.ahkamulMad >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.ahkamulMad}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.waqofWalIbtida >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.waqofWalIbtida}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.muroatulHuruf >= 5 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.muroatulHuruf}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.miring >= 9 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.miring}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.tawallud >= 9 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.tawallud}
                            </td>
                            <td className={`px-2 py-2 text-center border border-black dark:border-zinc-700 font-mono font-bold ${row.kesalahan.kelancaran >= 9 ? 'bg-rose-100 text-rose-700 font-extrabold' : ''}`}>
                              {row.kesalahan.kelancaran}
                            </td>

                            {/* TOTAL KESALAHAN */}
                            <td className="px-2.5 py-2 text-center border border-black dark:border-zinc-700 font-mono font-extrabold text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/40">
                              {total}
                            </td>

                            {/* HASIL EVALUASI */}
                            <td className="px-2.5 py-2 text-center border border-black dark:border-zinc-700">
                              <span className={`inline-block px-2 py-1 text-[10px] font-bold border ${hasil.color}`}>
                                {hasil.status}
                              </span>
                            </td>

                            {/* AKSI */}
                            <td className="px-2 py-2 text-center border border-black dark:border-zinc-700">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDetailItem(row)}
                                  className="p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Lihat Raport Lengkap"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(row.id, row.namaSantri)}
                                  className="p-1.5 text-zinc-500 hover:text-[#DE7272] hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Data"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                  {pageSizeOptions.map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
                <span>per halaman</span>
                <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
                <span className="hidden sm:inline">
                  {filteredData.length === 0
                    ? '0 data'
                    : `Menampilkan ${startIndex + 1}–${endIndex} dari ${filteredData.length} data evaluasi`}
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
                    className={`px-3 py-1.5 border font-semibold transition-colors ${
                      safeCurrentPage === pageNum
                        ? 'border-[#DE7272] bg-[#DE7272] text-white'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages || filteredData.length === 0}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ================= MODAL DETAIL RAPORT BACAAN ================= */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:w-full">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-[#FFF6A9]/20 dark:bg-zinc-800/40 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#DE7272] p-1.5 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Raport Evaluasi Kesalahan Bacaan Santri
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Cetak Raport */}
            <div className="p-6 space-y-5">
              
              <div className="border-b border-zinc-200 pb-4 flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {detailItem.namaSantri}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {detailItem.kategori} • {detailItem.kelas} • Penguji: {detailItem.penguji} • Tanggal: {detailItem.tanggal}
                  </p>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                    Materi: {detailItem.suratAyat}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold border ${hitungStatus(detailItem.kesalahan).color}`}>
                  {hitungStatus(detailItem.kesalahan).status}
                </span>
              </div>

              {/* Rincian 9 Kriteria */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2.5">
                  Rincian 9 Kriteria Kesalahan:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {KRITERIA_LIST.map((k) => {
                    const val = detailItem.kesalahan[k.key as keyof typeof detailItem.kesalahan];
                    const isMax = val >= k.max;
                    return (
                      <div 
                        key={k.key} 
                        className={`p-2.5 border text-xs ${
                          isMax ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{k.nama}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-zinc-500">Maksimal: {k.max}</span>
                          <span className="font-bold font-mono text-sm">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Khusus */}
              {detailItem.catatan && (
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <div className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">Catatan Khusus Penguji:</div>
                  <p className="text-zinc-600 dark:text-zinc-400 italic">"{detailItem.catatan}"</p>
                </div>
              )}

              {/* Ringkasan Skor Total */}
              <div className="p-4 bg-[#B4E4D6]/20 border border-[#B4E4D6] flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Total Kesalahan Tercatat:
                </span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {hitungTotal(detailItem.kesalahan)} Kesalahan
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Raport
              </button>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>RaportQuran © 2026 • Sistem Evaluasi & Pendataan Kesalahan Baca Santri</p>
      </footer>

    </div>
  );
}
