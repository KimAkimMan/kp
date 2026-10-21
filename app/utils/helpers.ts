import { Program, ProgramSummary, User } from "../types";

export const currency = (n: number | string | null | undefined): string => {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Number(n) || 0);
};

export const quantity = (
  n: number | string | null | undefined,
  unit?: string
): string => {
  let num = Number(n) || 0;
  const rawUnit = String(unit ?? "").trim().toLowerCase();
  if ((rawUnit === "km" || rawUnit.includes("kilometer")) && num > 0 && num <= 50) {
    num = num * 1000;
  }
  const val = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(num);
  const sym = formatUnitSymbol(unit);
  return sym ? `${val} ${sym}` : val;
};

export const remTarget = (p: Program): number => {
  return Math.max(0, (p.target ?? 0) - (p.realisasi ?? 0));
};

export const remBudget = (p: Program): number => {
  return Math.max(0, (p.pagu ?? 0) - (p.penggunaan ?? 0));
};

export const formatUnitSymbol = (unit?: string | null): string => {
  if (!unit) return "";
  const raw = String(unit).trim();
  const key = raw.toLowerCase();
  if (
    key === "km" ||
    key.includes("kilometer") ||
    key === "m" ||
    key === "meter" ||
    key === "m'" ||
    key.includes("meter lari")
  ) {
    return "m'";
  }
  if (key.includes("meter persegi") || key === "m²" || key === "m2") return "m2";
  if (key.includes("meter kubik") || key === "m³" || key === "m3") return "m3";
  if (key === "unit") return "Unit";
  if (key === "ha" || key.includes("hektar")) return "ha";
  if (key === "titik") return "Titik";
  const match = raw.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return raw;
};

export const normalizeUnitLabel = (unit?: string | null): string => {
  const sym = formatUnitSymbol(unit);
  return sym || "Satuan tidak ditentukan";
};

export const calculateSummary = (list: Program[]): ProgramSummary => {
  const groups = new Map<
    string,
    { satuan: string; target: number; realisasi: number; sisa: number }
  >();

  list.forEach((p) => {
    const satuan = normalizeUnitLabel(p.satuan);
    if (!groups.has(satuan)) {
      groups.set(satuan, { satuan, target: 0, realisasi: 0, sisa: 0 });
    }
    const g = groups.get(satuan)!;
    g.target += Number(p.target) || 0;
    g.realisasi += Number(p.realisasi) || 0;
    g.sisa += remTarget(p);
  });

  const volume = Array.from(groups.values()).map((g) => ({
    ...g,
    persentase: g.target > 0 ? (g.realisasi / g.target) * 100 : 0,
  }));

  const pagu = list.reduce((a, x) => a + (Number(x.pagu) || 0), 0);
  const penggunaan = list.reduce((a, x) => a + (Number(x.penggunaan) || 0), 0);
  const sisaAnggaran = list.reduce((a, p) => a + remBudget(p), 0);

  return {
    volume,
    pagu,
    penggunaan,
    sisaAnggaran,
    berpagu: list.filter((p) => (p.pagu || 0) > 0).length,
    tanpaPagu: list.filter((p) => !p.pagu).length,
  };
};

export const statusCount = (
  list: Program[],
  status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan"
): number => {
  return list.filter((p) => p.status === status).length;
};

export const isRoadCategory = (category?: string | null): boolean => {
  return /jalan/i.test(category || "");
};

export const operatorAssignment = (p: Program) => {
  if (!p) return null;
  const rawId = p.operatorPengelolaId;
  const rawName = p.operatorPengelola;
  const valid = (v: unknown) =>
    v !== null &&
    v !== undefined &&
    String(v).trim() !== "" &&
    ![
      "undefined",
      "null",
      "belum ditugaskan",
      "belum ada penanggung jawab",
      "belum ditentukan",
      "-",
      "none",
    ].includes(String(v).trim().toLowerCase());

  if (valid(rawId)) {
    return {
      id: String(rawId).trim(),
      name: valid(rawName) ? String(rawName).trim() : null,
      explicit: true,
      explicitId: true,
    };
  }
  if (valid(rawName)) {
    return {
      id: null,
      name: String(rawName).trim(),
      explicit: true,
      explicitId: false,
    };
  }
  if (valid(p.pj)) {
    return {
      id: null,
      name: String(p.pj).trim(),
      explicit: false,
      explicitId: false,
    };
  }
  return null;
};

export const isAssignedToCurrentOperator = (
  p: Program,
  currentUser: User | null
): boolean => {
  if (!currentUser || currentUser.role !== "Operator") return false;
  const owner = operatorAssignment(p);
  if (!owner) return false;
  if (owner.explicitId) return owner.id === String(currentUser.id);
  if (owner.explicit) return owner.name === currentUser.nama;
  return owner.name === currentUser.nama;
};

export const canEditProgram = (
  p: Program,
  currentUser: User | null
): boolean => {
  if (!currentUser) return false;
  if (currentUser.role === "Admin") return true;
  if (currentUser.role === "Operator") {
    const owner = operatorAssignment(p);
    // Unassigned activities added by Admin can be edited/claimed by Operator
    if (!owner) return true;
    return isAssignedToCurrentOperator(p, currentUser);
  }
  return false;
};

export const matchProgram = (p: Program, query: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    p.kode,
    p.nama,
    p.namaKegiatan,
    p.kategori,
    p.lokasi,
    p.kecamatan,
    p.desaKelurahan,
    p.detailLokasi,
    p.pj,
    p.operatorPengelola,
    p.penyedia,
    p.direktur,
    p.periode,
    p.status,
    p.satuan,
    p.noKontrak,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
};

export const downloadBlob = (
  filename: string,
  content: string,
  type = "text/plain"
) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
};
