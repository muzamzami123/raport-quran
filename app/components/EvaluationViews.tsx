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
  Printer
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

  return (
    <div className="space-y-4 print:space-y-0 animate-fade-in">
      {/* Header Bar */}
      <div className="no-print flex items-center justify-between gap-2 pb-3 border-b border-zinc-200">
        <h1 className="text-sm sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
          {selectedExam.namaUjian} &bull; {selectedExam.tanggalUjian}
        </h1>

        <button
          onClick={() => setCurrentStep("exams")}
          className="px-2.5 sm:px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Student Table Card */}
      <div className="no-print bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-900">Daftar Santri</h2>
            <span className="text-xs text-zinc-500">
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
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
              <tr>
                <th className="px-3 sm:px-4 py-2.5 text-center w-9 sm:w-12">No</th>
                <th className="px-3 sm:px-4 py-2.5">Nama Santri</th>
                <th className="hidden sm:table-cell px-4 py-2.5 w-44">Status / Nilai</th>
                <th className="px-3 sm:px-4 py-2.5 text-right w-28 sm:w-44">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    Tidak ada santri yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri, index) => {
                  const isCompleted = santri.status === "Selesai";
                  return (
                    <tr key={santri.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-zinc-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="font-medium text-zinc-900 leading-snug">{santri.nama}</div>
                        <div className="sm:hidden text-[11px] text-zinc-500 mt-0.5">
                          {isCompleted ? (
                            <span className="font-semibold text-zinc-700 tabular-nums">
                              Nilai {santri.nilai} ({santri.predikat?.split(" (")[0]})
                            </span>
                          ) : (
                            <span className="text-zinc-400">Belum diuji</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        {isCompleted ? (
                          <div className="text-zinc-700">
                            <span className="font-semibold text-zinc-900 tabular-nums">
                              {santri.nilai}
                            </span>{" "}
                            <span className="text-zinc-500">
                              ({santri.predikat?.split(" (")[0]})
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">Belum diuji</span>
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
                              className="w-full sm:w-auto px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Cetak Raport Tilawah"
                            >
                              <Printer className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span>Cetak</span>
                            </button>
                            <button
                              onClick={() => handleOpenEvaluation(santri)}
                              className="w-full sm:w-auto px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                              title="Uji Ulang Santri"
                            >
                              <RotateCcw className="w-3 h-3 text-zinc-500 shrink-0" />
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
                  min-height: 98vh !important;
                  display: flex !important;
                  flex-direction: column !important;
                  padding: 14mm 18mm 6mm 18mm !important;
                  border: none !important;
                }
                #printable-raport-footer {
                  margin-top: auto !important;
                  padding-top: 12px !important;
                }
              }
            `}</style>
            <div className="print-modal-card bg-white rounded-lg max-w-3xl w-full border border-zinc-300 shadow-2xl p-4 sm:p-6 space-y-4 my-auto max-h-[95vh] overflow-y-auto">
              {/* Toolbar Pengaturan Cetak (Tidak ikut tercetak saat window.print) */}
              <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Pratinjau Cetak Raport (Ukuran Legal)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Pilih nama pengajar yang ditampilkan pada raport sebelum mencetak
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <label className="text-zinc-600 font-medium whitespace-nowrap">
                      Pengajar:
                    </label>
                    <select
                      value={selectedPengajar}
                      onChange={(e) => setSelectedPengajar(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-zinc-300 bg-white text-zinc-900 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#086288]"
                    >
                      {teacherOptions.map((guru) => (
                        <option key={guru} value={guru}>
                          {guru}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-md bg-[#086288] hover:bg-[#064a67] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak (Legal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintingSantri(null)}
                    className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-medium cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* LEMBAR RAPORT RESMI */}
              <div
                id="printable-raport"
                style={{ fontFamily: 'Cambria, "Times New Roman", Times, serif' }}
                className="bg-white text-black p-4 sm:p-6 border border-zinc-300 text-[12px] leading-snug space-y-3"
              >
                {/* KOP SURAT */}
                <div className="relative flex items-center justify-center pb-2.5 border-b-4 border-double border-black">
                  <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2">
                    <Image
                      src="/logo.png"
                      alt="Logo PIQ"
                      width={68}
                      height={68}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <div className="text-center px-16 sm:px-20">
                    <div className="font-bold text-[15px] sm:text-[17px] uppercase tracking-wide leading-tight">
                      LAPORAN HASIL BELAJAR
                    </div>
                    <div className="font-bold text-[15px] sm:text-[17px] uppercase tracking-wide leading-tight">
                      MADRASAH DINIYAH
                    </div>
                    <div className="font-bold text-[15px] sm:text-[17px] uppercase tracking-wide leading-tight">
                      PESANTREN ILMU AL QURAN
                    </div>
                    <div className="text-[11px] font-normal mt-0.5">
                      Jl. Raya Singosari 107 Telp. (0341) 458340
                    </div>
                  </div>
                </div>

                {/* JUDUL SUB-KOP */}
                <div className="text-center font-bold text-[13px] sm:text-[14px] uppercase tracking-wide py-0.5">
                  KELAS AL QURAN
                </div>

                {/* IDENTITAS SANTRI (2 KOLOM) */}
                <div className="grid grid-cols-2 gap-4 text-[12px] pt-0.5">
                  <table className="w-full">
                    <tbody>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 w-28 whitespace-nowrap">Nama</td>
                        <td className="py-0.5 w-3">:</td>
                        <td className="py-0.5">{printingSantri.nama}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 whitespace-nowrap">Kelas Diniyah</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{printingSantri.jenjang || "1"}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 whitespace-nowrap">Semester</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{semesterLabel}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full">
                    <tbody>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 w-28 whitespace-nowrap">Materi Terakhir</td>
                        <td className="py-0.5 w-3">:</td>
                        <td className="py-0.5 uppercase">
                          {selectedClass.materiTerakhir || printingSantri.surahDibaca || "-"}
                        </td>
                      </tr>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 whitespace-nowrap">Pengajar</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{selectedPengajar}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="font-bold py-0.5 whitespace-nowrap">Kelas Al Quran</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{selectedClass.name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TABEL PENILAIAN 9 MATERI */}
                <table className="w-full border-collapse border border-black text-[12px]">
                  <thead>
                    <tr className="font-bold uppercase text-center">
                      <th className="border border-black px-2 py-1.5 w-10">NO.</th>
                      <th className="border border-black px-3 py-1.5">MATERI</th>
                      <th className="border border-black px-2 py-1.5 w-32">KESALAHAN</th>
                      <th className="border border-black px-2 py-1.5 w-24">BOBOT</th>
                      <th className="border border-black px-2 py-1.5 w-28">JUMLAH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.no}>
                        <td className="border border-black px-2 py-1 text-center">{r.no}</td>
                        <td className="border border-black px-2.5 py-1">{r.materi}</td>
                        <td className="border border-black px-2 py-1 text-center">{r.salah}</td>
                        <td className="border border-black px-2 py-1 text-center">{r.bobot} x</td>
                        <td className="border border-black px-2 py-1 text-center">
                          {r.salah * r.bobot}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-black px-3 py-1 text-center font-bold uppercase"
                      >
                        TOTAL KESALAHAN
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {totalSalahPoin}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-black px-3 py-1 text-center font-bold uppercase"
                      >
                        NILAI
                      </td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        {finalScore}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-black px-3 py-1 text-center font-bold uppercase"
                      >
                        PREDIKAT
                      </td>
                      <td className="border border-black px-2 py-1 text-center font-bold uppercase">
                        {finalPredikat}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* TABEL KEAKTIFAN SANTRI & KETERANGAN NILAI */}
                <div className="grid grid-cols-12 gap-4 items-start pt-1">
                  {/* Kiri: KEAKTIFAN SANTRI */}
                  <div className="col-span-6">
                    <table className="w-full border-collapse border border-black text-[11px]">
                      <thead>
                        <tr>
                          <th
                            colSpan={3}
                            className="border border-black px-2 py-1 text-center font-bold uppercase"
                          >
                            KEAKTIFAN SANTRI
                          </th>
                        </tr>
                        <tr className="font-bold uppercase text-center">
                          <th className="border border-black px-1.5 py-1 w-9">NO.</th>
                          <th className="border border-black px-2 py-1">KETERANGAN</th>
                          <th className="border border-black px-2 py-1 w-16">JUMLAH</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black px-1.5 py-1 text-center">1</td>
                          <td className="border border-black px-2 py-1 text-center">Sakit</td>
                          <td className="border border-black px-2 py-1 text-center"></td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-1 text-center">2</td>
                          <td className="border border-black px-2 py-1 text-center">Izin</td>
                          <td className="border border-black px-2 py-1 text-center"></td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-1 text-center">3</td>
                          <td className="border border-black px-2 py-1 text-center">
                            Tanpa Keterangan
                          </td>
                          <td className="border border-black px-2 py-1 text-center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Kanan: KETERANGAN NILAI */}
                  <div className="col-span-6">
                    <table className="w-full border-collapse border border-black text-[11px]">
                      <thead>
                        <tr>
                          <th
                            colSpan={3}
                            className="border border-black px-2 py-1 text-center font-bold uppercase"
                          >
                            KETERANGAN NILAI
                          </th>
                        </tr>
                        <tr className="font-bold uppercase text-center">
                          <th className="border border-black px-1.5 py-1 w-9">NO.</th>
                          <th className="border border-black px-2 py-1">KETERANGAN</th>
                          <th className="border border-black px-2 py-1 w-16">NILAI</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 text-center">1</td>
                          <td className="border border-black px-2 py-0.5 text-center">
                            Mumtaz (Sempurna)
                          </td>
                          <td className="border border-black px-2 py-0.5 text-center">100</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 text-center">2</td>
                          <td className="border border-black px-2 py-0.5 text-center">
                            Jayyid Jiddan (Baik Sekali)
                          </td>
                          <td className="border border-black px-2 py-0.5 text-center">91 - 99</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 text-center">3</td>
                          <td className="border border-black px-2 py-0.5 text-center">
                            Jayyid (Baik)
                          </td>
                          <td className="border border-black px-2 py-0.5 text-center">81 - 90</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 text-center">4</td>
                          <td className="border border-black px-2 py-0.5 text-center">
                            Maqbul (Cukup)
                          </td>
                          <td className="border border-black px-2 py-0.5 text-center">80</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 text-center">5</td>
                          <td className="border border-black px-2 py-0.5 text-center">
                            Rosib (Kurang)
                          </td>
                          <td className="border border-black px-2 py-0.5 text-center">&lt; 80</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CATATAN PENGUJI */}
                <table className="w-full border-collapse border border-black text-[12px]">
                  <thead>
                    <tr>
                      <th className="border border-black px-3 py-1 text-center font-bold uppercase">
                        CATATAN PENGUJI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black px-4 py-5 text-center">
                        {printingSantri.catatanGuru || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* PERNYATAAN & TANDA TANGAN */}
                <div className="pt-2 space-y-1 text-center text-[12px]">
                  <div className="font-bold uppercase tracking-wide text-[11px]">
                    SANTRI TERSEBUT DINYATAKAN LANJUT MATERI SELANJUTNYA
                  </div>
                  <div>Singosari, {tanggalCetakFormatted}</div>
                  <div>Mengetahui,</div>

                  <div className="grid grid-cols-3 pt-1 text-center">
                    <div className="flex flex-col items-center justify-between">
                      <span>Orang Tua / Wali,</span>
                      <div className="h-16" />
                      <span className="inline-block border-b border-black w-36">&nbsp;</span>
                    </div>

                    <div className="flex flex-col items-center justify-between">
                      <span>Pengajar</span>
                      <div className="h-16" />
                      <span className="underline">{selectedPengajar}</span>
                    </div>

                    <div className="flex flex-col items-center justify-between">
                      <span>Kepala Madrasah</span>
                      <div className="h-16" />
                      <span className="underline">{kepalaMadrasah}</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER SLOGAN RAPORT */}
                <div
                  id="printable-raport-footer"
                  className="pt-8 text-center font-bold uppercase text-[11px] leading-snug"
                >
                  <div>MUHARIK AL QURAN PESANTREN ILMU AL QURAN</div>
                  <div>MENCETAK GENERASI QURANI</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-zinc-200">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
              {activeSantri.nama}
            </h1>
            <span className="text-xs text-zinc-400 tabular-nums shrink-0">{activeSantri.nis}</span>
          </div>

          <button
            onClick={() => setCurrentStep("students")}
            className="sm:hidden px-2.5 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
            <span>Kembali</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-xs border border-zinc-200 bg-white rounded-md px-3 py-1.5">
            <div>
              <span className="text-zinc-500">Total Kesalahan: </span>
              <span className="font-semibold text-zinc-900 tabular-nums">{totalErrors}</span>
            </div>
            <span className="text-zinc-200">|</span>
            <div>
              <span className="text-zinc-500">Nilai: </span>
              <span className="font-bold text-[#086288] tabular-nums">{calculatedScore}</span>
            </div>
            <span className="text-zinc-200">|</span>
            <div className="font-semibold text-zinc-800">
              {getPredikat(calculatedScore).split(" (")[0]}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("students")}
            className="hidden sm:flex px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 bg-white text-zinc-700 text-xs font-medium transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* Assessment Session Form */}
      <div className="bg-white rounded-lg p-3.5 sm:p-5 border border-zinc-200 space-y-4 sm:space-y-5">
        {/* Surah & Sesi Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-zinc-200">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Materi Terakhir (Patokan Kelas)
            </label>
            <input
              type="text"
              value={surahAyat || "-"}
              readOnly
              className="w-full px-3 py-2 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 bg-zinc-50 cursor-default focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Kategori Sesi
            </label>
            <select
              value={tipeSesi}
              onChange={(e) => setTipeSesi(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#086288] focus:border-[#086288] transition-all bg-white text-zinc-800"
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
            <h3 className="text-xs font-semibold text-zinc-900">
              Catatan Kesalahan Tajwid (9 Materi)
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Sesuai bobot penilaian standar pengaturan akademik
            </p>
          </div>

          {totalErrors > 0 && (
            <button
              onClick={handleResetCounters}
              className="text-xs text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium cursor-pointer"
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
                  className={`p-2.5 sm:p-3.5 rounded-lg border transition-colors bg-white flex flex-col justify-between ${
                    isMakhorij
                      ? isMakhorijOpen
                        ? "border-[#086288] ring-1 ring-[#086288]/20 cursor-pointer"
                        : "border-zinc-200 hover:border-[#086288]/60 cursor-pointer"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-[11px] sm:text-xs font-bold text-zinc-900 leading-snug">
                        {item.no}. {item.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 tabular-nums shrink-0">
                        {item.bobot}x
                      </span>
                    </div>

                    {isMakhorij && selectedMakhorijLetters.length > 0 && (
                      <div
                        dir="rtl"
                        className="mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-100"
                      >
                        {selectedMakhorijLetters.map((letter) => (
                          <span
                            key={letter}
                            className="font-arabic inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#086288]/10 text-[#16324f] border border-[#086288]/25 text-xl leading-none"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Counter & Jumlah Row */}
                  <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-100">
                    <span className="text-[10px] sm:text-[11px] text-zinc-500 tabular-nums">
                      Jml:{" "}
                      <strong className={jumlahPoin > 0 ? "text-rose-600" : "text-zinc-800"}>
                        {jumlahPoin}
                      </strong>
                    </span>

                    {isMakhorij ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-600 tabular-nums">
                        {count} huruf
                      </span>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center border border-zinc-300 rounded overflow-hidden shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleAdjustError(item.key, -1)}
                          disabled={count === 0}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 sm:w-7 text-center text-xs font-bold text-zinc-900 tabular-nums">
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
                  <div className="col-span-2 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900">
                          Pilihan Huruf Hijaiyah (Makhorijul Huruf)
                        </h5>
                        <p className="text-[11px] text-zinc-500">
                          Pilih huruf yang makhrajnya kurang tepat ({selectedMakhorijLetters.length}{" "}
                          huruf dipilih)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMakhorijOpen(false)}
                        className="px-2.5 py-1 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-[11px] font-medium text-zinc-700 cursor-pointer"
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
                                : "bg-white text-[#16324f] border-slate-200 hover:border-[#086288]/60 hover:bg-slate-50/80"
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
  );
}

