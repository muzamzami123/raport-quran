"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  AlertTriangle,
  Layers,
  Clock,
  Plus,
  Minus,
  FileText,
  School,
  Bookmark,
  GraduationCap,
  Search,
  Calendar,
  Printer
} from "lucide-react";

// ==========================================
// DATA DEFINITIONS & INITIAL DUMMY RECORDS
// ==========================================

interface Category {
  id: string;
  name: string;
  arabic: string;
  description: string;
  totalClasses: number;
  totalStudents: number;
  focus: string;
}

interface SantriRecord {
  id: string;
  nis: string;
  nama: string;
  status: "Belum Setor" | "Sedang Menyimak" | "Selesai";
  surahDibaca: string;
  totalKesalahan: number;
  nilai: number | null;
  predikat: string | null;
  catatanGuru?: string;
  errors: {
    makhorij: number;
    shifat: number;
    mad: number;
    nunMim: number;
    waqaf: number;
    lahnJali: number;
  };
}

interface UjianSession {
  id: string;
  namaUjian: string;
  tanggalUjian: string;
  santriList: SantriRecord[];
}

interface ClassItem {
  id: string;
  categoryId: string;
  name: string;
  wali: string;
  ruangan: string;
  target: string;
  santriList: SantriRecord[];
  ujianList?: UjianSession[];
}

const createDefaultUjianList = (clsId: string, baseSantri: SantriRecord[]): UjianSession[] => [
  {
    id: `${clsId}-u1`,
    namaUjian: "Tasmi' Ujian Utama",
    tanggalUjian: "17 Oktober 2026",
    santriList: baseSantri.map((s) => ({ ...s }))
  },
  {
    id: `${clsId}-u2`,
    namaUjian: "Evaluasi Tahsin & Tartil",
    tanggalUjian: "10 Oktober 2026",
    santriList: baseSantri.map((s, idx) => ({
      ...s,
      status: "Selesai" as const,
      nilai: 92 + (idx % 6),
      predikat: idx % 2 === 0 ? "Mumtaz" : "Jayyid Jiddan",
      totalKesalahan: idx % 2,
      surahDibaca: s.surahDibaca || "Juz 30 (Al-A'la s.d An-Nas)"
    }))
  },
  {
    id: `${clsId}-u3`,
    namaUjian: "Ujian Murojaah Sab'i",
    tanggalUjian: "03 Oktober 2026",
    santriList: baseSantri.map((s, idx) => ({
      ...s,
      status: "Selesai" as const,
      nilai: 88 + (idx % 8),
      predikat: "Jayyid Jiddan",
      totalKesalahan: 2,
      surahDibaca: s.surahDibaca || "Juz 29 (Al-Mulk s.d Al-Mursalat)"
    }))
  }
];

const categoriesData: Category[] = [
  {
    id: "murottal",
    name: "Murottal",
    arabic: "الترتيل والتلاوة",
    description: "Bimbingan bacaan Al-Qur'an santri dengan tartil, fasih, serta ketepatan makhorijul huruf dan kaidah tajwid dasar hingga lanjutan.",
    totalClasses: 3,
    totalStudents: 10,
    focus: "Tartil & Tajwid"
  },
  {
    id: "murojaah",
    name: "Murojaah",
    arabic: "المراجعة والتسميع",
    description: "Pengulangan juz lama, tasmi' bil ghoib sekali duduk (1 s.d 5 juz), serta pengujian daya rekat dan kelancaran ingatan santri.",
    totalClasses: 2,
    totalStudents: 6,
    focus: "Daya Rekat & Kelancaran"
  },
  {
    id: "tafsir",
    name: "Tafsir",
    arabic: "التفسير وتدبر القرآن",
    description: "Pemahaman makna ayat, asbabun nuzul, kaidah waqaf ibtida' berdasar makna, serta pembinaan adab hamalatul Qur'an.",
    totalClasses: 2,
    totalStudents: 4,
    focus: "Waqaf, Ibtida' & Makna"
  }
];

