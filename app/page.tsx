"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";
import {
  StepType,
  ErrorCounters,
  SantriRecord,
  UjianSession,
  ClassItem,
  EMPTY_ERROR_COUNTERS,
  getPredikat,
  categoriesData
} from "./components/evaluationData";
import { StudentsStepView, EvaluationFormView } from "./components/EvaluationViews";

interface SavedEvaluationItem {
  classId: string;
  examId: string;
  namaUjian?: string;
  tanggalUjian?: string;
  santriId: string;
  status?: "Belum Setor" | "Sedang Menyimak" | "Selesai";
  surahDibaca?: string;
  totalKesalahan?: number;
  nilai?: number | null;
  predikat?: string | null;
  catatanGuru?: string;
  errors?: ErrorCounters;
}

interface DbKelasItem {
  id: string;
  kode?: string;
  nama: string;
  program?: string;
  wali?: string;
  waliList?: string[];
  ruangan?: string;
  materiTerakhir?: string;
  ujianSessions?: { id: string; namaUjian: string; tanggalUjian: string }[];
  status?: string;
}

const toSlug = (str: string) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const getClassSlug = (clsList: ClassItem[], cls: ClassItem) => {
  const base = toSlug(cls.name);
  const duplicates = clsList.filter(
    (c) => c.categoryId === cls.categoryId && toSlug(c.name) === base
  );
  return duplicates.length > 1 ? `${base}-${toSlug(cls.id)}` : base;
};

const getExamSlug = (ujianList: UjianSession[], ujian: UjianSession) => {
  const base = toSlug(ujian.namaUjian);
  const duplicates = ujianList.filter((u) => toSlug(u.namaUjian) === base);
  if (duplicates.length > 1) {
    const shortSuffix = ujian.id.split("-").pop() || ujian.id;
    return `${base}-${toSlug(shortSuffix)}`;
  }
  return base;
};

const getSantriSlug = (santriList: SantriRecord[], santri: SantriRecord) => {
  const base = toSlug(santri.nama);
  const duplicates = santriList.filter((s) => toSlug(s.nama) === base);
  if (duplicates.length > 1) {
    const suffix =
      santri.nis && santri.nis !== "-" ? santri.nis : santri.id.slice(-4);
    return `${base}-${toSlug(suffix)}`;
  }
  return base;
};

const formatTanggalIndo = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
  return dateStr;
};

const toInputDateFormat = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const months: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
    juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", agu: "08", sep: "09", okt: "10", oct: "10", nov: "11", des: "12", dec: "12"
  };

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, "0");
    const monthName = parts[1].toLowerCase();
    const month = months[monthName] || "01";
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return "";
};

const getInitialStepFromPath = (path: string): StepType => {
  if (!path || path === "/" || !path.startsWith("/program")) return "welcome";
  const segs = path.replace(/^\/program\/?/, "").split("/").filter(Boolean);
  if (segs.length === 0) return "category";
  if (segs.length === 1) return "class";
  if (segs.length === 2) return "exams";
  if (segs.length === 3) return "students";
  return "evaluation";
};

interface DbSantriItem {
  id: string;
  nis?: string;
  nama: string;
  jenjang?: string;
  kelas?: string;
}

