"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { FieldSurvey, Program, User } from "../../../types";
import { SurveyStatus } from "@/generated/prisma/enums";
import { defaultKecamatanList, standardCategories } from "../../../data/initialData";

export function useSurveyForm({
  currentUser,
  programs,
  surveys,
}: {
  currentUser: User;
  programs: Program[];
  surveys: FieldSurvey[];
}) {
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | "">("");
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [kategori, setKategori] = useState("Jalan Lingkungan");
  const [tanggal, setTanggal] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [surveyor, setSurveyor] = useState(currentUser.nama || "Rina Wulandari");
  const [kontakPendamping, setKontakPendamping] = useState("");
  const [kecamatan, setKecamatan] = useState(defaultKecamatanList[0] || "Ciawigebang");
  const [desaKelurahan, setDesaKelurahan] = useState("");
  const [detailLokasi, setDetailLokasi] = useState("");
  const [koordinat, setKoordinat] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [kondisi, setKondisi] = useState<"Baik" | "Rusak Ringan" | "Rusak Sedang" | "Rusak Berat">("Rusak Sedang");
  const [tipeKonstruksi, setTipeKonstruksi] = useState("Rabat Beton K-250");
  const [panjang, setPanjang] = useState<number | "">("");
  const [lebar, setLebar] = useState<number | "">("");
  const [luasVolume, setLuasVolume] = useState<number | "">("");
  const [satuan, setSatuan] = useState("m2");
  const [estimasiBiaya, setEstimasiBiaya] = useState<number | "">("");
  const [tingkatUrgensi, setTingkatUrgensi] = useState<"Rendah" | "Sedang" | "Tinggi / Mendesak">("Tinggi / Mendesak");
  const [uraianTemuan, setUraianTemuan] = useState("");
  const [rekomendasi, setRekomendasi] = useState("");
  const [status, setStatus] = useState<
    "Draft" | "Selesai Survey" | "Menunggu Verifikasi" | "Perlu Revisi" | "Diverifikasi" | "Dikonversi"
  >("Selesai Survey");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-calculate Luas / Volume when panjang or lebar changes
  const handlePanjangChange = useCallback((val: string) => {
    const p = val === "" ? "" : Number(val);
    setPanjang(p);
    if (typeof p === "number" && typeof lebar === "number" && p > 0 && lebar > 0) {
      setLuasVolume(Math.round(p * lebar * 100) / 100);
    }
  }, [lebar]);

  const handleLebarChange = useCallback((val: string) => {
    const l = val === "" ? "" : Number(val);
    setLebar(l);
    if (typeof panjang === "number" && typeof l === "number" && panjang > 0 && l > 0) {
      setLuasVolume(Math.round(panjang * l * 100) / 100);
    }
  }, [panjang]);

  // Program selection change
  const handleProgramSelect = useCallback((progId: number | "") => {
    setSelectedProgramId(progId);
    if (progId !== "") {
      const prog = programs.find((p) => p.id === progId);
      if (prog) {
        setNamaKegiatan(prog.nama);
        setKategori(prog.kategori || "Jalan Lingkungan");
        if (prog.kecamatan) setKecamatan(prog.kecamatan);
        if (prog.desaKelurahan) setDesaKelurahan(prog.desaKelurahan);
        if (prog.detailLokasi) setDetailLokasi(prog.detailLokasi);
        if (prog.satuan) setSatuan(prog.satuan);
        if (prog.kondisiJalan) {
          const k = prog.kondisiJalan;
          if (k === "Baik" || k === "Rusak Ringan" || k === "Rusak Sedang" || k === "Rusak Berat") {
            setKondisi(k);
          }
        }
      }
    }
  }, [programs]);

  // Get GPS Location
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setKoordinat("-6.9782, 108.4832");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setKoordinat(`${lat}, ${lng}`);
        setIsGettingLocation(false);
      },
      () => {
        setKoordinat("-6.9745, 108.4912");
        setIsGettingLocation(false);
      },
      { timeout: 7000 }
    );
  }, []);

  // Photo upload handler
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage("Foto terlalu besar (maksimal 2MB). Pilih foto dengan resolusi lebih kecil.");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Tipe file foto tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
        return;
      }
      setPhotoFile(file);
      setErrorMessage("");
    }
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setEditingId(null);
    setSelectedProgramId("");
    setNamaKegiatan("");
    setKategori("Jalan Lingkungan");
    setTanggal(new Date().toISOString().split("T")[0]);
    setSurveyor(currentUser.nama || "Rina Wulandari");
    setKontakPendamping("");
    setKecamatan(defaultKecamatanList[0] || "Ciawigebang");
    setDesaKelurahan("");
    setDetailLokasi("");
    setKoordinat("");
    setKondisi("Rusak Sedang");
    setTipeKonstruksi("Rabat Beton K-250");
    setPanjang("");
    setLebar("");
    setLuasVolume("");
    setSatuan("m2");
    setEstimasiBiaya("");
    setTingkatUrgensi("Tinggi / Mendesak");
    setUraianTemuan("");
    setRekomendasi("");
    setStatus("Selesai Survey");
    setPhotoFile(null);
    setUploadingPhoto(false);
    setErrorMessage("");
  }, [currentUser]);

  // Load survey into form for editing
  const handleEditSurvey = useCallback((srv: FieldSurvey) => {
    setEditingId(srv.id);
    setSelectedProgramId(srv.programId || "");
    setNamaKegiatan(srv.namaKegiatan);
    setKategori(srv.kategori);
    setTanggal(srv.tanggal);
    setSurveyor(srv.surveyor);
    setKontakPendamping(srv.kontakPendamping || "");
    setKecamatan(srv.kecamatan);
    setDesaKelurahan(srv.desaKelurahan);
    setDetailLokasi(srv.detailLokasi);
    setKoordinat(srv.koordinat || "");
    setKondisi(srv.kondisi);
    setTipeKonstruksi(srv.tipeKonstruksi || "Rabat Beton K-250");
    setPanjang(srv.panjang ?? "");
    setLebar(srv.lebar ?? "");
    setLuasVolume(srv.luasVolume ?? "");
    setSatuan(srv.satuan || "m2");
    setEstimasiBiaya(srv.estimasiBiaya ?? "");
    setTingkatUrgensi(srv.tingkatUrgensi);
    setUraianTemuan(srv.uraianTemuan);
    setRekomendasi(srv.rekomendasi);
    setStatus(srv.status);
    setErrorMessage("");
    setActiveTab("form");
  }, [setActiveTab]);

  // Build survey object from form state (validation included)
  const buildSurvey = useCallback((): FieldSurvey | null => {
    if (!namaKegiatan.trim()) {
      setErrorMessage("Nama kegiatan / lokasi survey wajib diisi.");
      return null;
    }
    if (!desaKelurahan.trim()) {
      setErrorMessage("Nama Desa / Kelurahan wajib diisi.");
      return null;
    }
    if (!uraianTemuan.trim()) {
      setErrorMessage("Uraian temuan kondisi lapangan wajib diisi.");
      return null;
    }

    const surveyId = editingId || `SRV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const originalSurvey = editingId ? surveys.find((s) => s.id === editingId) : undefined;
    const statusStringToSurveyStatus: Record<string, SurveyStatus> = {
      Draft: SurveyStatus.DRAFT,
      "Selesai Survey": SurveyStatus.SELESAI_SURVEY,
      "Menunggu Verifikasi": SurveyStatus.MENUNGGU_VERIFIKASI,
      "Perlu Revisi": SurveyStatus.PERLU_REVISI,
      Diverifikasi: SurveyStatus.DIVERIFIKASI,
      Dikonversi: SurveyStatus.DIKONVERSI,
    };

    const survey: FieldSurvey = {
      id: surveyId,
      kodeSurvey: surveyId,
      tanggal,
      surveyor: surveyor.trim() || currentUser.nama,
      surveyorId: editingId ? (originalSurvey?.surveyorId ?? currentUser.id) : currentUser.id,
      programId: selectedProgramId !== "" ? Number(selectedProgramId) : null,
      namaKegiatan: namaKegiatan.trim(),
      kategori,
      kecamatan,
      desaKelurahan: desaKelurahan.trim(),
      detailLokasi: detailLokasi.trim() || `Desa ${desaKelurahan.trim()}, Kec. ${kecamatan}`,
      koordinat: koordinat.trim() || undefined,
      kondisi,
      panjang: typeof panjang === "number" ? panjang : undefined,
      lebar: typeof lebar === "number" ? lebar : undefined,
      luasVolume: typeof luasVolume === "number" ? luasVolume : undefined,
      satuan,
      tipeKonstruksi: tipeKonstruksi.trim() || undefined,
      estimasiBiaya: typeof estimasiBiaya === "number" ? estimasiBiaya : undefined,
      tingkatUrgensi,
      uraianTemuan: uraianTemuan.trim(),
      rekomendasi: rekomendasi.trim(),
      kontakPendamping: kontakPendamping.trim() || undefined,
      foto: editingId && !photoFile ? (originalSurvey?.foto ?? false) : !!photoFile,
      status,
      createdAt: new Date().toISOString(),
    };
    setErrorMessage("");
    return survey;
  }, [
    editingId, surveys, currentUser, selectedProgramId, namaKegiatan, desaKelurahan,
    uraianTemuan, kategori, kecamatan, detailLokasi, koordinat, kondisi, panjang,
    lebar, luasVolume, satuan, tipeKonstruksi, estimasiBiaya, tingkatUrgensi,
    rekomendasi, kontakPendamping, status, photoFile,
  ]);

  return {
    // State
    activeTab,
    setActiveTab,
    editingId,
    setEditingId,
    selectedProgramId,
    setSelectedProgramId,
    namaKegiatan,
    setNamaKegiatan,
    kategori,
    setKategori,
    tanggal,
    setTanggal,
    surveyor,
    setSurveyor,
    kontakPendamping,
    setKontakPendamping,
    kecamatan,
    setKecamatan,
    desaKelurahan,
    setDesaKelurahan,
    detailLokasi,
    setDetailLokasi,
    koordinat,
    setKoordinat,
    isGettingLocation,
    setIsGettingLocation,
    kondisi,
    setKondisi,
    tipeKonstruksi,
    setTipeKonstruksi,
    panjang,
    setPanjang,
    lebar,
    setLebar,
    luasVolume,
    setLuasVolume,
    satuan,
    setSatuan,
    estimasiBiaya,
    setEstimasiBiaya,
    tingkatUrgensi,
    setTingkatUrgensi,
    uraianTemuan,
    setUraianTemuan,
    rekomendasi,
    setRekomendasi,
    status,
    setStatus,
    photoFile,
    setPhotoFile,
    uploadingPhoto,
    setUploadingPhoto,
    errorMessage,
    setErrorMessage,
    // Handlers
    resetForm,
    handleEditSurvey,
    handleProgramSelect,
    handleGetLocation,
    handlePhotoUpload,
    handlePanjangChange,
    handleLebarChange,
    buildSurvey,
  };
}
