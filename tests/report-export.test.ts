import ExcelJS from "exceljs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Program } from "@/app/types";
import {
  downloadReportExcel,
  downloadReportPdf,
  downloadReportWord,
} from "@/app/utils/report-export";

const program: Program = {
  id: 1,
  kode: "JLN-001",
  nama: "Peningkatan Jalan Desa",
  kategori: "Jalan",
  lokasi: "Desa Mekar",
  periode: "2025",
  satuan: "meter",
  targetAwal: 100,
  target: 100,
  realisasi: 60,
  status: "Sedang Dikerjakan",
  update: "2025-03-01",
  sumber: "APBD",
  catatan: "",
  pagu: 100000,
  penggunaan: 60000,
  histories: [],
  costs: [],
};

const options = {
  programs: [program],
  yearFilter: "2025",
  categoryFilter: "Jalan",
  generatedBy: "Admin",
};

describe("report exports", () => {
  let downloadedBlob: Blob | undefined;
  let downloadLink: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    downloadedBlob = undefined;
    downloadLink = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => downloadLink),
      body: { appendChild: vi.fn() },
    });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      if (blob instanceof Blob) downloadedBlob = blob;
      return "blob:report";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a real xlsx containing only the supplied filtered programs", async () => {
    await downloadReportExcel(options);

    expect(downloadLink.download).toBe(
      "Laporan-Capaian-Permukiman-Kuningan.xlsx",
    );
    expect(downloadedBlob?.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await downloadedBlob!.arrayBuffer());
    const worksheet = workbook.getWorksheet("Laporan Capaian");

    expect(worksheet?.getCell("C8").value).toBe("Peningkatan Jalan Desa");
    expect(worksheet?.getCell("J8").value).toBe(100000);
    expect(worksheet?.rowCount).toBe(8);
  });

  it("creates a Word document download", async () => {
    await downloadReportWord(options);

    expect(downloadLink.download).toBe(
      "Laporan-Capaian-Permukiman-Kuningan.docx",
    );
    expect(downloadedBlob?.type).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(downloadedBlob?.size).toBeGreaterThan(0);
    expect(new Uint8Array(await downloadedBlob!.arrayBuffer()).slice(0, 2)).toEqual(
      new Uint8Array([0x50, 0x4b]),
    );
  });

  it("creates a PDF file instead of opening the print dialog", async () => {
    downloadReportPdf(options);

    expect(downloadLink.download).toBe(
      "Laporan-Capaian-Permukiman-Kuningan.pdf",
    );
    expect(downloadedBlob?.type).toBe("application/pdf");
    const pdfBytes = new Uint8Array(await downloadedBlob!.arrayBuffer());
    expect(new TextDecoder().decode(pdfBytes.slice(0, 5))).toBe("%PDF-");
  });
});