export default function HomeGuruEvaluationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const loadedEvalKeyRef = useRef<string | null>(null);

  // Navigation Steps:
  // "welcome" -> /
  // "category" -> /program
  // "class" -> /program/[kategori]
  // "exams" -> /program/[kategori]/[kelas]
  // "students" -> /program/[kategori]/[kelas]/[ujian]
  // "evaluation" -> /program/[kategori]/[kelas]/[ujian]/[santri]
  const [currentStep, setCurrentStep] = useState<StepType>(() =>
    getInitialStepFromPath(pathname)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [searchSantri, setSearchSantri] = useState("");
  const [printingSantri, setPrintingSantri] = useState<SantriRecord | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [showClassSkeleton, setShowClassSkeleton] = useState(false);

  // Modal Tambah Jadwal Ujian
  const [isAddUjianOpen, setIsAddUjianOpen] = useState(false);
  const [newTanggalUjian, setNewTanggalUjian] = useState("");
  const [newNamaUjian, setNewNamaUjian] = useState("");

  // Modal Edit Jadwal Ujian
  const [isEditUjianOpen, setIsEditUjianOpen] = useState(false);
  const [editUjianId, setEditUjianId] = useState("");
  const [editNamaUjian, setEditNamaUjian] = useState("");
  const [editTanggalUjian, setEditTanggalUjian] = useState("");
  const [isSavingEditUjian, setIsSavingEditUjian] = useState(false);

  // Modal Konfirmasi Hapus Jadwal Ujian
  const [isDeleteUjianOpen, setIsDeleteUjianOpen] = useState(false);
  const [deleteUjianSession, setDeleteUjianSession] = useState<UjianSession | null>(null);
  const [isDeletingUjian, setIsDeletingUjian] = useState(false);

  // Class & Student Data State synced from MongoDB
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [activeSantriId, setActiveSantriId] = useState<string | null>(null);

  // Active Evaluation Form State (for the chosen student)
  const [surahAyat, setSurahAyat] = useState("");
  const [tipeSesi, setTipeSesi] = useState("Tasmi' Ujian Resmi");
  const [catatanUstadz, setCatatanUstadz] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [kepalaMadrasah, setKepalaMadrasah] = useState<string>("A. Arisy Habibullah");
  const [semesterLabel, setSemesterLabel] = useState<string>("Ganjil 2026-2027");
  const [classMateriInput, setClassMateriInput] = useState<string>("");
  const [isSavingClassMateri, setIsSavingClassMateri] = useState<boolean>(false);
  const [mobileExamStepTab, setMobileExamStepTab] = useState<"santri" | "ujian">("santri");

  // Hanya tampilkan skeleton jika pemuatan data memang membutuhkan waktu (debounce 200ms)
  // Jika respons cepat, langsung tampilkan konten tanpa ada kedipan/flash skeleton
  useEffect(() => {
    if (isLoadingClasses) {
      const timer = setTimeout(() => {
        setShowClassSkeleton(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setShowClassSkeleton(false);
    }
  }, [isLoadingClasses]);

  // Sync Kelas, Santri, Ujian evaluations, and Settings from MongoDB
  useEffect(() => {
    async function loadDatabaseRecords() {
      try {
        setIsLoadingClasses(true);
        const [resKelas, resSantri, resUjian, resSettings] = await Promise.all([
          fetch("/api/kelas", { cache: "no-store" }),
          fetch("/api/santri", { cache: "no-store" }),
          fetch("/api/ujian", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" })
        ]);

        const [jsonKelas, jsonSantri, jsonUjian, jsonSettings] = await Promise.all([
          resKelas.json(),
          resSantri.json(),
          resUjian.json(),
          resSettings.json()
        ]);

        if (jsonSettings?.success && jsonSettings?.data) {
          if (jsonSettings.data.lembaga?.mudir) {
            setKepalaMadrasah(jsonSettings.data.lembaga.mudir);
          }
          if (jsonSettings.data.akademik) {
            const sem = jsonSettings.data.akademik.semester || "Ganjil";
            const ta = (jsonSettings.data.akademik.tahunAjaran || "2026/2027").replace("/", "-");
            setSemesterLabel(`${sem} ${ta}`);
          }
        }

        const dbKelasList: DbKelasItem[] =
          jsonKelas.success && Array.isArray(jsonKelas.data) ? jsonKelas.data : [];
        const dbSantriList: DbSantriItem[] =
          jsonSantri.success && Array.isArray(jsonSantri.data) ? jsonSantri.data : [];
        const dbUjianList: SavedEvaluationItem[] =
          jsonUjian.success && Array.isArray(jsonUjian.data) ? jsonUjian.data : [];

        const evalMap = new Map<string, SavedEvaluationItem>();
        dbUjianList.forEach((item) => {
          evalMap.set(`${item.classId}_${item.examId}_${item.santriId}`, item);
        });

        const normalizeClassName = (str: string) =>
          (str || "")
            .toLowerCase()
            .replace(/\b(kelas|halaqah|rombel)\b/g, "")
            .replace(/[^a-z0-9]/g, "");

        const mappedClasses: ClassItem[] = dbKelasList.map((k) => {
          const rawProg = (k.program || "").toLowerCase();
          const lowerNama = (k.nama || "").toLowerCase();
          const categoryId =
            rawProg === "murojaah" || lowerNama.includes("murojaah")
              ? "murojaah"
              : rawProg === "tafsir" || lowerNama.includes("tafsir")
              ? "tafsir"
              : "murottal";

          const normKelasNama = normalizeClassName(k.nama);
          const normKelasKode = k.kode ? normalizeClassName(k.kode) : "";
          const classMateri = k.materiTerakhir || "";

          // Cari santri dari database yang terdaftar di kelas ini
          const matchedSantri: SantriRecord[] = dbSantriList
            .filter((s) => {
              if (!s.kelas || s.kelas.trim() === "-" || s.kelas.trim() === "") return false;
              if (s.kelas.trim().toLowerCase() === k.nama.trim().toLowerCase()) return true;
              const normSantriKelas = normalizeClassName(s.kelas);
              if (!normSantriKelas) return false;
              if (normSantriKelas === normKelasNama) return true;
              if (normKelasKode && normSantriKelas === normKelasKode) return true;
              return false;
            })
            .map((s) => ({
              id: String(s.id),
              nis: s.nis || "-",
              nama: s.nama,
              jenjang: s.jenjang ? s.jenjang.replace(/^Kelas\s*/i, "").trim() : "1",
              status: "Belum Setor" as const,
              surahDibaca: classMateri,
              totalKesalahan: 0,
              nilai: null,
              predikat: null,
              catatanGuru: "",
              errors: { ...EMPTY_ERROR_COUNTERS }
            }));

          const rawWaliList =
            Array.isArray(k.waliList) && k.waliList.length > 0
              ? k.waliList.filter(Boolean)
              : k.wali && k.wali !== "-"
              ? k.wali
                  .split(/\s*[|•]\s*/)
                  .map((w) => w.trim())
                  .filter(Boolean)
              : [];

          const parsedWaliList = rawWaliList.map((w) =>
            w.toLowerCase().includes("arif") ? "Ust Rendra Maulana Akbar" : w
          );

          const waliDisplay =
            parsedWaliList.length > 0 ? parsedWaliList.join(", ") : k.wali || "-";

          // Ambil sesi jadwal ujian: utamakan dari ujianSessions yang tersimpan di MongoDB
          let defaultSessions: UjianSession[] = [];
          if (Array.isArray(k.ujianSessions) && k.ujianSessions.length > 0) {
            defaultSessions = k.ujianSessions.map((sess: any) => ({
              id: sess.id,
              namaUjian: sess.namaUjian || "Ujian Tilawah",
              tanggalUjian: sess.tanggalUjian || "-",
              santriList: matchedSantri.map((s) => ({ ...s }))
            }));
          } else if (!Array.isArray(k.ujianSessions)) {
            // Sesi awal hanya jika kelas belum pernah memiliki konfigurasi sesi ujian sama sekali
            defaultSessions = [
              {
                id: `${k.id}-u1`,
                namaUjian: "Tasmi' Ujian Utama",
                tanggalUjian: "17 Oktober 2026",
                santriList: matchedSantri.map((s) => ({ ...s }))
              }
            ];

            // Tambahkan sesi ujian tambahan yang pernah disimpan di MongoDB ujian untuk kelas ini
            const savedExamsForClass = dbUjianList.filter((u) => u.classId === k.id);
            const extraExamIds = Array.from(new Set(savedExamsForClass.map((u) => u.examId))).filter(
              (examId) => !defaultSessions.some((ds) => ds.id === examId)
            );

            extraExamIds.forEach((examId) => {
              const sample = savedExamsForClass.find((u) => u.examId === examId);
              defaultSessions.unshift({
                id: examId,
                namaUjian: sample?.namaUjian || "Ujian Tilawah",
                tanggalUjian: sample?.tanggalUjian || "-",
                santriList: matchedSantri.map((s) => ({ ...s }))
              });
            });
          }

          // Sinkronkan nilai santri yang sudah diuji dari MongoDB
          const syncedUjianList = defaultSessions.map((u) => ({
            ...u,
            santriList: u.santriList.map((s) => {
              const saved = evalMap.get(`${k.id}_${u.id}_${s.id}`);
              if (saved) {
                return {
                  ...s,
                  status: saved.status || s.status,
                  surahDibaca: classMateri || saved.surahDibaca || s.surahDibaca,
                  totalKesalahan: saved.totalKesalahan ?? s.totalKesalahan,
                  nilai: saved.nilai ?? s.nilai,
                  predikat: saved.predikat ?? s.predikat,
                  catatanGuru: saved.catatanGuru ?? s.catatanGuru,
                  errors: saved.errors || s.errors
                };
              }
              return {
                ...s,
                surahDibaca: classMateri || s.surahDibaca
              };
            })
          }));

          return {
            id: String(k.id),
            categoryId,
            name: k.nama,
            wali: waliDisplay,
            waliList: parsedWaliList,
            ruangan: k.ruangan || "-",
            target: k.program || "Murottal",
            materiTerakhir: classMateri,
            santriList: matchedSantri,
            ujianList: syncedUjianList
          };
        });

        setClassesList(mappedClasses);
      } catch (err) {
        console.warn("Gagal memuat data kelas dari database:", err);
        setClassesList([]);
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadDatabaseRecords();
  }, []);

  // Live Error Tracking Counters
  const [errorCounters, setErrorCounters] = useState<ErrorCounters>(EMPTY_ERROR_COUNTERS);

  // Sync URL pathname (/program/[kategori]/[kelas]/[ujian]/[santri]) with active state
  useEffect(() => {
    if (!pathname || pathname === "/" || !pathname.startsWith("/program")) {
      loadedEvalKeyRef.current = null;
      setCurrentStep("welcome");
      return;
    }

    const segments = pathname
      .replace(/^\/program\/?/, "")
      .split("/")
      .filter(Boolean)
      .map((s) => decodeURIComponent(s).toLowerCase());

    if (segments.length === 0) {
      loadedEvalKeyRef.current = null;
      setSelectedCategoryId(null);
      setSelectedClassId(null);
      setSelectedExamId(null);
      setCurrentStep("category");
      return;
    }

    const [catSeg, classSeg, examSeg, santriSeg] = segments;
    const matchedCat = categoriesData.find(
      (c) => c.id.toLowerCase() === catSeg || toSlug(c.name) === catSeg
    );
    const resolvedCatId = matchedCat ? matchedCat.id : catSeg;
    setSelectedCategoryId(resolvedCatId);

    if (segments.length === 1) {
      loadedEvalKeyRef.current = null;
      setSelectedClassId(null);
      setSelectedExamId(null);
      setCurrentStep("class");
      return;
    }

    const matchedClass =
      classesList.find(
        (c) =>
          c.categoryId === resolvedCatId &&
          (getClassSlug(classesList, c) === classSeg ||
            toSlug(c.name) === classSeg ||
            c.id.toLowerCase() === classSeg)
      ) ||
      classesList.find(
        (c) =>
          getClassSlug(classesList, c) === classSeg ||
          toSlug(c.name) === classSeg ||
          c.id.toLowerCase() === classSeg
      );

    if (matchedClass) {
      setSelectedClassId((prevId) => {
        if (prevId !== matchedClass.id) {
          setClassMateriInput(matchedClass.materiTerakhir || "");
        }
        return matchedClass.id;
      });
    }

    if (segments.length === 2) {
      loadedEvalKeyRef.current = null;
      setSelectedExamId(null);
      if (matchedClass) {
        setClassMateriInput(matchedClass.materiTerakhir || "");
      }
      setCurrentStep("exams");
      return;
    }

    const classExams = matchedClass?.ujianList || [];
    const matchedExam =
      classExams.find(
        (u) =>
          getExamSlug(classExams, u) === examSeg ||
          toSlug(u.namaUjian) === examSeg ||
          u.id.toLowerCase() === examSeg
      ) || classExams[0];

    if (matchedExam) {
      setSelectedExamId(matchedExam.id);
    }

    if (segments.length === 3) {
      loadedEvalKeyRef.current = null;
      setCurrentStep("students");
      return;
    }

    if (matchedClass && matchedExam) {
      const examSantri = matchedExam.santriList || [];
      const matchedSantri =
        examSantri.find(
          (st) =>
            getSantriSlug(examSantri, st) === santriSeg ||
            toSlug(st.nama) === santriSeg ||
            st.id.toLowerCase() === santriSeg
        ) || examSantri[0];

      if (matchedSantri) {
        const evalKey = `${matchedClass.id}_${matchedExam.id}_${matchedSantri.id}`;
        setActiveSantriId(matchedSantri.id);
        if (loadedEvalKeyRef.current !== evalKey) {
          loadedEvalKeyRef.current = evalKey;
          const rawErrors = matchedSantri.errors || EMPTY_ERROR_COUNTERS;
          setSurahAyat(matchedClass.materiTerakhir || matchedSantri.surahDibaca || "");
          setErrorCounters({
            ...EMPTY_ERROR_COUNTERS,
            ...rawErrors,
            ahkamulHuruf: rawErrors.ahkamulHuruf ?? rawErrors.nunMim ?? 0,
            muroatulHuruf: rawErrors.muroatulHuruf ?? rawErrors.lahnJali ?? 0,
            nunMim: 0,
            lahnJali: 0
          });
          setCatatanUstadz(matchedSantri.catatanGuru || "");
        }
      }
    }
    setCurrentStep("evaluation");
  }, [pathname, classesList]);

  // Current selected objects
  const selectedCategory = categoriesData.find((c) => c.id === selectedCategoryId);
  const selectedClass = classesList.find((c) => c.id === selectedClassId);
  const availableClasses = classesList.filter((c) => c.categoryId === selectedCategoryId);
  const selectedExam =
    selectedClass?.ujianList?.find((u) => u.id === selectedExamId) ||
    selectedClass?.ujianList?.[0];
  const activeSantri =
    selectedExam?.santriList.find((s) => s.id === activeSantriId) ||
    selectedExam?.santriList[0];

  // Filtered santri list for search in current exam
  const filteredSantri = (selectedExam?.santriList || []).filter((s) => {
    if (!searchSantri.trim()) return true;
    const q = searchSantri.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
  });

  // Helper to navigate back/between steps while updating browser URL route
  const handleNavigateStep = (step: StepType) => {
    if (step === "welcome") {
      router.push("/");
      return;
    }
    if (step === "category") {
      router.push("/program");
      return;
    }
    const catSlug = selectedCategoryId || selectedClass?.categoryId || "murottal";
    if (step === "class") {
      router.push(`/program/${catSlug}`);
      return;
    }
    if (step === "exams" && selectedClass) {
      const clsSlug = getClassSlug(classesList, selectedClass);
      router.push(`/program/${selectedClass.categoryId}/${clsSlug}`);
      return;
    }
    if (step === "students" && selectedClass && selectedExam) {
      const clsSlug = getClassSlug(classesList, selectedClass);
      const exSlug = getExamSlug(selectedClass.ujianList || [], selectedExam);
      router.push(`/program/${selectedClass.categoryId}/${clsSlug}/${exSlug}`);
      return;
    }
    setCurrentStep(step);
  };

  // Step transitions
  const handleStartProcess = () => {
    setSelectedCategoryId(null);
    setSelectedClassId(null);
    setSelectedExamId(null);
    setCurrentStep("category");
    router.push("/program");
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentStep("class");
    router.push(`/program/${catId}`);
  };

  const handleSelectClass = (clsId: string) => {
    const found = classesList.find((c) => c.id === clsId);
    setSelectedClassId(clsId);
    setClassMateriInput(found?.materiTerakhir || "");
    setSelectedExamId(null);
    setSearchSantri("");
    setCurrentStep("exams");
    if (found) {
      const catSlug = selectedCategoryId || found.categoryId;
      const clsSlug = getClassSlug(classesList, found);
      router.push(`/program/${catSlug}/${clsSlug}`);
    }
  };

  const handleSaveClassMateri = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedClass) return;

    const trimmedMateri = classMateriInput.trim();
    setIsSavingClassMateri(true);

    setClassesList((prev) =>
      prev.map((cls) => {
        if (cls.id !== selectedClass.id) return cls;
        return {
          ...cls,
          materiTerakhir: trimmedMateri,
          santriList: cls.santriList.map((s) => ({
            ...s,
            surahDibaca: trimmedMateri
          })),
          ujianList: (cls.ujianList || []).map((u) => ({
            ...u,
            santriList: u.santriList.map((s) => ({
              ...s,
              surahDibaca: trimmedMateri
            }))
          }))
        };
      })
    );

    try {
      await fetch("/api/kelas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClass.id,
          nama: selectedClass.name,
          materiTerakhir: trimmedMateri
        })
      });
      setToastMessage(
        `Materi terakhir kelas ${selectedClass.name} disimpan sebagai patokan: "${trimmedMateri || "-"}"`
      );
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn("Gagal menyimpan materi terakhir kelas:", err);
    } finally {
      setIsSavingClassMateri(false);
    }
  };

  const handleEnterExam = (examId: string) => {
    setSelectedExamId(examId);
    setSearchSantri("");
    setCurrentStep("students");
    if (selectedClass) {
      const targetExam = (selectedClass.ujianList || []).find((u) => u.id === examId);
      const clsSlug = getClassSlug(classesList, selectedClass);
      const exSlug = targetExam
        ? getExamSlug(selectedClass.ujianList || [], targetExam)
        : toSlug(examId);
      router.push(`/program/${selectedClass.categoryId}/${clsSlug}/${exSlug}`);
    }
  };

  const handleOpenEvaluation = (santri: SantriRecord) => {
    const rawErrors = santri.errors || EMPTY_ERROR_COUNTERS;
    setActiveSantriId(santri.id);
    setSurahAyat(selectedClass?.materiTerakhir || santri.surahDibaca || "");
    setErrorCounters({
      ...EMPTY_ERROR_COUNTERS,
      ...rawErrors,
      ahkamulHuruf: rawErrors.ahkamulHuruf ?? rawErrors.nunMim ?? 0,
      muroatulHuruf: rawErrors.muroatulHuruf ?? rawErrors.lahnJali ?? 0,
      nunMim: 0,
      lahnJali: 0
    });
    setCatatanUstadz(santri.catatanGuru || "");
    if (selectedClass && selectedExam) {
      loadedEvalKeyRef.current = `${selectedClass.id}_${selectedExam.id}_${santri.id}`;
      const clsSlug = getClassSlug(classesList, selectedClass);
      const exSlug = getExamSlug(selectedClass.ujianList || [], selectedExam);
      const stSlug = getSantriSlug(selectedExam.santriList || [], santri);
      setCurrentStep("evaluation");
      router.push(
        `/program/${selectedClass.categoryId}/${clsSlug}/${exSlug}/${stSlug}`
      );
    } else {
      setCurrentStep("evaluation");
    }
  };

  const handleAddUjianSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newTanggalUjian.trim() || !newNamaUjian.trim()) return;

    const formattedTanggal = formatTanggalIndo(newTanggalUjian.trim());
    const nextIndex = (selectedClass.ujianList?.length || 0) + 1;
    const newSession: UjianSession = {
      id: `${selectedClass.id}-u${nextIndex}`,
      namaUjian: newNamaUjian.trim(),
      tanggalUjian: formattedTanggal,
      santriList: selectedClass.santriList.map((s) => ({
        ...s,
        status: "Belum Setor" as const,
        nilai: null,
        predikat: null,
        totalKesalahan: 0,
        errors: { ...EMPTY_ERROR_COUNTERS },
        catatanGuru: ""
      }))
    };

    const nextUjianList = [newSession, ...(selectedClass.ujianList || [])];

    setClassesList((prev) =>
      prev.map((cls) =>
        cls.id === selectedClass.id ? { ...cls, ujianList: nextUjianList } : cls
      )
    );

    fetch("/api/kelas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedClass.id,
        nama: selectedClass.name,
        ujianSessions: nextUjianList.map((u) => ({
          id: u.id,
          namaUjian: u.namaUjian,
          tanggalUjian: u.tanggalUjian
        }))
      })
    }).catch((err) => console.warn("Gagal menyimpan jadwal ujian kelas:", err));

    setNewTanggalUjian("");
    setNewNamaUjian("");
    setIsAddUjianOpen(false);
    setMobileExamStepTab("ujian");
    setToastMessage(`Sesi ujian "${newSession.namaUjian}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEditUjian = (ujian: UjianSession) => {
    setEditUjianId(ujian.id);
    setEditNamaUjian(ujian.namaUjian);
    setEditTanggalUjian(
      toInputDateFormat(ujian.tanggalUjian) || new Date().toISOString().split("T")[0]
    );
    setIsEditUjianOpen(true);
  };

  const handleSaveEditUjian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !editUjianId || !editNamaUjian.trim() || !editTanggalUjian.trim()) return;

    try {
      setIsSavingEditUjian(true);
      const updatedNama = editNamaUjian.trim();
      const updatedTanggal = formatTanggalIndo(editTanggalUjian.trim());

      const nextUjianList = (selectedClass.ujianList || []).map((u) =>
        u.id === editUjianId
          ? { ...u, namaUjian: updatedNama, tanggalUjian: updatedTanggal }
          : u
      );

      setClassesList((prev) =>
        prev.map((cls) =>
          cls.id === selectedClass.id ? { ...cls, ujianList: nextUjianList } : cls
        )
      );

      // Sinkronkan ke dokumen kelas di MongoDB
      await fetch("/api/kelas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClass.id,
          nama: selectedClass.name,
          ujianSessions: nextUjianList.map((u) => ({
            id: u.id,
            namaUjian: u.namaUjian,
            tanggalUjian: u.tanggalUjian
          }))
        })
      });

      // Sinkronkan ke koleksi ujian di MongoDB jika ada record evaluasi
      await fetch("/api/ujian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          examId: editUjianId,
          namaUjian: updatedNama,
          tanggalUjian: updatedTanggal
        })
      });

      setIsEditUjianOpen(false);
      setToastMessage(`Jadwal ujian "${updatedNama}" berhasil diperbarui!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Gagal memperbarui ujian:", err);
      setToastMessage("Gagal memperbarui nama ujian");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSavingEditUjian(false);
    }
  };

  const handleOpenDeleteUjian = (ujian: UjianSession) => {
    setDeleteUjianSession(ujian);
    setIsDeleteUjianOpen(true);
  };

  const handleConfirmDeleteUjian = async () => {
    if (!selectedClass || !deleteUjianSession) return;

    try {
      setIsDeletingUjian(true);
      const targetId = deleteUjianSession.id;
      const targetName = deleteUjianSession.namaUjian;

      const nextUjianList = (selectedClass.ujianList || []).filter((u) => u.id !== targetId);

      setClassesList((prev) =>
        prev.map((cls) =>
          cls.id === selectedClass.id ? { ...cls, ujianList: nextUjianList } : cls
        )
      );

      // Sinkronkan ke dokumen kelas di MongoDB
      await fetch("/api/kelas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClass.id,
          nama: selectedClass.name,
          ujianSessions: nextUjianList.map((u) => ({
            id: u.id,
            namaUjian: u.namaUjian,
            tanggalUjian: u.tanggalUjian
          }))
        })
      });

      // Hapus evaluasi yang berkaitan dari koleksi ujian di MongoDB
      await fetch(`/api/ujian?classId=${encodeURIComponent(selectedClass.id)}&examId=${encodeURIComponent(targetId)}`, {
        method: "DELETE"
      });

      if (selectedExamId === targetId) {
        setSelectedExamId(null);
      }

      setIsDeleteUjianOpen(false);
      setDeleteUjianSession(null);
      setToastMessage(`Sesi ujian "${targetName}" berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Gagal menghapus sesi ujian:", err);
      setToastMessage("Gagal menghapus ujian");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsDeletingUjian(false);
    }
  };

  // Error Counter Handlers
  const handleAdjustError = (key: keyof ErrorCounters, delta: number) => {
    setErrorCounters((prev) => ({
      ...prev,
      [key]: Math.max(0, (Number(prev[key]) || 0) + delta)
    }));
  };

  const handleToggleMakhorijLetter = (letter: string) => {
    setErrorCounters((prev) => {
      const currentLetters = prev.makhorijHuruf || [];
      const exists = currentLetters.includes(letter);
      const nextLetters = exists
        ? currentLetters.filter((l) => l !== letter)
        : [...currentLetters, letter];
      const nextCount = exists
        ? Math.max(0, (prev.makhorij || 0) - 1)
        : (prev.makhorij || 0) + 1;
      return {
        ...prev,
        makhorij: nextCount,
        makhorijHuruf: nextLetters
      };
    });
  };

  const handleAddQuickTag = (tag: string) => {
    setCatatanUstadz((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  // Calculate live score sesuai bobot 9 materi resmi:
  // 1. Makhorijul Huruf (3x)
  // 2. Shifatul Huruf (2x)
  // 3. Ahkamul Huruf (2x)
  // 4. Ahkamul Mad (2x)
  // 5. Waqof wal Ibtida (2x)
  // 6. Muroatul Huruf wal Harokah (2x)
  // 7. Miring (1x)
  // 8. Tawallud (1x)
  // 9. Kelancaran (1x)
  const totalErrors =
    (errorCounters.makhorij || 0) * 3 +
    (errorCounters.shifat || 0) * 2 +
    (errorCounters.ahkamulHuruf ?? errorCounters.nunMim ?? 0) * 2 +
    (errorCounters.mad || 0) * 2 +
    (errorCounters.waqaf || 0) * 2 +
    (errorCounters.muroatulHuruf ?? errorCounters.lahnJali ?? 0) * 2 +
    (errorCounters.miring || 0) * 1 +
    (errorCounters.tawallud || 0) * 1 +
    (errorCounters.kelancaran || 0) * 1;

  const calculatedScore = Math.max(0, 100 - totalErrors);

  // Save current student evaluation and return to student table for this exam
  const handleSaveEvaluation = () => {
    if (!selectedClass || !selectedExam || !activeSantri) return;

    const predikat = getPredikat(calculatedScore);
    const materiPatokanKelas =
      selectedClass.materiTerakhir || surahAyat || activeSantri.surahDibaca;

    const updatedSantriList = selectedExam.santriList.map((s) => {
      if (s.id === activeSantri.id) {
        return {
          ...s,
          status: "Selesai" as const,
          surahDibaca: materiPatokanKelas,
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
      prev.map((cls) =>
        cls.id === selectedClass.id ? { ...cls, ujianList: updatedUjianList } : cls
      )
    );

    // Persist evaluation directly to MongoDB Compass (raport_quran.ujian)
    fetch("/api/ujian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: selectedClass.id,
        examId: selectedExam.id,
        namaUjian: selectedExam.namaUjian,
        tanggalUjian: selectedExam.tanggalUjian,
        santriId: activeSantri.id,
        nis: activeSantri.nis,
        nama: activeSantri.nama,
        status: "Selesai",
        surahDibaca: materiPatokanKelas,
        totalKesalahan: totalErrors,
        nilai: calculatedScore,
        predikat: predikat,
        catatanGuru: catatanUstadz,
        errors: { ...errorCounters }
      })
    }).catch((err) => console.warn("POST /api/ujian error:", err));

    setToastMessage(
      `Evaluasi bacaan untuk ${activeSantri.nama} berhasil disimpan! Nilai: ${calculatedScore} (${predikat})`
    );
    setTimeout(() => setToastMessage(null), 4000);

    // Return to the students table for this exam!
    handleNavigateStep("students");
  };

  const handleResetCounters = () => {
    setErrorCounters(EMPTY_ERROR_COUNTERS);
    setCatatanUstadz("");
  };

  return (
    <div className="relative min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-[#97D7FF]/30 selection:text-[#086288]">
      {/* Background Gedung Pesantren Ilmu Al-Qur'an */}
      <div className="no-print fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/bg-app.jpg"
          alt="Gedung Pesantren Ilmu Al-Qur'an"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Soft institutional overlay to maintain optimal readability and high contrast */}
        <div className="absolute inset-0 bg-[#f8fbfe]/88 dark:bg-zinc-950/92 backdrop-blur-[2px]" />
      </div>
      {/* ========================================================= */}
      {/* APP TOPBAR / HEADER FOR ASATIDZ                           */}
      {/* ========================================================= */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 min-h-14 sm:h-16 py-2 sm:py-0">
            {/* Brand Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => handleNavigateStep("welcome")}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105"
                title="Beranda"
              >
                <Image
                  src="/logo.png"
                  alt="Logo Pesantren Ilmu Al-Qur'an"
                  width={40}
                  height={40}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  priority
                />
              </button>
              <button
                onClick={() => handleNavigateStep("welcome")}
                className="text-left group cursor-pointer min-w-0"
              >
                <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-[#086288] dark:group-hover:text-[#97D7FF] transition-colors tracking-tight leading-tight block truncate">
                  Raport Qur&apos;an Digital
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight block truncate mt-0.5">
                  Pesantren Ilmu Al-Qur&apos;an
                </span>
              </button>
            </div>

            {/* Top Right Info */}
            <div className="hidden sm:flex items-center text-xs text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
              <span>Semester Ganjil 2026/2027</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 text-white text-xs font-medium shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none space-y-6 print:space-y-0 flex flex-col">
        {/* ======================================================= */}
        {/* STEP 1: HANYA MENAMPILKAN SELAMAT DATANG SAJA (NO CARD) */}
        {/* ======================================================= */}
        {currentStep === "welcome" && (
          <div className="my-auto max-w-3xl mx-auto w-full py-16 sm:py-24 text-center space-y-7 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#086288] dark:text-[#97D7FF] tracking-tight leading-snug">
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
            <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#086288] dark:text-[#97D7FF]" />
                Pilih Kategori Program
              </h2>
            </div>

            {/* Category Cards Grid (3 Columns: Murottal, Murojaah, Tafsir) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
              {categoriesData.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="group bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#086288] dark:hover:border-[#97D7FF] hover:bg-[#f8fbfe] dark:hover:bg-zinc-800/80 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#086288] dark:group-hover:text-[#97D7FF] transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#086288] dark:group-hover:text-[#97D7FF] group-hover:translate-x-1 transition-all" />
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
            <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigateStep("category")}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-[#086288] dark:hover:text-[#97D7FF] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Kembali ke Kategori"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#086288] dark:text-[#97D7FF]">
                  Program: {selectedCategory.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
                Pilih Kelas
              </h2>
            </div>

            {/* List of classes in category */}
            {showClassSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 animate-pulse"
                  >
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-28"></div>
                    <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0"></div>
                  </div>
                ))}
              </div>
            ) : availableClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {availableClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className="group bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#086288] dark:hover:border-[#97D7FF] hover:bg-[#f8fbfe] dark:hover:bg-zinc-800/80 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#086288] dark:group-hover:text-[#97D7FF] transition-colors">
                      {cls.name}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-[#086288] dark:group-hover:text-[#97D7FF] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            ) : !isLoadingClasses ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Belum ada kelas pada program {selectedCategory.name} di basis data.
              </div>
            ) : null}
          </div>
        )}

        {/* Loading state saat membuka URL rute langsung (refresh) hanya jika memang memakan waktu */}
        {showClassSkeleton &&
          isLoadingClasses &&
          !selectedClass &&
          (currentStep === "exams" ||
            currentStep === "students" ||
            currentStep === "evaluation") && (
            <div className="space-y-4 sm:space-y-5 animate-pulse">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="space-y-1.5">
                    <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-3.5 w-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
                  </div>
                </div>
                <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                  <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-16 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                      <div className="h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                      <div className="h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                  <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                    <div className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                    <div className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ======================================================= */}
        {/* STEP 4: DETAIL KELAS, SANTRI & TABEL UJIAN / TASHIH     */}
        {/* ======================================================= */}
        {currentStep === "exams" && selectedClass && (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            {/* Header & Actions */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={() => handleNavigateStep("class")}
                  className="p-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                  title="Kembali ke Pilih Kelas"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                    Kelas {selectedClass.name}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {selectedClass.target} • {selectedClass.santriList.length} santri •{" "}
                    {(selectedClass.ujianList || []).length} sesi
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!newTanggalUjian) {
                    setNewTanggalUjian(new Date().toISOString().split("T")[0]);
                  }
                  setIsAddUjianOpen(true);
                }}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Tambah Jadwal</span>
              </button>
            </div>

            {/* Navigasi 2 Tab khusus Mode Mobile: Data Santri Kelas & Ujian */}
            <div className="lg:hidden grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setMobileExamStepTab("santri")}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  mobileExamStepTab === "santri"
                    ? "bg-white dark:bg-zinc-700 text-[#086288] dark:text-[#97D7FF] shadow-xs border border-zinc-200/80 dark:border-zinc-600"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Data Santri Kelas
              </button>
              <button
                type="button"
                onClick={() => setMobileExamStepTab("ujian")}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  mobileExamStepTab === "ujian"
                    ? "bg-white dark:bg-zinc-700 text-[#086288] dark:text-[#97D7FF] shadow-xs border border-zinc-200/80 dark:border-zinc-600"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Ujian
              </button>
            </div>

            {/* Grid Layout: Kiri = Info Kelas & Daftar Santri, Kanan = Tabel Ujian / Tashih */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              {/* PANEL KIRI: INFORMASI KELAS & DAFTAR SANTRI */}
              <div
                className={`${
                  mobileExamStepTab === "santri" ? "block" : "hidden"
                } lg:block lg:col-span-5 space-y-4 sm:space-y-5`}
              >
                {/* Kartu Informasi Kelas */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Informasi Kelas
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                    <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="px-3 py-2">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Kelas</div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                          {selectedClass.name}
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Program</div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                          {selectedClass.target}
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Total Tashih</div>
                        <div className="font-semibold text-[#086288] dark:text-[#97D7FF] mt-0.5 tabular-nums">
                          {(selectedClass.ujianList || []).length} kali
                        </div>
                      </div>
                    </div>
                    <div className="px-3.5 sm:px-4 py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Guru Pengajar</span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                          {selectedClass.waliList && selectedClass.waliList.length > 0
                            ? `${selectedClass.waliList.length} pengajar`
                            : ""}
                        </span>
                      </div>
                      {selectedClass.waliList && selectedClass.waliList.length > 0 ? (
                        <div className="space-y-1 pt-0.5">
                          {selectedClass.waliList.map((guru, idx) => (
                            <div
                              key={guru}
                              className="flex items-start gap-1.5 px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 font-medium text-[11px] sm:text-xs"
                            >
                              <span className="text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
                                {idx + 1}.
                              </span>
                              <span className="leading-snug">{guru}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {selectedClass.wali || "-"}
                        </div>
                      )}
                    </div>

                    {/* Input Materi Terakhir Kelas (Patokan Semua Santri) */}
                    <form
                      onSubmit={handleSaveClassMateri}
                      className="px-3.5 sm:px-4 py-2.5 bg-zinc-50/40 dark:bg-zinc-800/30 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-zinc-600 dark:text-zinc-300 font-semibold text-[11px]">
                          Materi Terakhir Kelas
                        </label>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          Patokan seluruh santri
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={classMateriInput}
                          onChange={(e) => setClassMateriInput(e.target.value)}
                          placeholder="Contoh: JUZ 16"
                          className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288]"
                        />
                        <button
                          type="submit"
                          disabled={isSavingClassMateri}
                          className="px-3 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] disabled:opacity-60 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                        >
                          {isSavingClassMateri ? "..." : "Simpan"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Kartu Daftar Santri di Kelas Ini */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Daftar Santri
                    </h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {selectedClass.santriList.length} santri
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                        <tr>
                          <th className="px-3 py-2 w-9 text-center">No</th>
                          <th className="px-3 py-2">Nama Santri</th>
                          <th className="px-3 py-2 text-right w-24">Tashih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {selectedClass.santriList.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-zinc-400 dark:text-zinc-500">
                              Belum ada santri terdaftar di kelas ini.
                            </td>
                          </tr>
                        ) : (
                          selectedClass.santriList.map((santri, idx) => {
                            const totalSessions = (selectedClass.ujianList || []).length;
                            const completedSessions = (selectedClass.ujianList || []).filter((u) =>
                              u.santriList.some(
                                (us) => us.id === santri.id && us.status === "Selesai"
                              )
                            ).length;

                            return (
                              <tr key={santri.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-3 py-2 text-center text-zinc-400 dark:text-zinc-500 tabular-nums">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                                  {santri.nama}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                  {completedSessions}/{totalSessions} ujian
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PANEL KANAN: TABEL JADWAL UJIAN / TASHIH */}
              <div
                className={`${
                  mobileExamStepTab === "ujian" ? "block" : "hidden"
                } lg:block lg:col-span-7 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden`}
              >
                <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Jadwal Ujian / Tashih
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    Total: {(selectedClass.ujianList || []).length} sesi
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 sm:px-4 py-2.5 text-center w-9 sm:w-12">No</th>
                        <th className="px-3 sm:px-4 py-2.5">
                          <span className="sm:hidden">Tanggal &amp; Ujian</span>
                          <span className="hidden sm:inline">Tanggal &amp; Nama Ujian / Tashih</span>
                        </th>
                        <th className="hidden sm:table-cell px-3 py-2.5 text-center w-24">
                          Selesai
                        </th>
                        <th className="hidden sm:table-cell px-3 py-2.5 text-center w-24">
                          Belum Diuji
                        </th>
                        <th className="px-3 sm:px-4 py-2.5 text-right w-28 sm:w-36">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {(selectedClass.ujianList || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                            Belum ada jadwal ujian.
                          </td>
                        </tr>
                      ) : (
                        (selectedClass.ujianList || []).map((ujian, index) => {
                          const selesai = ujian.santriList.filter(
                            (s) => s.status === "Selesai"
                          ).length;
                          const belum = ujian.santriList.filter(
                            (s) => s.status !== "Selesai"
                          ).length;
                          return (
                            <tr
                              key={ujian.id}
                              onClick={() => handleEnterExam(ujian.id)}
                              className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            >
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-zinc-500 dark:text-zinc-400 tabular-nums">
                                {index + 1}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                  {ujian.tanggalUjian}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                  {ujian.namaUjian}
                                </div>
                                <div className="sm:hidden flex items-center gap-1.5 text-[11px] mt-1 tabular-nums">
                                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    {selesai} selesai
                                  </span>
                                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                                  {belum > 0 ? (
                                    <span className="text-zinc-500 dark:text-zinc-400">{belum} belum</span>
                                  ) : (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Lengkap</span>
                                  )}
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-3 py-3 text-center text-zinc-700 dark:text-zinc-300 font-medium tabular-nums">
                                {selesai} santri
                              </td>
                              <td className="hidden sm:table-cell px-3 py-3 text-center tabular-nums">
                                {belum > 0 ? (
                                  <span className="text-zinc-600 dark:text-zinc-400">{belum} santri</span>
                                ) : (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Selesai</span>
                                )}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                                <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditUjian(ujian);
                                    }}
                                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                                    title="Edit Nama / Tanggal Ujian"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDeleteUjian(ujian);
                                    }}
                                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                    title="Hapus Sesi Ujian"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEnterExam(ujian.id);
                                    }}
                                    className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ml-0.5"
                                  >
                                    <span>Buka</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
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
            </div>

            {/* Modal Tambah Jadwal Ujian */}
            {isAddUjianOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-lg p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Tambah Jadwal Ujian</h3>
                    <button
                      onClick={() => setIsAddUjianOpen(false)}
                      className="w-7 h-7 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-base cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddUjianSession} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Tanggal Ujian
                      </label>
                      <input
                        type="date"
                        required
                        value={newTanggalUjian}
                        onChange={(e) => setNewTanggalUjian(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      />
                      {newTanggalUjian && (
                        <p className="text-[11px] text-[#086288] dark:text-[#97D7FF] font-medium mt-1">
                          {formatTanggalIndo(newTanggalUjian)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nama Ujian
                      </label>
                      <input
                        type="text"
                        required
                        value={newNamaUjian}
                        onChange={(e) => setNewNamaUjian(e.target.value)}
                        placeholder="Contoh: Ujian Tasmi' Juz 30"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsAddUjianOpen(false)}
                        className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white font-medium cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Jadwal & Nama Ujian */}
            {isEditUjianOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-lg p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Edit Jadwal &amp; Nama Ujian</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditUjianOpen(false)}
                      className="w-7 h-7 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-base cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditUjian} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Tanggal Ujian
                      </label>
                      <input
                        type="date"
                        required
                        value={editTanggalUjian}
                        onChange={(e) => setEditTanggalUjian(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      />
                      {editTanggalUjian && (
                        <p className="text-[11px] text-[#086288] dark:text-[#97D7FF] font-medium mt-1">
                          {formatTanggalIndo(editTanggalUjian)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Nama Ujian
                      </label>
                      <input
                        type="text"
                        required
                        value={editNamaUjian}
                        onChange={(e) => setEditNamaUjian(e.target.value)}
                        placeholder="Contoh: Tasmi' Ujian Utama"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsEditUjianOpen(false)}
                        className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEditUjian}
                        className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white font-medium cursor-pointer disabled:opacity-50"
                      >
                        {isSavingEditUjian ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Konfirmasi Hapus Jadwal Ujian */}
            {isDeleteUjianOpen && deleteUjianSession && (
              <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-lg p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Hapus Sesi Ujian</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Konfirmasi penghapusan</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Apakah Anda yakin ingin menghapus sesi ujian <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{deleteUjianSession.namaUjian}</strong> ({deleteUjianSession.tanggalUjian})? Seluruh riwayat dan data penilaian santri pada sesi ini akan ikut terhapus.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeleteUjianOpen(false);
                        setDeleteUjianSession(null);
                      }}
                      className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingUjian}
                      onClick={handleConfirmDeleteUjian}
                      className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingUjian ? "Menghapus..." : "Hapus Ujian"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 5: TABEL DAFTAR SANTRI PADA UJIAN TERPILIH        */}
        {/* ======================================================= */}
        {currentStep === "students" && selectedClass && selectedExam && (
          <StudentsStepView
            selectedClass={selectedClass}
            selectedExam={selectedExam}
            filteredSantri={filteredSantri}
            searchSantri={searchSantri}
            setSearchSantri={setSearchSantri}
            printingSantri={printingSantri}
            setPrintingSantri={setPrintingSantri}
            kepalaMadrasah={kepalaMadrasah}
            semesterLabel={semesterLabel}
            setCurrentStep={handleNavigateStep}
            handleOpenEvaluation={handleOpenEvaluation}
          />
        )}

        {/* ======================================================= */}
        {/* STEP 6: PENCATATAN KESALAHAN BACAAN SANTRI             */}
        {/* ======================================================= */}
        {currentStep === "evaluation" && selectedClass && selectedExam && activeSantri && (
          <EvaluationFormView
            activeSantri={activeSantri}
            surahAyat={surahAyat}
            setSurahAyat={setSurahAyat}
            tipeSesi={tipeSesi}
            setTipeSesi={setTipeSesi}
            catatanUstadz={catatanUstadz}
            setCatatanUstadz={setCatatanUstadz}
            errorCounters={errorCounters}
            totalErrors={totalErrors}
            calculatedScore={calculatedScore}
            setCurrentStep={handleNavigateStep}
            handleAdjustError={handleAdjustError}
            handleToggleMakhorijLetter={handleToggleMakhorijLetter}
            handleAddQuickTag={handleAddQuickTag}
            handleResetCounters={handleResetCounters}
            handleSaveEvaluation={handleSaveEvaluation}
          />
        )}
      </main>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="no-print mt-auto bg-white dark:bg-zinc-900/95 border-t border-zinc-200/80 dark:border-zinc-800 py-4 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p className="font-medium text-zinc-600 dark:text-zinc-400">
            &copy; 2026 <span className="font-semibold text-[#086288] dark:text-[#97D7FF]">Muharrik Al Quran Pesantren Ilmu Al-Qur&apos;an</span>{" "}
          </p>
        </div>
      </footer>
    </div>
  );
}
