"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Save,
  Plus,
  Minus,
  Search,
  Printer,
  Download,
  Loader2
} from "lucide-react";
import {
  ClassItem,
  UjianSession,
  SantriRecord,
  ErrorCounters,
  StepType,
  getPredikat
} from "./evaluationData";

interface StudentsStepViewProps {
  selectedClass: ClassItem;
  selectedExam: UjianSession;
  filteredSantri: SantriRecord[];
  searchSantri: string;
  setSearchSantri: (val: string) => void;
  printingSantri: SantriRecord | null;
  setPrintingSantri: (santri: SantriRecord | null) => void;
  kepalaMadrasah: string;
  semesterLabel: string;
  setCurrentStep: (step: StepType) => void;
  handleOpenEvaluation: (santri: SantriRecord) => void;
}

export function StudentsStepView({
  selectedClass,
  selectedExam,
  filteredSantri,
  searchSantri,
  setSearchSantri,
  printingSantri,
  setPrintingSantri,
  kepalaMadrasah,
  semesterLabel,
  setCurrentStep,
  handleOpenEvaluation
}: StudentsStepViewProps) {
  const total = selectedExam.santriList.length;
  const completed = selectedExam.santriList.filter((s) => s.status === "Selesai").length;

  const teacherOptions = React.useMemo(() => {
    if (selectedClass.waliList && selectedClass.waliList.length > 0) {
      return selectedClass.waliList;
    }
    if (selectedClass.wali && selectedClass.wali !== "-") {
      return [selectedClass.wali];
    }
    return ["-"];
  }, [selectedClass.waliList, selectedClass.wali]);

  const [selectedPengajar, setSelectedPengajar] = React.useState<string>(
    teacherOptions[0] || "-"
  );

  React.useEffect(() => {
    setSelectedPengajar(teacherOptions[0] || "-");
  }, [teacherOptions]);

  const tanggalCetakFormatted = React.useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
    []
  );

  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  const handleDownloadPdf = async (santri: SantriRecord) => {
    const element = document.getElementById("printable-raport");
    if (!element || !santri) return;

    try {
      setIsGeneratingPdf(true);
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const cleanSantriName = santri.nama.trim().replace(/[/\\?%*:|"<>]/g, "");
      const fileName = `${cleanSantriName}.pdf`;

      // Render elemen ke canvas resolusi tinggi dengan html2canvas-pro (mendukung oklch, lab, dll.)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Setup dokumen jsPDF ukuran Legal Portrait (215.9 mm x 355.6 mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "legal"
      });

      const marginX = 6;
      const marginY = 4;
      const maxPdfWidth = 215.9 - marginX * 2; // 203.9 mm
      const maxPdfHeight = 355.6 - marginY * 2; // 347.6 mm

      let pdfWidth = maxPdfWidth;
      let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Pastikan raport selalu muat tepat dalam 1 lembar tanpa pernah overflow ke halaman 2
      if (pdfHeight > maxPdfHeight) {
        pdfHeight = maxPdfHeight;
        pdfWidth = (canvas.width * pdfHeight) / canvas.height;
      }

      const posX = marginX + (maxPdfWidth - pdfWidth) / 2;
      const posY = marginY;

      pdf.addImage(imgData, "JPEG", posX, posY, pdfWidth, pdfHeight);
      pdf.save(fileName);
    } catch (err) {
      console.error("Gagal mengunduh PDF secara langsung:", err);
      // Fallback ke window.print jika download PDF gagal
      const originalTitle = document.title;
      document.title = santri.nama.trim();
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintDirect = (santri: SantriRecord) => {
    if (!santri) return;
    const originalTitle = document.title;
    document.title = santri.nama.trim();
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div className="space-y-4 print:space-y-0 animate-fade-in">
      {/* Header Bar */}
      <div className="no-print flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
          {selectedExam.namaUjian} &bull; {selectedExam.tanggalUjian}
        </h1>

        <button
          onClick={() => setCurrentStep("exams")}
          className="px-2.5 sm:px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Student Table Card */}
      <div className="no-print bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daftar Santri</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({completed}/{total} selesai)
            </span>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchSantri}
              onChange={(e) => setSearchSantri(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="w-full pl-8 pr-7 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            {searchSantri && (
              <button
                onClick={() => setSearchSantri("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Table with columns: no, nama, status, aksi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="px-3 sm:px-4 py-2.5 text-center w-9 sm:w-12">No</th>
                <th className="px-3 sm:px-4 py-2.5">Nama Santri</th>
                <th className="hidden sm:table-cell px-4 py-2.5 w-44">Status / Nilai</th>
                <th className="px-3 sm:px-4 py-2.5 text-right w-28 sm:w-44">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    Tidak ada santri yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri, index) => {
                  const isCompleted = santri.status === "Selesai";
                  return (
                    <tr key={santri.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{santri.nama}</div>
                        <div className="sm:hidden text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {isCompleted ? (
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                              Nilai {santri.nilai} ({santri.predikat?.split(" (")[0]})
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500">Belum diuji</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        {isCompleted ? (
                          <div className="text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                              {santri.nilai}
                            </span>{" "}
                            <span className="text-zinc-500 dark:text-zinc-400">
                              ({santri.predikat?.split(" (")[0]})
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">Belum diuji</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                        {!isCompleted ? (
                          <button
                            onClick={() => handleOpenEvaluation(santri)}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <span>Uji</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-1.5">
                            <button
                              onClick={() => setPrintingSantri(santri)}
                              className="w-full sm:w-auto px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Cetak Raport Tilawah"
                            >
                              <Printer className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                              <span>Cetak</span>
                            </button>
                            <button
                              onClick={() => handleOpenEvaluation(santri)}
                              className="w-full sm:w-auto px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                              title="Uji Ulang Santri"
                            >
                              <RotateCcw className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
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
      </div>

      {/* Modal Cetak Raport Tilawah Santri (Format Resmi Madrasah Diniyah PIQ - Ukuran Legal) */}
      {printingSantri && (() => {
        const err = printingSantri.errors || {
          makhorij: 0,
          shifat: 0,
          ahkamulHuruf: 0,
          mad: 0,
          waqaf: 0,
          muroatulHuruf: 0,
          miring: 0,
          tawallud: 0,
          kelancaran: 0
        };
        const rows = [
          { no: "1.", materi: "Makhorijul Huruf", salah: err.makhorij || 0, bobot: 3 },
          { no: "2.", materi: "Shifatul Huruf", salah: err.shifat || 0, bobot: 2 },
          {
            no: "3.",
            materi: "Ahkamul Huruf",
            salah: err.ahkamulHuruf ?? err.nunMim ?? 0,
            bobot: 2
          },
          { no: "4.", materi: "Ahkamul Mad", salah: err.mad || 0, bobot: 2 },
          { no: "5.", materi: "Waqof wal Ibtida", salah: err.waqaf || 0, bobot: 2 },
          {
            no: "6.",
            materi: "Muroatul Huruf wal Harokah",
            salah: err.muroatulHuruf ?? err.lahnJali ?? 0,
            bobot: 2
          },
          { no: "7.", materi: "Miring", salah: err.miring || 0, bobot: 1 },
          { no: "8.", materi: "Tawallud", salah: err.tawallud || 0, bobot: 1 },
          { no: "9.", materi: "Kelancaran", salah: err.kelancaran || 0, bobot: 1 }
        ];
        const totalSalahPoin = rows.reduce((acc, r) => acc + r.salah * r.bobot, 0);
        const finalScore =
          printingSantri.nilai !== null ? printingSantri.nilai : Math.max(0, 100 - totalSalahPoin);
        const finalPredikat = (printingSantri.predikat || getPredikat(finalScore))
          .split(" (")[0]
          .toUpperCase();

        return (
          <div className="print-modal-wrapper fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <style>{`
              @page {
                size: legal portrait;
                margin: 0;
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
              }
              @media print {
                html, body {
                  height: auto !important;
                  overflow: visible !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }
                .print-modal-wrapper,
                .print-modal-card {
                  position: static !important;
                  max-width: none !important;
                  max-height: none !important;
                  overflow: visible !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: #ffffff !important;
                  backdrop-filter: none !important;
                }
                #printable-raport {
                  width: 100% !important;
                  min-width: 0 !important;
                  max-width: 100% !important;
                  min-height: auto !important;
                  max-height: none !important;
                  display: flex !important;
                  flex-direction: column !important;
                  padding: 6mm 10mm 4mm 10mm !important;
                  border: none !important;
                  box-shadow: none !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  page-break-after: avoid !important;
                  break-after: avoid !important;
                }
                #printable-raport * {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                #printable-raport-footer {
                  page-break-before: avoid !important;
                  break-before: avoid !important;
                  margin-top: 4px !important;
                  padding-top: 2px !important;
                }
              }
            `}</style>
            <div className="print-modal-card bg-white dark:bg-zinc-900 rounded-lg max-w-3xl w-full border border-zinc-300 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 space-y-3 my-auto max-h-[95vh] overflow-y-auto">
              {/* Toolbar Pengaturan Cetak (Tidak ikut tercetak saat window.print atau saat diunduh PDF) */}
              <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Pratinjau Cetak Raport
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Pilih nama pengajar, lalu unduh PDF atau cetak langsung
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <label className="text-zinc-600 dark:text-zinc-300 font-medium whitespace-nowrap">
                      Pengajar:
                    </label>
                    <select
                      value={selectedPengajar}
                      onChange={(e) => setSelectedPengajar(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#086288]"
                    >
                      {teacherOptions.map((guru) => (
                        <option key={guru} value={guru} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                          {guru}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tombol Unduh PDF Langsung (Otomatis nama santri tanpa preview ganda) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(printingSantri)}
                    disabled={isGeneratingPdf}
                    className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-70 transition-all shadow-xs"
                    title={`Unduh file PDF dengan nama ${printingSantri.nama}.pdf`}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunduh...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </>
                    )}
                  </button>

                  {/* Tombol Cetak Langsung Printer */}
                  <button
                    type="button"
                    onClick={() => handlePrintDirect(printingSantri)}
                    className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Cetak langsung menggunakan printer"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintingSantri(null)}
                    className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* LEMBAR RAPORT RESMI (Dijamin muat 1 halaman di semua device & kertas) */}
              <div className="w-full overflow-x-auto pb-1">
                <div
                  id="printable-raport"
                  style={{
                    fontFamily: 'Cambria, "Times New Roman", Times, serif',
                    width: '760px',
                    minWidth: '760px',
                    minHeight: '1280px'
                  }}
                  className="bg-white text-black px-1.5 py-1 text-[11px] sm:text-[11.5px] leading-tight flex flex-col justify-between mx-auto"
                >
                  {/* BAGIAN UTAMA RAPORT */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {/* KOP SURAT */}
                    <div className="relative pb-2 border-b-4 border-double border-black">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2">
                          <Image
                            src="/logo.png"
                            alt="Logo PIQ"
                            width={75}
                            height={75}
                            className="w-[75px] h-[75px] object-contain shrink-0"
                            style={{ width: "75px", height: "75px" }}
                            priority
                          />
                        </div>
                        <div className="text-center px-20 sm:px-24">
                          <div className="font-bold text-[14px] sm:text-[15.5px] uppercase tracking-wide leading-tight">
                            LAPORAN HASIL BELAJAR
                          </div>
                          <div className="font-bold text-[14px] sm:text-[15.5px] uppercase tracking-wide leading-tight">
                            MADRASAH DINIYAH
                          </div>
                          <div className="font-bold text-[14px] sm:text-[15.5px] uppercase tracking-wide leading-tight">
                            PESANTREN ILMU AL QURAN
                          </div>
                          <div className="text-[11px] font-normal mt-0.5 leading-tight">
                            Jl. Raya Singosari 107 Telp. (0341) 458340
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* JUDUL SUB-KOP */}
                    <div className="text-center font-bold text-[12.5px] sm:text-[13.5px] uppercase tracking-wide py-0.5">
                      KELAS AL QURAN
                    </div>

                    {/* IDENTITAS SANTRI (2 KOLOM) */}
                    <div className="grid grid-cols-2 gap-4 text-[11.5px] sm:text-[12px]">
                      <table className="w-full">
                        <tbody>
                          <tr className="align-top">
                            <td className="font-bold py-1 w-28 whitespace-nowrap">Nama</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{printingSantri.nama}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="font-bold py-1 whitespace-nowrap">Kelas Diniyah</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{printingSantri.jenjang || "1"}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="font-bold py-1 whitespace-nowrap">Semester</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{semesterLabel}</td>
                          </tr>
                        </tbody>
                      </table>

                      <table className="w-full">
                        <tbody>
                          <tr className="align-top">
                            <td className="font-bold py-1 w-28 whitespace-nowrap">Materi Terakhir</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1 uppercase">
                              {selectedClass.materiTerakhir || printingSantri.surahDibaca || "-"}
                            </td>
                          </tr>
                          <tr className="align-top">
                            <td className="font-bold py-1 whitespace-nowrap">Pengajar</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{selectedPengajar}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="font-bold py-1 whitespace-nowrap">Kelas Al Quran</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{selectedClass.name}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* TABEL PENILAIAN 9 MATERI */}
                    <table className="w-full border-collapse border border-black text-[11.5px] sm:text-[12px]">
                      <thead>
                        <tr className="font-bold uppercase text-center bg-[#f9f9f9] print:bg-transparent">
                          <th className="border border-black px-2 py-1.5 w-10">NO.</th>
                          <th className="border border-black px-3 py-1.5 text-left sm:text-center">MATERI</th>
                          <th className="border border-black px-2 py-1.5 w-28 sm:w-32">KESALAHAN</th>
                          <th className="border border-black px-2 py-1.5 w-24 sm:w-28">BOBOT</th>
                          <th className="border border-black px-2 py-1.5 w-24 sm:w-28">JUMLAH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.no}>
                            <td className="border border-black px-2 py-1 sm:py-1.5 text-center">{r.no}</td>
                            <td className="border border-black px-3 py-1 sm:py-1.5">{r.materi}</td>
                            <td className="border border-black px-2 py-1 sm:py-1.5 text-center">{r.salah}</td>
                            <td className="border border-black px-2 py-1 sm:py-1.5 text-center">{r.bobot} x</td>
                            <td className="border border-black px-2 py-1 sm:py-1.5 text-center">
                              {r.salah * r.bobot}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-black px-3 py-1.5 text-center font-bold uppercase"
                          >
                            TOTAL KESALAHAN
                          </td>
                          <td className="border border-black px-2 py-1.5 text-center font-bold">
                            {totalSalahPoin}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-black px-3 py-1.5 text-center font-bold uppercase"
                          >
                            NILAI
                          </td>
                          <td className="border border-black px-2 py-1.5 text-center font-bold">
                            {finalScore}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-black px-3 py-1.5 text-center font-bold uppercase"
                          >
                            PREDIKAT
                          </td>
                          <td className="border border-black px-2 py-1.5 text-center font-bold uppercase">
                            {finalPredikat}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* TABEL KEAKTIFAN SANTRI & KETERANGAN NILAI */}
                    <div className="grid grid-cols-12 gap-3.5 items-start">
                      {/* Kiri: KEAKTIFAN SANTRI */}
                      <div className="col-span-6">
                        <table className="w-full border-collapse border border-black text-[11px] sm:text-[11.5px]">
                          <thead>
                            <tr>
                              <th
                                colSpan={3}
                                className="border border-black px-2 py-1.5 text-center font-bold uppercase bg-[#f9f9f9] print:bg-transparent"
                              >
                                KEAKTIFAN SANTRI
                              </th>
                            </tr>
                            <tr className="font-bold uppercase text-center bg-[#f9f9f9] print:bg-transparent">
                              <th className="border border-black px-1.5 py-1 w-9">NO.</th>
                              <th className="border border-black px-2.5 py-1 text-left sm:text-center">KETERANGAN</th>
                              <th className="border border-black px-2 py-1 w-16 sm:w-20">JUMLAH</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">1</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">Sakit</td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center"></td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">2</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">Izin</td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center"></td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">3</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Tanpa Keterangan
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Kanan: KETERANGAN NILAI */}
                      <div className="col-span-6">
                        <table className="w-full border-collapse border border-black text-[11px] sm:text-[11.5px]">
                          <thead>
                            <tr>
                              <th
                                colSpan={3}
                                className="border border-black px-2 py-1.5 text-center font-bold uppercase bg-[#f9f9f9] print:bg-transparent"
                              >
                                KETERANGAN NILAI
                              </th>
                            </tr>
                            <tr className="font-bold uppercase text-center bg-[#f9f9f9] print:bg-transparent">
                              <th className="border border-black px-1.5 py-1 w-9">NO.</th>
                              <th className="border border-black px-2.5 py-1 text-left sm:text-center">KETERANGAN</th>
                              <th className="border border-black px-2 py-1 w-16 sm:w-20">NILAI</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">1</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Mumtaz (Sempurna)
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center">100</td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">2</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Jayyid Jiddan (Baik Sekali)
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center">91 - 99</td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">3</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Jayyid (Baik)
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center">81 - 90</td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">4</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Maqbul (Cukup)
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center">80</td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1.5 py-1 sm:py-1.5 text-center">5</td>
                              <td className="border border-black px-2.5 py-1 sm:py-1.5">
                                Rosib (Kurang)
                              </td>
                              <td className="border border-black px-2 py-1 sm:py-1.5 text-center">&lt; 80</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* CATATAN PENGUJI */}
                    <table className="w-full border-collapse border border-black text-[11px] sm:text-[11.5px]">
                      <thead>
                        <tr>
                          <th className="border border-black px-2.5 py-1 text-center font-bold uppercase bg-[#f9f9f9] print:bg-transparent">
                            CATATAN PENGUJI
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black px-3 py-2 sm:py-2.5 text-center">
                            {printingSantri.catatanGuru || "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* PERNYATAAN & TANDA TANGAN */}
                    <div className="pt-2 space-y-1 text-center text-[11.5px] sm:text-[12px]">
                      <div className="font-bold uppercase tracking-wide text-[11px] sm:text-[11.5px]">
                        SANTRI TERSEBUT DINYATAKAN LANJUT MATERI SELANJUTNYA
                      </div>
                      <div>Singosari, {tanggalCetakFormatted}</div>
                      <div>Mengetahui,</div>

                      <div className="grid grid-cols-3 pt-3 text-center">
                        <div className="flex flex-col items-center justify-between">
                          <span>Orang Tua / Wali,</span>
                          <div className="h-16 sm:h-20" />
                          <span className="inline-block border-b border-black w-36 sm:w-44">&nbsp;</span>
                        </div>

                        <div className="flex flex-col items-center justify-between">
                          <span>Pengajar</span>
                          <div className="h-16 sm:h-20" />
                          <span className="underline">{selectedPengajar}</span>
                        </div>

                        <div className="flex flex-col items-center justify-between">
                          <span>Kepala Madrasah</span>
                          <div className="h-16 sm:h-20" />
                          <span className="underline">{kepalaMadrasah}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER SLOGAN RAPORT (Tepat dekat batas kertas bagian bawah) */}
                  <div
                    id="printable-raport-footer"
                    style={{ pageBreakInside: "avoid", breakInside: "avoid", pageBreakBefore: "avoid", breakBefore: "avoid" }}
                    className="mt-auto pt-4 pb-1 text-center font-bold uppercase text-[10.5px] sm:text-[11px] leading-tight tracking-wide"
                  >
                    <div>MUHARIK AL QURAN PESANTREN ILMU AL QURAN</div>
                    <div>MENCETAK GENERASI QURANI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

interface EvaluationFormViewProps {
  activeSantri: SantriRecord;
  surahAyat: string;
  setSurahAyat: (val: string) => void;
  tipeSesi: string;
  setTipeSesi: (val: string) => void;
  catatanUstadz: string;
  setCatatanUstadz: (val: string) => void;
  errorCounters: ErrorCounters;
  totalErrors: number;
  calculatedScore: number;
  setCurrentStep: (step: StepType) => void;
  handleAdjustError: (key: keyof ErrorCounters, delta: number) => void;
  handleToggleMakhorijLetter: (letter: string) => void;
  handleAddQuickTag: (tag: string) => void;
  handleResetCounters: () => void;
  handleSaveEvaluation: () => void;
}

const HIJAIYAH_LETTERS = [
  "ء",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "و",
  "هـ",
  "ي"
];

export function EvaluationFormView({
  activeSantri,
  surahAyat,
  setSurahAyat,
  tipeSesi,
  setTipeSesi,
  catatanUstadz,
  setCatatanUstadz,
  errorCounters,
  totalErrors,
  calculatedScore,
  setCurrentStep,
  handleAdjustError,
  handleToggleMakhorijLetter,
  handleResetCounters,
  handleSaveEvaluation
}: EvaluationFormViewProps) {
  const [isMakhorijOpen, setIsMakhorijOpen] = React.useState(false);
  const selectedMakhorijLetters = errorCounters.makhorijHuruf || [];
  const materiList: {
    no: number;
    key: keyof ErrorCounters;
    title: string;
    bobot: number;
  }[] = [
    { no: 1, key: "makhorij", title: "Makhorijul Huruf", bobot: 3 },
    { no: 2, key: "shifat", title: "Shifatul Huruf", bobot: 2 },
    { no: 3, key: "ahkamulHuruf", title: "Ahkamul Huruf", bobot: 2 },
    { no: 4, key: "mad", title: "Ahkamul Mad", bobot: 2 },
    { no: 5, key: "waqaf", title: "Waqof wal Ibtida", bobot: 2 },
    { no: 6, key: "muroatulHuruf", title: "Muroatul Huruf wal Harokah", bobot: 2 },
    { no: 7, key: "miring", title: "Miring", bobot: 1 },
    { no: 8, key: "tawallud", title: "Tawallud", bobot: 1 },
    { no: 9, key: "kelancaran", title: "Kelancaran", bobot: 1 }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {activeSantri.nama}
            </h1>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">{activeSantri.nis}</span>
          </div>

          <button
            onClick={() => setCurrentStep("students")}
            className="sm:hidden px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Kembali</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 rounded-md px-3 py-1.5">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Total Kesalahan: </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{totalErrors}</span>
            </div>
            <span className="text-zinc-200 dark:text-zinc-700">|</span>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Nilai: </span>
              <span className="font-bold text-[#086288] dark:text-[#97D7FF] tabular-nums">{calculatedScore}</span>
            </div>
            <span className="text-zinc-200 dark:text-zinc-700">|</span>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
              {getPredikat(calculatedScore).split(" (")[0]}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("students")}
            className="hidden sm:flex px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* Assessment Session Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3.5 sm:p-5 border border-zinc-200 dark:border-zinc-800 space-y-4 sm:space-y-5">
        {/* Surah & Sesi Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Materi Terakhir (Patokan Kelas)
            </label>
            <input
              type="text"
              value={surahAyat || "-"}
              readOnly
              className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 cursor-default focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Kategori Sesi
            </label>
            <select
              value={tipeSesi}
              onChange={(e) => setTipeSesi(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Tasmi&apos; Ujian Resmi</option>
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Talaqqi Setoran Harian</option>
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Ujian Tengah Semester (UTS)</option>
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Ujian Akhir Semester (UAS)</option>
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Murojaah Mandiri Terbimbing</option>
            </select>
          </div>
        </div>

        {/* Error Logging Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Catatan Kesalahan Tajwid (9 Materi)
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Sesuai bobot penilaian standar pengaturan akademik
            </p>
          </div>

          {totalErrors > 0 && (
            <button
              onClick={handleResetCounters}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 9 Materi Error Counters in 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {materiList.map((item) => {
            const count = Number(errorCounters[item.key]) || 0;
            const jumlahPoin = count * item.bobot;
            const isMakhorij = item.key === "makhorij";

            return (
              <React.Fragment key={item.key}>
                <div
                  onClick={() => {
                    if (isMakhorij) setIsMakhorijOpen((prev) => !prev);
                  }}
                  className={`p-2.5 sm:p-3.5 rounded-lg border transition-colors bg-white dark:bg-zinc-800/60 flex flex-col justify-between ${
                    isMakhorij
                      ? isMakhorijOpen
                        ? "border-[#086288] dark:border-[#97D7FF] ring-1 ring-[#086288]/20 dark:ring-[#97D7FF]/20 cursor-pointer"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-[#086288]/60 dark:hover:border-[#97D7FF]/60 cursor-pointer"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.no}. {item.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300 tabular-nums shrink-0">
                        {item.bobot}x
                      </span>
                    </div>

                    {isMakhorij && selectedMakhorijLetters.length > 0 && (
                      <div
                        dir="rtl"
                        className="mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-700/60"
                      >
                        {selectedMakhorijLetters.map((letter) => (
                          <span
                            key={letter}
                            className="font-arabic inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#086288]/10 dark:bg-[#086288]/30 text-[#16324f] dark:text-[#97D7FF] border border-[#086288]/25 dark:border-[#97D7FF]/30 text-xl leading-none"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Counter & Jumlah Row */}
                  <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                      Jml:{" "}
                      <strong className={jumlahPoin > 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-800 dark:text-zinc-200"}>
                        {jumlahPoin}
                      </strong>
                    </span>

                    {isMakhorij ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums">
                        {count} huruf
                      </span>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleAdjustError(item.key, -1)}
                          disabled={count === 0}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 sm:w-7 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 tabular-nums">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustError(item.key, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-[#086288] text-white hover:bg-[#064a67] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel Pilihan Huruf Hijaiyah muncul tepat di bawah baris pertama saat kartu 1. Makhorijul Huruf ditekan */}
                {item.no === 2 && isMakhorijOpen && (
                  <div className="col-span-2 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Pilihan Huruf Hijaiyah (Makhorijul Huruf)
                        </h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Pilih huruf yang makhrajnya kurang tepat ({selectedMakhorijLetters.length}{" "}
                          huruf dipilih)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMakhorijOpen(false)}
                        className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>

                    <div
                      dir="rtl"
                      className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 pt-1"
                    >
                      {HIJAIYAH_LETTERS.map((letter) => {
                        const isSelected = selectedMakhorijLetters.includes(letter);
                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => handleToggleMakhorijLetter(letter)}
                            className={`font-arabic h-13 sm:h-14 rounded-2xl border flex items-center justify-center text-2xl sm:text-[28px] leading-none transition-all cursor-pointer select-none ${
                              isSelected
                                ? "bg-[#086288] text-white border-[#086288] shadow-xs"
                                : "bg-white dark:bg-zinc-800 text-[#16324f] dark:text-zinc-100 border-slate-200 dark:border-zinc-700 hover:border-[#086288]/60 dark:hover:border-[#97D7FF]/60 hover:bg-slate-50/80 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Notes / Catatan Ustadz */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Catatan Pembinaan Tilawah
          </label>
          <textarea
            rows={2}
            value={catatanUstadz}
            onChange={(e) => setCatatanUstadz(e.target.value)}
            placeholder="Tambahkan catatan khusus evaluasi bacaan atau target perbaikan..."
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-800"
          />
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={() => setCurrentStep("students")}
            className="w-full sm:w-auto px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
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
  );
}

