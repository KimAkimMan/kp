"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { User, Program, Role } from "../types";
import {
  currency,
  remBudget,
  isRoadCategory,
} from "../utils/helpers";
import { standardCategories, unitOptions } from "../data/initialData";

// --- Base Modal Frame ---
interface ModalFrameProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModalFrame: React.FC<ModalFrameProps> = ({
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2540]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
        <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
          <h2 className="text-xl font-bold text-[#143965]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- User Modal ---
interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [nama, setNama] = useState(user?.nama || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<Role>(user?.role || "Operator");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setError("Nama lengkap dan email wajib diisi.");
      return;
    }
    onSave({ nama: nama.trim(), email: email.trim(), role });
  };

  return (
    <ModalFrame
      title={user ? "Ubah Data Pengguna" : "Tambah Pengguna Baru"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Budi Pratama, S.T."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Email Akun
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="nama@kuningankab.go.id"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Role Hak Akses
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Pimpinan">Pimpinan</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Pengguna
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};

// --- Activity Modal (Master Kegiatan Admin) ---
interface ActivityModalProps {
  activity?: Program | null;
  operators?: User[];
  onClose: () => void;
  onSave: (data: Partial<Program>) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  operators = [],
  onClose,
  onSave,
}) => {
  const [kategori, setKategori] = useState(activity?.kategori || "");
  const [nama, setNama] = useState(activity?.nama || "");
  const [pagu, setPagu] = useState<string>(
    activity?.pagu !== undefined ? String(activity.pagu) : "0"
  );
  const [kecamatan, setKecamatan] = useState(activity?.kecamatan || "");
  const [desa, setDesa] = useState(activity?.desaKelurahan || "");
  const [detailLokasi, setDetailLokasi] = useState(
    activity?.detailLokasi || ""
  );
  const [operatorId, setOperatorId] = useState<string>(
    activity?.operatorPengelolaId !== undefined && activity?.operatorPengelolaId !== null
      ? String(activity.operatorPengelolaId)
      : ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori) {
      setError("Kategori kegiatan wajib dipilih.");
      return;
    }
    if (!nama.trim()) {
      setError("Nama kegiatan wajib diisi.");
      return;
    }
    const paguNum = Number(pagu);
    if (!Number.isFinite(paguNum) || paguNum < 0) {
      setError("Nilai pagu anggaran wajib berupa angka positif.");
      return;
    }

    const fullLocation = [detailLokasi.trim(), desa.trim(), kecamatan.trim()]
      .filter(Boolean)
      .join(", ");

    const assignedOp = operators.find((u) => String(u.id) === operatorId);

    onSave({
      kategori,
      nama: nama.trim(),
      namaKegiatan: nama.trim(),
      pagu: paguNum,
      kecamatan: kecamatan.trim(),
      desaKelurahan: desa.trim(),
      detailLokasi: detailLokasi.trim(),
      lokasi: fullLocation || activity?.lokasi || "Kabupaten Kuningan",
      operatorPengelola: assignedOp ? assignedOp.nama : null,
      operatorPengelolaId: assignedOp ? assignedOp.id : null,
      pj: assignedOp ? assignedOp.nama : "Belum Ditugaskan",
    });
  };

  return (
    <ModalFrame
      title={activity ? "Ubah Master Kegiatan" : "Tambah Master Kegiatan"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Kategori / Jenis Kegiatan
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Pilih kategori...</option>
            {standardCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nama Kegiatan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Pembangunan Jalan Usaha Tani"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nilai Pagu Anggaran (Rp)
          </label>
          <input
            type="number"
            min="0"
            value={pagu}
            onChange={(e) => setPagu(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="0"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Kecamatan
            </label>
            <input
              type="text"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Ketik nama kecamatan"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Desa / Kelurahan
            </label>
            <input
              type="text"
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama desa atau kelurahan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Detail Lokasi / Ruas Jalan
          </label>
          <input
            type="text"
            value={detailLokasi}
            onChange={(e) => setDetailLokasi(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Ruas Jalan Blok Wage RT 02/01"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Tugaskan Operator Pelaksana (Opsional)
          </label>
          <select
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium text-[#143965]"
          >
            <option value="">-- Belum Ditugaskan (Dapat Diambil & Diedit oleh Semua Operator) --</option>
            {operators
              .filter((u) => u.role === "Operator")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.email})
                </option>
              ))}
          </select>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Kegiatan yang belum ditugaskan akan langsung muncul di akun Operator untuk diambil dan dilengkapi.
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Master Kegiatan
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};

// --- Schedule & Technical Data Modal (Operator) ---
interface ScheduleModalProps {
  program: Program;
  onClose: () => void;
  onSave: (data: Partial<Program>) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  program,
  onClose,
  onSave,
}) => {
  const isRoad = isRoadCategory(program.kategori);

  // Format helper for date input value (YYYY-MM-DD)
  const formatForDateOnly = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return "";
    }
  };

  const [satuan, setSatuan] = useState(program.satuan || "Unit");
  const [targetAwal, setTargetAwal] = useState<string>(
    program.targetAwal && program.targetAwal > 0 ? String(program.targetAwal) : ""
  );
  const [targetVolume, setTargetVolume] = useState<string>(
    program.target && program.target > 0 ? String(program.target) : ""
  );
  const [penyedia, setPenyedia] = useState(program.penyedia || "");
  const [direktur, setDirektur] = useState(program.direktur || "");
  const [nilaiKontrak, setNilaiKontrak] = useState<string>(
    program.nilaiKontrak !== undefined && program.nilaiKontrak !== null
      ? String(program.nilaiKontrak)
      : ""
  );
  const [noKontrak, setNoKontrak] = useState(program.noKontrak || "");
  
  // Tanggal awal & akhir pelaksanaan (tanpa jam, format date YYYY-MM-DD)
  const [tanggalMulai, setTanggalMulai] = useState(
    formatForDateOnly(program.tanggalMulai) || "2026-01-01"
  );
  const [tanggalSelesai, setTanggalSelesai] = useState(
    formatForDateOnly(program.tanggalSelesai) || "2026-12-31"
  );
  
  // Periode hanya tahun
  const extractYear = (p?: string) => {
    if (!p) return new Date().getFullYear();
    const match = p.match(/\b(20\d{2})\b/);
    return match ? Number(match[1]) : new Date().getFullYear();
  };
  const [periodeTahun, setPeriodeTahun] = useState<number | string>(
    extractYear(program.periode)
  );

  const [lebarJalan, setLebarJalan] = useState<string>(
    program.lebarJalan !== undefined ? String(program.lebarJalan) : ""
  );
  const [kondisiJalan, setKondisiJalan] = useState(
    program.kondisiJalan || "Sedang"
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tAwal = Number(targetAwal);
    const tVol = Number(targetVolume);

    if (!Number.isFinite(tAwal) || tAwal <= 0) {
      setError("Target Awal wajib berupa angka lebih besar dari 0.");
      return;
    }
    if (!Number.isFinite(tVol) || tVol <= 0) {
      setError("Target Volume berjalan wajib berupa angka lebih besar dari 0.");
      return;
    }
    if (tVol < program.realisasi) {
      setError("Target berjalan tidak boleh lebih kecil dari realisasi yang sudah tercatat.");
      return;
    }
    if (!tanggalMulai) {
      setError("Tanggal awal pelaksanaan wajib diisi.");
      return;
    }
    if (!tanggalSelesai) {
      setError("Tanggal akhir pelaksanaan wajib diisi.");
      return;
    }
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      setError("Tanggal awal pelaksanaan tidak boleh setelah tanggal akhir pelaksanaan.");
      return;
    }
    if (!periodeTahun || isNaN(Number(periodeTahun))) {
      setError("Periode tahun pelaksanaan wajib diisi angka tahun yang valid.");
      return;
    }

    if (isRoad) {
      const lebar = Number(lebarJalan);
      if (!Number.isFinite(lebar) || lebar <= 0) {
        setError("Lebar jalan wajib diisi dengan angka lebih besar dari 0.");
        return;
      }
    }

    // Format human-friendly label for jadwal (tanggal saja, tanpa jam)
    const formatIndoDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };
    const jadwalLabel = `${formatIndoDate(tanggalMulai)} s/d ${formatIndoDate(tanggalSelesai)}`;

    onSave({
      satuan,
      targetAwal: tAwal,
      target: tVol,
      targetVolume: tVol,
      penyedia: penyedia.trim(),
      direktur: direktur.trim(),
      nilaiKontrak: nilaiKontrak.trim() ? Number(nilaiKontrak) : null,
      noKontrak: noKontrak.trim() || null,
      tanggalMulai,
      tanggalSelesai,
      jadwal: jadwalLabel,
      periode: String(periodeTahun),
      ...(isRoad
        ? {
            lebarJalan: Number(lebarJalan),
            kondisiJalan,
          }
        : {}),
    });
  };

  return (
    <ModalFrame title="Isi & Sesuaikan Data Kegiatan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Read only info from Admin */}
        <div className="bg-[#F6F9FB] border border-[#E0EBF2] p-4 rounded-xl text-xs space-y-1.5">
          <div>
            <strong className="text-[#143965]">Nama Kegiatan:</strong>{" "}
            {program.nama}
          </div>
          <div>
            <strong className="text-[#143965]">Kategori:</strong>{" "}
            {program.kategori}
          </div>
          <div>
            <strong className="text-[#143965]">Lokasi:</strong> {program.lokasi}
          </div>
          <div>
            <strong className="text-[#143965]">Pagu Anggaran:</strong>{" "}
            {currency(program.pagu)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Satuan Pengukuran
            </label>
            <select
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Target Awal ({satuan})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={targetAwal}
              onChange={(e) => setTargetAwal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            />
          </div>
        </div>

        {isRoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFDFE] p-3 rounded-xl border border-[#DFEAF0]">
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Lebar Jalan (meter)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={lebarJalan}
                onChange={(e) => setLebarJalan(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Kondisi Jalan
              </label>
              <select
                value={kondisiJalan}
                onChange={(e) => setKondisiJalan(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              >
                <option value="Baik">Baik</option>
                <option value="Sedang">Sedang</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Penyedia CV / PT
            </label>
            <input
              type="text"
              value={penyedia}
              onChange={(e) => setPenyedia(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama perusahaan pelaksana"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Direktur / Penanggung Jawab
            </label>
            <input
              type="text"
              value={direktur}
              onChange={(e) => setDirektur(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama direktur"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nilai Kontrak Final (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={nilaiKontrak}
              onChange={(e) => setNilaiKontrak(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Sesuai SPK"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nomor Kontrak / SPK
            </label>
            <input
              type="text"
              value={noKontrak}
              onChange={(e) => setNoKontrak(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="602.1/.../SPK/..."
            />
          </div>
        </div>

        {/* Tanggal Pelaksanaan & Periode Tahun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFDFE] p-3.5 rounded-xl border border-[#DFEAF0]">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Awal Pelaksanaan *
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">Pilih tanggal mulai pengerjaan</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Akhir Pelaksanaan *
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">Pilih tanggal target selesai</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Periode (Tahun) *
            </label>
            <input
              type="number"
              min="2020"
              max="2035"
              value={periodeTahun}
              onChange={(e) => setPeriodeTahun(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold text-[#143965]"
              placeholder="Contoh: 2026"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">Tahun anggaran pelaksanaan</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Target Volume Berjalan ({satuan}) *
            </label>
            <input
              type="number"
              step="any"
              min={program.realisasi}
              value={targetVolume}
              onChange={(e) => setTargetVolume(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold text-[#148B87]"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">Tidak boleh kurang dari realisasi ({program.realisasi})</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};

// --- Cost Modal (Operator Catat Penggunaan Biaya) ---
interface CostModalProps {
  program: Program;
  onClose: () => void;
  onSave: (cost: {
    tanggal: string;
    tahap: string;
    uraian: string;
    nominal: number;
    hasProof: boolean;
  }) => void;
}

export const CostModal: React.FC<CostModalProps> = ({
  program,
  onClose,
  onSave,
}) => {
  const [tanggal, setTanggal] = useState("");
  const [tahap, setTahap] = useState("");
  const [uraian, setUraian] = useState("");
  const [nominal, setNominal] = useState("");
  const [hasProof, setHasProof] = useState(false);
  const [error, setError] = useState("");

  const sisa = remBudget(program);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !tahap.trim() || !uraian.trim()) {
      setError("Semua field tanggal, tahap, dan uraian wajib diisi.");
      return;
    }
    const amount = Number(nominal);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Nominal biaya wajib lebih besar dari 0.");
      return;
    }
    if (amount > sisa) {
      setError(`Penggunaan biaya melebihi sisa pagu (${currency(sisa)}).`);
      return;
    }

    onSave({
      tanggal,
      tahap: tahap.trim(),
      uraian: uraian.trim(),
      nominal: amount,
      hasProof,
    });
  };

  return (
    <ModalFrame title="Catat Penggunaan Biaya Kegiatan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#F6FBFD] p-3.5 rounded-xl border border-[#D6E5EC] text-xs">
          <p className="text-[#65778B] m-0">Sisa pagu anggaran kegiatan ini:</p>
          <strong className="block text-base text-[#143965] font-bold mt-0.5">
            {currency(sisa)}
          </strong>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Penggunaan
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tahap / Jenis Pekerjaan
            </label>
            <input
              type="text"
              value={tahap}
              onChange={(e) => setTahap(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Contoh: Pembelian material U-ditch"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Uraian Rinci Pengeluaran
          </label>
          <input
            type="text"
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Keterangan transaksi"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nominal Pengeluaran (Rp)
            </label>
            <input
              type="number"
              min="1"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Bukti Kuitansi / Nota
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setHasProof(Boolean(e.target.files?.length))}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-1.5 text-xs bg-white file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EDF4F8] file:text-[#1E4E8C]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Biaya
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
