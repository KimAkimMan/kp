import ExcelJS from "exceljs";
import {
  AlignmentType,
  Document,
  PageOrientation,
  Paragraph,
  Packer,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Program } from "../types";
import {
  calculateSummary,
  currency,
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
  quantity,
} from "./helpers";

export type ReportExportOptions = {
  programs: Program[];
  yearFilter: string;
  categoryFilter: string;
  generatedBy: string;
};

type ReportColumn = {
  header: string;
  value: (program: Program) => string | number;
  display: (program: Program) => string;
  width: number;
};

const reportTitle =
  "LAPORAN CAPAIAN KEGIATAN DAN REALISASI FISIK & KEUANGAN";

const reportColumns: ReportColumn[] = [
  { header: "Tahun Anggaran", value: getProgramYear, display: getProgramYear, width: 14 },
  { header: "Kode Kegiatan", value: (p) => p.kode, display: (p) => p.kode, width: 12 },
  { header: "Nama Kegiatan", value: (p) => p.nama, display: (p) => p.nama, width: 32 },
  { header: "Kategori", value: (p) => p.kategori, display: (p) => p.kategori, width: 18 },
  { header: "Desa / Kelurahan", value: getProgramDesa, display: getProgramDesa, width: 20 },
  { header: "Kecamatan", value: getProgramKecamatan, display: getProgramKecamatan, width: 18 },
  { header: "Penanggung Jawab", value: (p) => p.operatorPengelola || "", display: (p) => p.operatorPengelola || "-", width: 22 },
  {
    header: "Penyedia",
    value: (p) => p.penyedia || "",
    display: (p) => p.penyedia || "-",
    width: 24,
  },
  {
    header: "No. Kontrak",
    value: (p) => p.noKontrak || "",
    display: (p) => p.noKontrak || "-",
    width: 18,
  },
  {
    header: "Pagu Anggaran (Rp)",
    value: (p) => p.pagu,
    display: (p) => currency(p.pagu),
    width: 20,
  },
  {
    header: "Penggunaan Biaya (Rp)",
    value: (p) => p.penggunaan,
    display: (p) => currency(p.penggunaan),
    width: 22,
  },
  {
    header: "Sisa Anggaran (Rp)",
    value: (p) => p.pagu - p.penggunaan,
    display: (p) => currency(p.pagu - p.penggunaan),
    width: 20,
  },
  {
    header: "Target",
    value: (p) => p.target,
    display: (p) => quantity(p.target, p.satuan),
    width: 14,
  },
  {
    header: "Realisasi",
    value: (p) => p.realisasi,
    display: (p) => quantity(p.realisasi, p.satuan),
    width: 14,
  },
  { header: "Satuan", value: (p) => p.satuan, display: (p) => p.satuan, width: 12 },
  { header: "Status", value: (p) => p.status, display: (p) => p.status, width: 20 },
  { header: "Update Terakhir", value: (p) => p.update, display: (p) => p.update, width: 18 },
];

const getFilterDescription = (options: ReportExportOptions) =>
  `Tahun: ${options.yearFilter || "Semua tahun"} | Kategori: ${
    options.categoryFilter || "Semua kategori"
  }`;

