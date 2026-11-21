import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Program } from "@/app/types";
import { downloadActivityPdf } from "@/app/utils/activity-export";

const program: Program = {
  id: 12,
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

describe("activity PDF export", () => {
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
      return "blob:activity";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("downloads a valid PDF scoped to the selected activity", async () => {
    downloadActivityPdf(program, "Admin");

    expect(downloadLink.download).toBe("Detail-Kegiatan-peningkatan-jalan-desa.pdf");
    expect(downloadLink.click).toHaveBeenCalledOnce();
    expect(downloadedBlob?.type).toBe("application/pdf");
    expect(new TextDecoder().decode(await downloadedBlob!.arrayBuffer()).slice(0, 5)).toBe("%PDF-");
  });
});