const initialClassesData: ClassItem[] = [
  // MUROTTAL CLASSES
  {
    id: "murottal-1",
    categoryId: "murottal",
    name: "Kelas 1A - Murottal",
    wali: "Ustadz Ahmad",
    ruangan: "Gedung A-01 • Serambi Barat",
    target: "Pemberantasan Lahn Jali & Makhraj Halqiyah",
    santriList: [
      {
        id: "s-1",
        nis: "RQ-24-001",
        nama: "Ahmad Zaki Al-Faruq",
        status: "Selesai",
        surahDibaca: "Surah Al-Fatihah & Al-Baqarah: 1-5",
        totalKesalahan: 1,
        nilai: 94,
        predikat: "Jayyid Jiddan",
        catatanGuru: "Makhraj Ain sudah sangat membaik, perhatikan desis huruf Shad di ayat 5.",
        errors: { makhorij: 1, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-2",
        nis: "RQ-24-002",
        nama: "Bilal bin Rabah Pratama",
        status: "Belum Setor",
        surahDibaca: "Surah An-Naba': 1-15",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-3",
        nis: "RQ-24-003",
        nama: "Zaid bin Tsabit",
        status: "Belum Setor",
        surahDibaca: "Surah An-Naziat: 1-20",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-4",
        nis: "RQ-24-004",
        nama: "Fatimah Az-Zahra",
        status: "Selesai",
        surahDibaca: "Surah Al-Mulk: 1-12",
        totalKesalahan: 0,
        nilai: 98,
        predikat: "Mumtaz",
        catatanGuru: "Maa Syaa Allah bacaan sangat tartil, makhraj fasih dan konsisten.",
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },
  {
    id: "murottal-2",
    categoryId: "murottal",
    name: "Kelas 2A - Murottal",
    wali: "Ustadz Umar",
    ruangan: "Gedung A-03 • Ruang Qiraat",
    target: "Pematangan Shifat Huruf & Ghunnah",
    santriList: [
      {
        id: "s-5",
        nis: "RQ-24-005",
        nama: "Ali Zainal Abidin",
        status: "Belum Setor",
        surahDibaca: "Surah Al-Waqiah: 1-30",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-6",
        nis: "RQ-24-006",
        nama: "Muhammad Rayhan Al-Ghifari",
        status: "Belum Setor",
        surahDibaca: "Surah Ar-Rahman: 1-25",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },
  {
    id: "murottal-3",
    categoryId: "murottal",
    name: "Kelas 5A - Murottal",
    wali: "Ustadz Zulkifli",
    ruangan: "Gedung B-02 • Paviliun Tartil",
    target: "Ahkamul Mad wal Qashr & Waqaf Ibtida'",
    santriList: [
      {
        id: "s-7",
        nis: "RQ-24-007",
        nama: "Aisyah Putri Nabila",
        status: "Belum Setor",
        surahDibaca: "Surah Yasin: 1-20",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-8",
        nis: "RQ-24-008",
        nama: "Muhammad Ziyad Al-Farisi",
        status: "Selesai",
        surahDibaca: "Surah Al-Insyiqaq: 1-25",
        totalKesalahan: 1,
        nilai: 95,
        predikat: "Mumtaz",
        catatanGuru: "Setoran tartil lancar. Sedikit diperbaiki mad wajib di ayat 16.",
        errors: { makhorij: 0, shifat: 0, mad: 1, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-9",
        nis: "RQ-24-009",
        nama: "Salman Al-Farisi",
        status: "Belum Setor",
        surahDibaca: "Surah Al-Buruj: 1-22",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-10",
        nis: "RQ-24-010",
        nama: "Khalid bin Walid S.",
        status: "Belum Setor",
        surahDibaca: "Surah Al-A'la: 1-19",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },

  // MUROJAAH CLASSES
  {
    id: "murojaah-1",
    categoryId: "murojaah",
    name: "Kelas 1B - Murojaah",
    wali: "Ustadzah Fatimah",
    ruangan: "Gedung A-02 • Aula Murojaah",
    target: "Kelancaran Murojaah 5 Juz Sekali Majelis",
    santriList: [
      {
        id: "s-201",
        nis: "RQ-24-201",
        nama: "Maryam Khadijah",
        status: "Belum Setor",
        surahDibaca: "Juz 1 (Al-Fatihah s.d Al-Baqarah 141)",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-202",
        nis: "RQ-24-202",
        nama: "Ibrahim Ali Basayev",
        status: "Belum Setor",
        surahDibaca: "Surah Ali 'Imran: 1-15",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-203",
        nis: "RQ-24-203",
        nama: "Muadz bin Jabal Nur",
        status: "Belum Setor",
        surahDibaca: "Surah An-Nisa: 1-10",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },
  {
    id: "murojaah-2",
    categoryId: "murojaah",
    name: "Kelas 3A - Murojaah",
    wali: "Ustadzah Maryam",
    ruangan: "Gedung B-01 • Ruang Ujian Tasmi'",
    target: "Syahadah Tasmi' Bil Ghoib 1 Juz",
    santriList: [
      {
        id: "s-204",
        nis: "RQ-24-204",
        nama: "Hafshah binti Umar",
        status: "Belum Setor",
        surahDibaca: "Juz 30 Lengkap",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-205",
        nis: "RQ-24-205",
        nama: "Usamah bin Zaid Al-Banjari",
        status: "Belum Setor",
        surahDibaca: "Surah Al-An'am: 1-20",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-206",
        nis: "RQ-24-206",
        nama: "Zubair bin Awwam",
        status: "Belum Setor",
        surahDibaca: "Surah Yusuf: 1-25",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },

  // TAFSIR CLASSES
  {
    id: "tafsir-1",
    categoryId: "tafsir",
    name: "Kelas 6A - Tafsir",
    wali: "Ustadz Hasan Basri",
    ruangan: "Gedung C-01 • Aula Utama Pesantren",
    target: "Pemahaman Makna & Waqaf Ibtida' Juz 30",
    santriList: [
      {
        id: "s-301",
        nis: "RQ-24-301",
        nama: "Ruqayyah binti Muhammad",
        status: "Belum Setor",
        surahDibaca: "Surah An-Naba' & An-Naziat",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-302",
        nis: "RQ-24-302",
        nama: "Abdullah bin Mas'ud Al-Anshari",
        status: "Belum Setor",
        surahDibaca: "Surah At-Thariq: 1-17",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  },
  {
    id: "tafsir-2",
    categoryId: "tafsir",
    name: "Kelas Tafsir & Tadabbur Tematik",
    wali: "Ustadz Hilman Hakim, Lc",
    ruangan: "Gedung C-02 • Perpustakaan Al-Qur'an",
    target: "Kajian Tematik Adab Hamalatul Qur'an",
    santriList: [
      {
        id: "s-303",
        nis: "RQ-24-303",
        nama: "Ahmad Fauzan Mubarok",
        status: "Belum Setor",
        surahDibaca: "Surah Al-Kahfi: 1-15",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      },
      {
        id: "s-304",
        nis: "RQ-24-304",
        nama: "Syifa Khairunnisa",
        status: "Belum Setor",
        surahDibaca: "Surah Luqman: 12-19",
        totalKesalahan: 0,
        nilai: null,
        predikat: null,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 }
      }
    ]
  }
];

export default function HomeGuruEvaluationPage() {
  // Navigation Steps:
  // "welcome" -> Sambutan Ahlan Wa Sahlan
  // "category" -> Pilih Program (Murottal, Murojaah, Tafsir)
  // "class" -> Pilih Kelas / Halaqah
  // "exams" -> Tabel Ujian (No, tanggal ujian, santri selesai, santri belum, aksi Masuk)
  // "students" -> Tabel Daftar Santri pada Ujian Terpilih
  // "evaluation" -> Lembar Pencatatan Kesalahan Santri
  const [currentStep, setCurrentStep] = useState<"welcome" | "category" | "class" | "exams" | "students" | "evaluation">("welcome");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [searchSantri, setSearchSantri] = useState("");
  const [printingSantri, setPrintingSantri] = useState<SantriRecord | null>(null);

  // Modal Tambah Jadwal Ujian
  const [isAddUjianOpen, setIsAddUjianOpen] = useState(false);
  const [newTanggalUjian, setNewTanggalUjian] = useState("");
  const [newNamaUjian, setNewNamaUjian] = useState("");

  // Class & Student Data State with Default Ujian Lists
  const [classesList, setClassesList] = useState<ClassItem[]>(() =>
    initialClassesData.map((cls) => ({
      ...cls,
      ujianList: createDefaultUjianList(cls.id, cls.santriList)
    }))
  );
  const [activeSantriId, setActiveSantriId] = useState<string | null>(null);

  // Active Evaluation Form State (for the chosen student)
  const [surahAyat, setSurahAyat] = useState("");
  const [tipeSesi, setTipeSesi] = useState("Tasmi' Ujian Resmi");
  const [catatanUstadz, setCatatanUstadz] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Error Tracking Counters
  const [errorCounters, setErrorCounters] = useState({
    makhorij: 0,
    shifat: 0,
    mad: 0,
    nunMim: 0,
    waqaf: 0,
    lahnJali: 0
  });

  // Current selected objects
  const selectedCategory = categoriesData.find((c) => c.id === selectedCategoryId);
  const selectedClass = classesList.find((c) => c.id === selectedClassId);
  const availableClasses = classesList.filter((c) => c.categoryId === selectedCategoryId);
  const selectedExam =
    selectedClass?.ujianList?.find((u) => u.id === selectedExamId) || selectedClass?.ujianList?.[0];
  const activeSantri =
    selectedExam?.santriList.find((s) => s.id === activeSantriId) || selectedExam?.santriList[0];

  // Filtered santri list for search in current exam
  const filteredSantri = (selectedExam?.santriList || []).filter((s) => {
    if (!searchSantri.trim()) return true;
    const q = searchSantri.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
  });

  // Step transitions
  const handleStartProcess = () => {
    setSelectedCategoryId(null);
    setSelectedClassId(null);
    setSelectedExamId(null);
    setCurrentStep("category");
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentStep("class");
  };

  const handleSelectClass = (clsId: string) => {
    setSelectedClassId(clsId);
    setSelectedExamId(null);
    setSearchSantri("");
    setCurrentStep("exams");
  };

  const handleEnterExam = (examId: string) => {
    setSelectedExamId(examId);
    setSearchSantri("");
    setCurrentStep("students");
  };

  const handleOpenEvaluation = (santri: SantriRecord) => {
    setActiveSantriId(santri.id);
    setSurahAyat(santri.surahDibaca || "");
    setErrorCounters(santri.errors || { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 });
    setCatatanUstadz(santri.catatanGuru || "");
    setCurrentStep("evaluation");
  };

  const handleAddUjianSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newTanggalUjian.trim() || !newNamaUjian.trim()) return;

    const newSession: UjianSession = {
      id: `${selectedClass.id}-u-${Date.now()}`,
      namaUjian: newNamaUjian.trim(),
      tanggalUjian: newTanggalUjian.trim(),
      santriList: selectedClass.santriList.map((s) => ({
        ...s,
        status: "Belum Setor" as const,
        nilai: null,
        predikat: null,
        totalKesalahan: 0,
        errors: { makhorij: 0, shifat: 0, mad: 0, nunMim: 0, waqaf: 0, lahnJali: 0 },
        catatanGuru: ""
      }))
    };

    setClassesList((prev) =>
      prev.map((cls) =>
        cls.id === selectedClass.id
          ? { ...cls, ujianList: [newSession, ...(cls.ujianList || [])] }
          : cls
      )
    );

    setNewTanggalUjian("");
    setNewNamaUjian("");
    setIsAddUjianOpen(false);
    setToastMessage(`Sesi ujian "${newSession.namaUjian}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Error Counter Handlers
  const handleAdjustError = (key: keyof typeof errorCounters, delta: number) => {
    setErrorCounters((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleAddQuickTag = (tag: string) => {
    setCatatanUstadz((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  // Calculate live score
  const totalErrors =
    errorCounters.makhorij +
    errorCounters.shifat +
    errorCounters.mad +
    errorCounters.nunMim +
    errorCounters.waqaf +
    errorCounters.lahnJali;

  const calculatedScore = Math.max(
    50,
    Math.round(
      100 -
        (errorCounters.lahnJali * 6 +
          errorCounters.makhorij * 3 +
          errorCounters.shifat * 1.5 +
          errorCounters.mad * 2 +
          errorCounters.nunMim * 2 +
          errorCounters.waqaf * 2.5)
    )
  );

  const getPredikat = (score: number) => {
    if (score >= 95) return "Mumtaz (Istimewa)";
    if (score >= 85) return "Jayyid Jiddan (Sangat Baik)";
    if (score >= 75) return "Jayyid (Baik)";
    if (score >= 65) return "Maqbul (Cukup)";
    return "Perlu Bimbingan / Remidi";
  };

  // Save current student evaluation and return to student table for this exam
  const handleSaveEvaluation = () => {
    if (!selectedClass || !selectedExam || !activeSantri) return;

    const predikat = getPredikat(calculatedScore);

    const updatedSantriList = selectedExam.santriList.map((s) => {
      if (s.id === activeSantri.id) {
        return {
          ...s,
          status: "Selesai" as const,
          surahDibaca: surahAyat || s.surahDibaca,
          totalKesalahan: totalErrors,
          nilai: calculatedScore,
          predikat: predikat,
          catatanGuru: catatanUstadz,
          errors: { ...errorCounters }
        };
      }
      return s;
    });

    const updatedUjianList = (selectedClass.ujianList || []).map((u) => {
      if (u.id === selectedExam.id) {
        return { ...u, santriList: updatedSantriList };
      }
      return u;
    });

    setClassesList((prev) =>
      prev.map((cls) => (cls.id === selectedClass.id ? { ...cls, ujianList: updatedUjianList } : cls))
    );

    setToastMessage(`Evaluasi bacaan untuk ${activeSantri.nama} berhasil disimpan! Nilai: ${calculatedScore} (${predikat})`);
    setTimeout(() => setToastMessage(null), 4000);

    // Return to the students table for this exam!
    setCurrentStep("students");
  };

  const handleResetCounters = () => {
    setErrorCounters({
      makhorij: 0,
      shifat: 0,
      mad: 0,
      nunMim: 0,
      waqaf: 0,
      lahnJali: 0
    });
    setCatatanUstadz("");
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-[#086288] flex flex-col font-sans selection:bg-[#97D7FF]/30 selection:text-[#086288]">
      {/* ========================================================= */}
      {/* APP TOPBAR / HEADER FOR ASATIDZ                           */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep("welcome")}
                className="w-9 h-9 rounded-lg bg-[#086288] flex items-center justify-center text-[#FFEFC4] shadow-xs hover:bg-[#064a67] transition-colors cursor-pointer"
                title="Beranda"
              >
                <BookOpen className="w-5 h-5 text-[#FFEFC4]" />
              </button>
              <div>
                <button
                  onClick={() => setCurrentStep("welcome")}
                  className="text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-[#086288] transition-colors tracking-tight block">
                    Raport Qur&apos;an Digital
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium block">
                    Pesantren Ilmu Al-Qur&apos;an
                  </span>
                </button>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Semester Ganjil 2026/2027</span>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-[#FFEFC4] text-[#086288] border-2 border-amber-300 font-bold text-xs sm:text-sm shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs px-2 py-1 rounded bg-[#086288]/10">
            OK
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col">
        {/* ======================================================= */}
        {/* STEP 1: HANYA MENAMPILKAN SELAMAT DATANG SAJA (NO CARD) */}
        {/* ======================================================= */}
        {currentStep === "welcome" && (
          <div className="my-auto max-w-3xl mx-auto w-full py-16 sm:py-24 text-center space-y-7 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#086288] tracking-tight leading-snug">
              Ahlan Wa Sahlan Guru <span className="whitespace-nowrap">Al-Qur&apos;an</span>
            </h1>

            <div className="flex justify-center">
              <button
                onClick={handleStartProcess}
                className="px-8 py-3 rounded-xl bg-[#086288] hover:bg-[#064a67] text-[#FFEFC4] text-base font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4 text-[#FFEFC4]" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 2: MEMILIH KATEGORI PROGRAM                        */}
        {/* ======================================================= */}
        {currentStep === "category" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section */}
            {/* Header section */}
            <div className="border-b border-zinc-200/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#086288] uppercase tracking-wider">
                <span>Tahap 1 dari 3</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#086288]" />
                Pilih Kategori Program
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tentukan program pembelajaran Al-Qur&apos;an yang akan disimak hari ini
              </p>
            </div>

            {/* Category Cards Grid (3 Columns: Murottal, Murojaah, Tafsir) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
              {categoriesData.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="group bg-white p-6 rounded-xl border border-zinc-200 hover:border-[#086288] hover:bg-[#f8fbfe] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#086288] transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-[#086288] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 3: MEMILIH KELAS SPESIFIK                          */}
        {/* ======================================================= */}
        {currentStep === "class" && selectedCategory && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="border-b border-zinc-200/80 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep("category")}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-[#086288] hover:bg-zinc-50 transition-colors cursor-pointer"
                  title="Kembali ke Kategori"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#086288]">
                  Program: {selectedCategory.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mt-1">
                Pilih Kelas / Halaqah
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pilih rombel untuk membuka lembar pendataan dan evaluasi kesalahan bacaan santri
              </p>
            </div>

            {/* List of classes in category */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => {
                const totalSantri = cls.santriList.length;
                const evaluatedCount = cls.santriList.filter((s) => s.status === "Selesai").length;
                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className="group bg-white p-6 rounded-2xl border border-zinc-200 hover:border-[#086288] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#086288] text-[#FFEFC4] flex items-center justify-center font-bold shadow-xs">
                          <GraduationCap className="w-5 h-5 text-[#FFEFC4]" />
                        </div>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#f0f7fb] text-[#086288] border border-[#4D8DBA]/25">
                          {totalSantri} Santri
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#086288] transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Wali: {cls.wali}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <School className="w-3.5 h-3.5 text-[#086288]" />
                          <span>{cls.ruangan}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Bookmark className="w-3.5 h-3.5 text-[#086288]" />
                          <span className="truncate">{cls.target}</span>
                        </div>
                      </div>

                      {/* Progress bar of evaluation */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-medium text-zinc-500 mb-1">
                          <span>Kemajuan Simakan</span>
                          <span className="text-[#086288] font-semibold">
                            {evaluatedCount} / {totalSantri} Santri
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#086288] h-full rounded-full transition-all"
                            style={{
                              width: `${totalSantri > 0 ? (evaluatedCount / totalSantri) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-medium">Daftar Santri ({totalSantri})</span>
                      <button className="px-3 py-1.5 rounded-lg bg-[#086288] hover:bg-[#064a67] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer">
                        <span>Pilih Kelas</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 4: TABEL UJIAN (Format Profesional & Institusional) */}
        {/* ======================================================= */}
        {currentStep === "exams" && selectedClass && (
          <div className="space-y-5 animate-fade-in">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <button onClick={() => setCurrentStep("category")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    Program {selectedCategory?.name}
                  </button>
                  <span>/</span>
                  <button onClick={() => setCurrentStep("class")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    {selectedClass.name}
                  </button>
                  <span>/</span>
                  <span className="text-zinc-800 font-medium">Jadwal Ujian</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {selectedClass.name}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pengampu: <span className="text-zinc-700 font-medium">{selectedClass.wali}</span> &bull; Ruang: <span className="text-zinc-700 font-medium">{selectedClass.ruangan}</span> &bull; Target: <span className="text-zinc-700 font-medium">{selectedClass.target}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setCurrentStep("class")}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Ganti Kelas</span>
                </button>
                <button
                  onClick={() => setIsAddUjianOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Tambah Tanggal Ujian</span>
                </button>
              </div>
            </div>

            {/* TABEL UJIAN CARD */}
            <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-zinc-50/50">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Daftar Sesi Ujian Tilawah</h2>
                  <p className="text-xs text-zinc-500">Pilih tanggal ujian dan klik tombol <strong>Masuk</strong> untuk membuka lembar daftar santri.</p>
                </div>
                <span className="text-xs text-zinc-500 bg-white px-2.5 py-1 rounded border border-zinc-200">
                  Total {(selectedClass.ujianList || []).length} Sesi
                </span>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3 text-center w-14">No</th>
                      <th className="px-5 py-3">Tanggal Ujian</th>
                      <th className="px-5 py-3 text-center w-44">Santri Selesai</th>
                      <th className="px-5 py-3 text-center w-44">Santri Belum</th>
                      <th className="px-5 py-3 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70">
                    {(selectedClass.ujianList || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                          <p className="font-medium text-zinc-600">Belum ada sesi ujian yang dibuat</p>
                          <p className="text-[11px] text-zinc-400 mt-1">Klik tombol &quot;Tambah Tanggal Ujian&quot; untuk membuat jadwal baru.</p>
                        </td>
                      </tr>
                    ) : (
                      (selectedClass.ujianList || []).map((ujian, index) => {
                        const selesai = ujian.santriList.filter((s) => s.status === "Selesai").length;
                        const belum = ujian.santriList.filter((s) => s.status !== "Selesai").length;
                        return (
                          <tr
                            key={ujian.id}
                            onClick={() => handleEnterExam(ujian.id)}
                            className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3.5 text-center font-mono text-zinc-400">
                              {index + 1}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-zinc-900 group-hover:text-[#086288] transition-colors">
                                {ujian.tanggalUjian}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                {ujian.namaUjian}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {selesai > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {selesai} Santri Selesai
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-xs">0 Santri Selesai</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {belum > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  {belum} Santri Belum
                                </span>
                              ) : (
                                <span className="text-emerald-700 text-xs font-medium">Semua Selesai</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEnterExam(ujian.id);
                                }}
                                className="px-3 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer ml-auto"
                              >
                                <span>Masuk</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Menampilkan {(selectedClass.ujianList || []).length} jadwal sesi ujian di {selectedClass.name}</span>
                <span className="text-zinc-400">Klik tombol Masuk pada baris tanggal ujian untuk membuka daftar santri</span>
              </div>
            </div>

            {/* Modal Tambah Jadwal Ujian */}
            {isAddUjianOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full border border-zinc-200 shadow-xl p-5 space-y-4 animate-scale-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">Tambah Tanggal Ujian</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{selectedClass.name}</p>
                    </div>
                    <button
                      onClick={() => setIsAddUjianOpen(false)}
                      className="w-7 h-7 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 text-base cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddUjianSession} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Tanggal Ujian
                      </label>
                      <input
                        type="text"
                        required
                        value={newTanggalUjian}
                        onChange={(e) => setNewTanggalUjian(e.target.value)}
                        placeholder="Contoh: 24 Oktober 2026"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Nama / Jenis Sesi Ujian
                      </label>
                      <input
                        type="text"
                        required
                        value={newNamaUjian}
                        onChange={(e) => setNewNamaUjian(e.target.value)}
                        placeholder="Contoh: Ujian Tasmi' Juz 30 / Ujian Tengah Semester"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                      />
                    </div>

                    <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600">
                      Sesi ini akan memuat {selectedClass.santriList.length} santri terdaftar di {selectedClass.name} dengan status Belum Diuji.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setIsAddUjianOpen(false)}
                        className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white font-medium shadow-2xs cursor-pointer"
                      >
                        Simpan Sesi Ujian
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 5: TABEL DAFTAR SANTRI PADA UJIAN TERPILIH        */}
        {/* ======================================================= */}
        {currentStep === "students" && selectedClass && selectedExam && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <button onClick={() => setCurrentStep("class")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    {selectedClass.name}
                  </button>
                  <span>/</span>
                  <button onClick={() => setCurrentStep("exams")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    Jadwal Ujian
                  </button>
                  <span>/</span>
                  <span className="text-zinc-800 font-medium">{selectedExam.tanggalUjian}</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {selectedExam.namaUjian} &bull; {selectedExam.tanggalUjian}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Kelas: <span className="text-zinc-700 font-medium">{selectedClass.name}</span> &bull; Penguji: <span className="text-zinc-700 font-medium">{selectedClass.wali}</span> &bull; Ruang: <span className="text-zinc-700 font-medium">{selectedClass.ruangan}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setCurrentStep("exams")}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Kembali ke Jadwal Ujian</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar (clean flat strip) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const total = selectedExam.santriList.length;
                const completed = selectedExam.santriList.filter((s) => s.status === "Selesai").length;
                const pending = total - completed;
                const ratedList = selectedExam.santriList.filter((s) => s.nilai !== null);
                const avg = ratedList.length > 0 ? (ratedList.reduce((acc, cur) => acc + (cur.nilai || 0), 0) / ratedList.length).toFixed(1) : "-";

                return (
                  <>
                    <div className="bg-white rounded-lg p-3.5 border border-zinc-200">
                      <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Total Santri</div>
                      <div className="text-xl font-bold text-zinc-900 mt-0.5">{total}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3.5 border border-zinc-200">
                      <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Sudah Diuji</div>
                      <div className="text-xl font-bold text-emerald-700 mt-0.5">{completed}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3.5 border border-zinc-200">
                      <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Belum Diuji</div>
                      <div className="text-xl font-bold text-amber-700 mt-0.5">{pending}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3.5 border border-zinc-200">
                      <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Rata-rata Nilai</div>
                      <div className="text-xl font-bold text-[#086288] mt-0.5">{avg}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Student Table Card (Format: no, nama, status, aksi) */}
            <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-hidden">
              {/* Table Toolbar */}
              <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Daftar Santri &amp; Penilaian Tilawah</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Klik tombol <strong>Uji</strong> untuk memulai pencatatan kesalahan bacaan santri.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchSantri}
                    onChange={(e) => setSearchSantri(e.target.value)}
                    placeholder="Cari nama atau NIS santri..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                  />
                  {searchSantri && (
                    <button
                      onClick={() => setSearchSantri("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Table with columns: no, nama, status, aksi */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3 text-center w-14">No</th>
                      <th className="px-5 py-3">Nama</th>
                      <th className="px-5 py-3 w-52">Status</th>
                      <th className="px-5 py-3 text-right w-56">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70">
                    {filteredSantri.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                          <p className="font-medium text-zinc-600">Tidak ada santri yang ditemukan</p>
                          <p className="text-[11px] text-zinc-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSantri.map((santri, index) => {
                        const isCompleted = santri.status === "Selesai";
                        return (
                          <tr
                            key={santri.id}
                            className="hover:bg-zinc-50 transition-colors"
                          >
                            <td className="px-4 py-3.5 text-center font-mono text-zinc-400">
                              {index + 1}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-zinc-900">
                                {santri.nama}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-zinc-400">NIS: {santri.nis}</span>
                                {santri.surahDibaca && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{santri.surahDibaca}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              {isCompleted ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Sudah Ujian
                                  </span>
                                  {santri.nilai !== null && (
                                    <div className="text-[11px] text-zinc-600">
                                      Nilai: <span className="font-bold text-zinc-900">{santri.nilai}</span> ({santri.predikat?.split(" ")[0]})
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                                  Belum Ujian
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {!isCompleted ? (
                                <button
                                  onClick={() => handleOpenEvaluation(santri)}
                                  className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <span>Uji</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setPrintingSantri(santri)}
                                    className="px-3 py-1.5 rounded-md border border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                    title="Cetak Raport Tilawah"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Cetak</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenEvaluation(santri)}
                                    className="px-3 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                    title="Uji Ulang Santri"
                                  >
                                    <RotateCcw className="w-3 h-3 text-[#FFEFC4]" />
                                    <span>Uji Ulang</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Menampilkan {filteredSantri.length} dari {selectedExam.santriList.length} santri</span>
                <span className="text-zinc-400">Gunakan tombol Uji untuk santri yang belum, atau Cetak dan Uji Ulang untuk yang sudah selesai</span>
              </div>
            </div>

            {/* Modal Cetak Raport Tilawah Santri */}
            {printingSantri && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-lg w-full border border-zinc-300 shadow-2xl p-6 space-y-4 animate-scale-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">Lembar Hasil Ujian Tilawah Santri</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Raport Qur&apos;an Digital &bull; {selectedExam.namaUjian}</p>
                    </div>
                    <button
                      onClick={() => setPrintingSantri(null)}
                      className="w-7 h-7 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 text-base cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Print Document Preview Body */}
                  <div className="border border-zinc-200 rounded p-4 bg-zinc-50/50 space-y-3 text-xs text-zinc-800 font-sans">
                    {/* Header Kop */}
                    <div className="text-center pb-2.5 border-b border-zinc-200">
                      <div className="font-bold text-sm tracking-wide text-[#086288] uppercase">Pesantren Ilmu Al-Qur&apos;an</div>
                      <div className="text-[11px] text-zinc-500">Lembaga Mutaba&apos;ah &amp; Penilaian Tilawah Qur&apos;ani</div>
                    </div>

                    {/* Metadata Table */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-400 block">Nama Santri:</span>
                        <span className="font-bold text-zinc-900">{printingSantri.nama}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">NIS:</span>
                        <span className="font-mono text-zinc-700">{printingSantri.nis}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Kelas:</span>
                        <span className="text-zinc-800">{selectedClass.name}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Tanggal Ujian:</span>
                        <span className="text-zinc-800">{selectedExam.tanggalUjian}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-400 block">Materi Ujian (Surah/Ayat):</span>
                        <span className="font-semibold text-zinc-800">{printingSantri.surahDibaca || "-"}</span>
                      </div>
                    </div>

                    {/* Result Box */}
                    <div className="p-3 bg-white rounded border border-zinc-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Skor Tilawah</div>
                        <div className="text-2xl font-extrabold text-[#086288]">{printingSantri.nilai !== null ? printingSantri.nilai : "-"} <span className="text-xs font-normal text-zinc-400">/ 100</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Predikat Kelulusan</div>
                        <div className="text-xs font-bold text-zinc-900 mt-1">{printingSantri.predikat || "-"}</div>
                      </div>
                    </div>

                    {/* Error breakdown */}
                    <div className="text-[11px] space-y-1">
                      <span className="text-zinc-500 font-semibold block">Catatan Bimbingan Ustadz:</span>
                      <div className="p-2.5 bg-white rounded border border-zinc-200 text-zinc-600">
                        {printingSantri.catatanGuru || "Bacaan tartil, makhraj dan tajwid konsisten."} (Total temuan kesalahan: {printingSantri.totalKesalahan})
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="pt-3 flex justify-between text-[11px] text-zinc-600">
                      <div>
                        <span>Wali Santri</span>
                        <div className="h-9"></div>
                        <span className="border-t border-zinc-400 pt-0.5 block w-24 text-center">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                      </div>
                      <div className="text-right">
                        <span>Penguji / Ustadz</span>
                        <div className="h-9"></div>
                        <span className="border-t border-zinc-400 pt-0.5 block w-28 text-center font-semibold">{selectedClass.wali}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setPrintingSantri(null)}
                      className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-medium cursor-pointer"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Raport</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 6: PENCATATAN KESALAHAN BACAAN SANTRI             */}
        {/* ======================================================= */}
        {currentStep === "evaluation" && selectedClass && selectedExam && activeSantri && (
          <div className="space-y-5 animate-fade-in">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <button onClick={() => setCurrentStep("exams")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    Jadwal Ujian
                  </button>
                  <span>/</span>
                  <button onClick={() => setCurrentStep("students")} className="hover:text-[#086288] transition-colors cursor-pointer">
                    Daftar Santri ({selectedExam.tanggalUjian})
                  </button>
                  <span>/</span>
                  <span className="text-zinc-800 font-medium">Penilaian: {activeSantri.nama}</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  Penilaian Tilawah: {activeSantri.nama}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  NIS: <span className="font-mono text-zinc-700">{activeSantri.nis}</span> &bull; Kelas: {selectedClass.name} &bull; Sesi: {selectedExam.namaUjian}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setCurrentStep("students")}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Kembali ke Daftar Santri</span>
                </button>
              </div>
            </div>

            {/* Score Strip */}
            <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#086288] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {activeSantri.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">{activeSantri.nama}</h2>
                  <p className="text-xs text-zinc-500">Lembar Penilaian &amp; Pencatatan Tajwid Santri</p>
                </div>
              </div>

              {/* Scorecard */}
              <div className="flex items-center gap-4 divide-x divide-zinc-200 self-start sm:self-auto">
                <div className="text-left pr-3">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Total Temuan</div>
                  <div className="text-lg font-bold text-zinc-900 mt-0.5">{totalErrors} <span className="text-xs font-normal text-zinc-500">kesalahan</span></div>
                </div>
                <div className="text-left px-3">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Skor Terhitung</div>
                  <div className="text-xl font-bold text-[#086288] mt-0.5">{calculatedScore} <span className="text-xs font-normal text-zinc-400">/ 100</span></div>
                </div>
                <div className="text-left pl-3">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Predikat</div>
                  <div className="text-xs font-bold text-zinc-900 mt-1">{getPredikat(calculatedScore)}</div>
                </div>
              </div>
            </div>

            {/* Assessment Session Form */}
            <div className="bg-white rounded-lg p-5 border border-zinc-200 shadow-2xs space-y-5">
              {/* Surah & Sesi Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pb-5 border-b border-zinc-200">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Surah &amp; Ayat yang Disimak
                  </label>
                  <input
                    type="text"
                    value={surahAyat}
                    onChange={(e) => setSurahAyat(e.target.value)}
                    placeholder="Contoh: Surah Al-Buruj: 1-22"
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Kategori Sesi Ujian
                  </label>
                  <select
                    value={tipeSesi}
                    onChange={(e) => setTipeSesi(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white text-zinc-800"
                  >
                    <option>Tasmi&apos; Ujian Resmi</option>
                    <option>Talaqqi Setoran Harian</option>
                    <option>Ujian Tengah Semester (UTS)</option>
                    <option>Ujian Akhir Semester (UAS)</option>
                    <option>Murojaah Mandiri Terbimbing</option>
                  </select>
                </div>
              </div>

              {/* Error Logging Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Parameter Penilaian Tajwid
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Gunakan tombol hitung (+) saat menemukan kesalahan tilawah. Skor terhitung otomatis.
                  </p>
                </div>

                {totalErrors > 0 && (
                  <button
                    onClick={handleResetCounters}
                    className="text-xs text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Temuan</span>
                  </button>
                )}
              </div>

              {/* 6 Tajwid Error Counters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Makhorijul Huruf */}
                <div className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">1. Makhorijul Huruf</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Makhraj tertukar / kurang tepat</p>
                      </div>
                      <div className="flex items-center border border-zinc-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleAdjustError("makhorij", -1)}
                          disabled={errorCounters.makhorij === 0}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
                          {errorCounters.makhorij}
                        </span>
                        <button
                          onClick={() => handleAdjustError("makhorij", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
                    {["+ع vs ء", "+ح vs هـ", "+ص vs س", "+ط vs ت", "+ض vs د", "+ذ vs ز"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Shifatul Huruf */}
                <div className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">2. Shifatul Huruf</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Hams, qalqalah, tafkhim/tarqiq</p>
                      </div>
                      <div className="flex items-center border border-zinc-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleAdjustError("shifat", -1)}
                          disabled={errorCounters.shifat === 0}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
                          {errorCounters.shifat}
                        </span>
                        <button
                          onClick={() => handleAdjustError("shifat", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
                    {["+Hams kurang", "+Qalqalah mati", "+Isti'la tipis", "+Tafkhim kurang"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Ahkamul Mad wal Qashr */}
                <div className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">3. Ahkamul Mad wal Qashr</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Kadar harakat mad kurang/lebih</p>
                      </div>
                      <div className="flex items-center border border-zinc-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleAdjustError("mad", -1)}
                          disabled={errorCounters.mad === 0}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
                          {errorCounters.mad}
                        </span>
                        <button
                          onClick={() => handleAdjustError("mad", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
                    {["+Mad Thobi'i < 2h", "+Mad Wajib < 4h", "+Mad Jaiz timpang", "+Mad 'Aridh berlebih"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Nun & Mim Mati / Ghunnah */}
                <div className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">4. Nun &amp; Mim Mati / Ghunnah</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Ikhfa, Idgham, Iqlab, Idzhar</p>
                      </div>
                      <div className="flex items-center border border-zinc-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleAdjustError("nunMim", -1)}
                          disabled={errorCounters.nunMim === 0}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
                          {errorCounters.nunMim}
                        </span>
                        <button
                          onClick={() => handleAdjustError("nunMim", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
                    {["+Ikhfa tidak dengung", "+Idgham lepas", "+Iqlab kurang mim", "+Idzhar mantul"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Waqaf & Ibtida' */}
                <div className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">5. Waqaf &amp; Ibtida&apos;</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Salah waqaf, nafas putus, lupa ayat</p>
                      </div>
                      <div className="flex items-center border border-zinc-300 rounded overflow-hidden">
                        <button
                          onClick={() => handleAdjustError("waqaf", -1)}
                          disabled={errorCounters.waqaf === 0}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
                          {errorCounters.waqaf}
                        </span>
                        <button
                          onClick={() => handleAdjustError("waqaf", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex flex-wrap gap-1">
                    {["+Waqaf potong makna", "+Ibtida keliru", "+Tawaqquf/Lupa"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Lahn Jali */}
                <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 hover:border-rose-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-rose-900">6. Lahn Jali</h4>
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-rose-100 text-rose-700">Fatal</span>
                        </div>
                        <p className="text-[11px] text-rose-700/80 mt-0.5">Salah baris harakat, huruf tertukar</p>
                      </div>
                      <div className="flex items-center border border-rose-300 rounded overflow-hidden bg-white">
                        <button
                          onClick={() => handleAdjustError("lahnJali", -1)}
                          disabled={errorCounters.lahnJali === 0}
                          className="w-7 h-7 flex items-center justify-center text-rose-700 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-rose-700 tabular-nums">
                          {errorCounters.lahnJali}
                        </span>
                        <button
                          onClick={() => handleAdjustError("lahnJali", 1)}
                          className="w-7 h-7 flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-rose-100 flex flex-wrap gap-1">
                    {["+Salah harakat", "+Huruf tertukar", "+Ayat terlewat"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddQuickTag(tag)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes / Catatan Ustadz */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Catatan Pembinaan Tilawah
                </label>
                <textarea
                  rows={2}
                  value={catatanUstadz}
                  onChange={(e) => setCatatanUstadz(e.target.value)}
                  placeholder="Tambahkan catatan khusus evaluasi bacaan atau target perbaikan..."
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all text-zinc-800 bg-white"
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  onClick={() => setCurrentStep("students")}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Batal / Kembali ke Tabel
                </button>

                <button
                  onClick={handleSaveEvaluation}
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#FFEFC4]" />
                  <span>Simpan Evaluasi Santri</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="mt-auto bg-white border-t border-zinc-200/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p className="font-medium text-zinc-600">
            &copy; 2026 <span className="font-semibold text-[#086288]">Raport Qur&apos;an Digital</span> • Muharrik Pesantren Ilmu Al-Qur&apos;an
          </p>
          <p className="text-zinc-400">
            Sistem Pencatatan &amp; Mutaba&apos;ah Tilawah Santri
          </p>
        </div>
      </footer>
    </div>
  );
}