const getGeneratedAt = () => new Date().toLocaleString("id-ID");

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadReportExcel = async (options: ReportExportOptions) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = options.generatedBy;
  workbook.subject = reportTitle;
  workbook.title = "Laporan Capaian Permukiman Kabupaten Kuningan";

  const worksheet = workbook.addWorksheet("Laporan Capaian", {
    views: [{ state: "frozen", ySplit: 6 }],
  });
  worksheet.addRow([reportTitle]);
  worksheet.mergeCells(1, 1, 1, reportColumns.length);
  worksheet.getRow(1).font = { bold: true, size: 16, color: { argb: "FF143965" } };
  worksheet.addRow([getFilterDescription(options)]);
  worksheet.addRow([`Dicetak oleh: ${options.generatedBy} | Waktu: ${getGeneratedAt()}`]);

  const summary = calculateSummary(options.programs);
  worksheet.addRow(["Total kegiatan", options.programs.length]);
  worksheet.addRow([
    "Pagu total",
    summary.pagu,
    "Penggunaan",
    summary.penggunaan,
    "Sisa anggaran",
    summary.sisaAnggaran,
  ]);
  worksheet.addRow([]);
  worksheet.addRow(reportColumns.map((column) => column.header));

  const headerRowNumber = worksheet.rowCount;
  const headerRow = worksheet.getRow(headerRowNumber);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E4E8C" },
  };
  headerRow.alignment = { vertical: "middle", wrapText: true };
  headerRow.height = 32;

  options.programs.forEach((program) => {
    worksheet.addRow(reportColumns.map((column) => column.value(program)));
  });

  worksheet.columns = reportColumns.map((column) => ({ width: column.width }));
  [10, 11, 12].forEach((column) => {
    worksheet.getColumn(column).numFmt = '"Rp" #,##0';
  });
  [13, 14].forEach((column) => {
    worksheet.getColumn(column).numFmt = "#,##0.##";
  });
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: worksheet.rowCount, column: reportColumns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    "Laporan-Capaian-Permukiman-Kuningan.xlsx",
    new Blob([new Uint8Array(buffer).buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
};

export const downloadReportWord = async (options: ReportExportOptions) => {
  const summary = calculateSummary(options.programs);
  const tableWidth = 23000;
  const totalColumnWidth = reportColumns.reduce((total, column) => total + column.width, 0);
  let assignedWidth = 0;
  const columnWidths = reportColumns.map((column, index) => {
    const width =
      index === reportColumns.length - 1
        ? tableWidth - assignedWidth
        : Math.floor((tableWidth * column.width) / totalColumnWidth);
    assignedWidth += width;
    return width;
  });

  const createCell = (text: string, columnIndex: number, isHeader = false) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: isHeader,
              color: isHeader ? "FFFFFF" : "18304B",
              size: isHeader ? 11 : 9,
            }),
          ],
        }),
      ],
      width: { size: columnWidths[columnIndex], type: WidthType.DXA },
      margins: { top: 20, right: 24, bottom: 20, left: 24 },
      ...(isHeader ? { shading: { fill: "1E4E8C" } } : {}),
    });

  const rows = [
    new TableRow({
      tableHeader: true,
      children: reportColumns.map((column, index) =>
        createCell(column.header, index, true),
      ),
    }),
    ...options.programs.map(
      (program) =>
        new TableRow({
          cantSplit: true,
          children: reportColumns.map((column, index) =>
            createCell(column.display(program), index),
          ),
        }),
    ),
  ];

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 23811,
              height: 16838,
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: { top: 360, right: 360, bottom: 360, left: 360 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: reportTitle, bold: true, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN KABUPATEN KUNINGAN",
                bold: true,
                size: 16,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${getFilterDescription(options)} | Total kegiatan: ${options.programs.length}`,
                size: 14,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Pagu: ${currency(summary.pagu)} | Penggunaan: ${currency(
                  summary.penggunaan,
                )} | Sisa anggaran: ${currency(summary.sisaAnggaran)}`,
                size: 14,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Dicetak oleh: ${options.generatedBy} | Waktu: ${getGeneratedAt()}`,
                size: 12,
              }),
            ],
          }),
          new Table({
            rows,
            width: { size: tableWidth, type: WidthType.DXA },
            columnWidths,
          }),
        ],
      },
    ],
  });

  downloadBlob(
    "Laporan-Capaian-Permukiman-Kuningan.docx",
    await Packer.toBlob(document),
  );
};

export const downloadReportPdf = (options: ReportExportOptions) => {
  const summary = calculateSummary(options.programs);
  const pdf = new jsPDF({
    orientation: "landscape",
    format: "a3",
    unit: "mm",
    compress: true,
  });

  autoTable(pdf, {
    head: [reportColumns.map((column) => column.header)],
    body: options.programs.map((program) =>
      reportColumns.map((column) => column.display(program)),
    ),
    startY: 31,
    margin: { top: 31, right: 9, bottom: 13, left: 9 },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: [0, 1],
    showHead: "everyPage",
    styles: {
      font: "helvetica",
      fontSize: 5.5,
      cellPadding: 1.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 78, 140],
      textColor: [255, 255, 255],
      fontSize: 5.5,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [246, 249, 251] },
    didDrawPage: (data) => {
      pdf.setFontSize(10);
      pdf.setTextColor(20, 57, 101);
      pdf.text(reportTitle, 9, 8);
      pdf.setFontSize(7);
      pdf.setTextColor(80, 95, 110);
      pdf.text(
        `${getFilterDescription(options)} | Total kegiatan: ${options.programs.length}`,
        9,
        14,
      );
      pdf.text(
        `Pagu: ${currency(summary.pagu)} | Penggunaan: ${currency(
          summary.penggunaan,
        )} | Sisa: ${currency(summary.sisaAnggaran)}`,
        9,
        19,
      );
      pdf.text(
        `Dicetak oleh: ${options.generatedBy} | ${getGeneratedAt()}`,
        9,
        24,
      );
      pdf.text(
        `Halaman ${data.pageNumber}`,
        pdf.internal.pageSize.getWidth() - 9,
        pdf.internal.pageSize.getHeight() - 5,
        { align: "right" },
      );
    },
  });

  downloadBlob("Laporan-Capaian-Permukiman-Kuningan.pdf", pdf.output("blob"));
};
