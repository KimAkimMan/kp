import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Program } from "../types";
import { currency, quantity, remBudget, remTarget } from "./helpers";

const margin = 14;

const displayValue = (value?: string | number | null) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const createFilename = (program: Program) => {
  const slug = program.nama
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `Detail-Kegiatan-${slug || program.id}.pdf`;
};

export const downloadActivityPdf = (program: Program, generatedBy: string) => {
  const pdf = new jsPDF({ format: "a4", unit: "mm", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString("id-ID");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(20, 57, 101);
  pdf.text("LAPORAN DETAIL KEGIATAN", margin, 18);

  pdf.setFontSize(12);
  const titleLines = pdf.splitTextToSize(program.nama, pageWidth - margin * 2);
  pdf.text(titleLines, margin, 26);

  let nextY = 26 + titleLines.length * 5 + 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 95, 110);
  pdf.text(`Kode: ${displayValue(program.kode)}  |  Kategori: ${displayValue(program.kategori)}`, margin, nextY);
  pdf.text(`Dicetak oleh: ${displayValue(generatedBy)}  |  ${generatedAt}`, margin, nextY + 5);
  nextY += 10;

  autoTable(pdf, {
    startY: nextY,
    head: [["Informasi Kegiatan", "Detail"]],
    body: [
      ["Status", displayValue(program.status)],
      ["Target awal", quantity(program.targetAwal, program.satuan)],
      ["Target berjalan", quantity(program.target, program.satuan)],
      ["Realisasi terakhir", quantity(program.realisasi, program.satuan)],
      ["Sisa target", quantity(remTarget(program), program.satuan)],
      ["Periode", `Tahun ${displayValue(program.periode)}`],
      ["Waktu pelaksanaan", displayValue(program.jadwal || "Sesuai periode")],
      ["Penanggung jawab", displayValue(program.pj)],
      ["Lokasi rinci", displayValue(program.lokasi)],
      ["Penyedia CV/PT", displayValue(program.penyedia)],
      ["Nomor kontrak / SPK", displayValue(program.noKontrak)],
      ["Pagu anggaran", currency(program.pagu)],
      ["Penggunaan anggaran", currency(program.penggunaan)],
      ["Sisa anggaran", currency(remBudget(program))],
      ["Update terakhir", displayValue(program.update)],
      ["Keterangan terakhir", displayValue(program.catatan)],
    ],
    margin: { left: margin, right: margin, bottom: 18 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, overflow: "linebreak" },
    headStyles: { fillColor: [30, 78, 140], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [246, 249, 251] },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } },
  });

  const addSection = (
    title: string,
    headers: string[],
    rows: string[][],
    emptyMessage: string,
  ) => {
    const sectionY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? nextY;
    let titleY = sectionY + 9;
    if (titleY + 15 > pageHeight - 18) {
      pdf.addPage();
      titleY = margin;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(20, 57, 101);
    pdf.text(title, margin, titleY);

    autoTable(pdf, {
      startY: titleY + 3,
      head: [headers],
      body: rows.length > 0 ? rows : [[emptyMessage, ...headers.slice(1).map(() => "")]],
      margin: { left: margin, right: margin, bottom: 18 },
      styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: [30, 78, 140], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [246, 249, 251] },
    });
  };

  addSection(
    "Riwayat Progres",
    ["Tanggal", "Tahap pekerjaan", "Realisasi", "Keterangan", "Dokumentasi"],
    (program.histories ?? []).map((history) => [
      displayValue(history.tanggal),
      displayValue(history.tahap),
      quantity(history.nilai, history.satuan),
      displayValue(history.keterangan),
      history.foto
        ? `${history.fotoUrls?.length || (history.fotoUrl ? 1 : 0) || "Ada"} foto`
        : "-",
    ]),
    "Belum ada riwayat progres.",
  );

  addSection(
    "Riwayat Penggunaan Biaya",
    ["Tanggal", "Uraian transaksi", "Nominal", "Input oleh", "Bukti"],
    (program.costs ?? []).map((cost) => [
      displayValue(cost.tanggal),
      displayValue(cost.uraian),
      currency(cost.nominal),
      displayValue(cost.input),
      cost.bukti ? "Bukti tersedia" : "-",
    ]),
    "Belum ada transaksi penggunaan biaya.",
  );

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 115, 130);
    pdf.text(`Halaman ${page} dari ${pageCount}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = createFilename(program);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
