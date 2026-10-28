// ==========================================
// DATA DEFINITIONS & INITIAL DUMMY RECORDS
// ==========================================

export type StepType =
  | "welcome"
  | "category"
  | "class"
  | "exams"
  | "students"
  | "evaluation";

export interface ErrorCounters {
  makhorij: number;
  makhorijHuruf?: string[];
  shifat: number;
  ahkamulHuruf?: number;
  mad: number;
  waqaf: number;
  muroatulHuruf?: number;
  miring?: number;
  tawallud?: number;
  kelancaran?: number;
  nunMim?: number;
  lahnJali?: number;
}

export interface Category {
  id: string;
  name: string;
  arabic: string;
  description: string;
  totalClasses: number;
  totalStudents: number;
  focus: string;
}

export interface SantriRecord {
  id: string;
  nis: string;
  nama: string;
  jenjang?: string;
  status: "Belum Setor" | "Sedang Menyimak" | "Selesai";
  surahDibaca: string;
  totalKesalahan: number;
  nilai: number | null;
  predikat: string | null;
  catatanGuru?: string;
  errors: ErrorCounters;
}

export interface UjianSession {
  id: string;
  namaUjian: string;
  tanggalUjian: string;
  santriList: SantriRecord[];
}

export interface ClassItem {
  id: string;
  categoryId: string;
  name: string;
  wali: string;
  waliList?: string[];
  ruangan: string;
  target: string;
  materiTerakhir?: string;
  santriList: SantriRecord[];
  ujianList?: UjianSession[];
}

export const EMPTY_ERROR_COUNTERS: ErrorCounters = {
  makhorij: 0,
  makhorijHuruf: [],
  shifat: 0,
  ahkamulHuruf: 0,
  mad: 0,
  waqaf: 0,
  muroatulHuruf: 0,
  miring: 0,
  tawallud: 0,
  kelancaran: 0,
  nunMim: 0,
  lahnJali: 0
};

export const getPredikat = (score: number): string => {
  if (score >= 100) return "Mumtaz (Sempurna)";
  if (score >= 91) return "Jayyid Jiddan (Baik Sekali)";
  if (score >= 81) return "Jayyid (Baik)";
  if (score === 80) return "Maqbul (Cukup)";
  return "Rosib (Kurang)";
};

export const createDefaultUjianList = (
  clsId: string,
  baseSantri: SantriRecord[]
): UjianSession[] => [
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

export const categoriesData: Category[] = [
  {
    id: "murottal",
    name: "Murottal",
    arabic: "الترتيل والتلاوة",
    description:
      "Bimbingan bacaan Al-Qur'an santri dengan tartil, fasih, serta ketepatan makhorijul huruf dan kaidah tajwid dasar hingga lanjutan.",
    totalClasses: 3,
    totalStudents: 10,
    focus: "Tartil & Tajwid"
  },
  {
    id: "murojaah",
    name: "Murojaah",
    arabic: "المراجعة والتسميع",
    description:
      "Pengulangan juz lama, tasmi' bil ghoib sekali duduk (1 s.d 5 juz), serta pengujian daya rekat dan kelancaran ingatan santri.",
    totalClasses: 2,
    totalStudents: 6,
    focus: "Daya Rekat & Kelancaran"
  },
  {
    id: "tafsir",
    name: "Tafsir",
    arabic: "التفسير وتدبر القرآن",
    description:
      "Pemahaman makna ayat, asbabun nuzul, kaidah waqaf ibtida' berdasar makna, serta pembinaan adab hamalatul Qur'an.",
    totalClasses: 2,
    totalStudents: 4,
    focus: "Waqaf, Ibtida' & Makna"
  }
];

export const initialClassesData: ClassItem[] = [
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
        catatanGuru:
          "Makhraj Ain sudah sangat membaik, perhatikan desis huruf Shad di ayat 5.",
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
        catatanGuru:
          "Maa Syaa Allah bacaan sangat tartil, makhraj fasih dan konsisten.",
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
        catatanGuru:
          "Setoran tartil lancar. Sedikit diperbaiki mad wajib di ayat 16.",
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

