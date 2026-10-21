"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  MapPin,
  Calendar,
  User as UserIcon,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Edit3,
  ExternalLink,
  Printer,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Info,
  Compass,
} from "lucide-react";
import { FieldSurvey, Program, User } from "../../types";
import { currency } from "../../utils/helpers";
import { defaultKecamatanList, standardCategories } from "../../data/initialData";

interface SurveyViewProps {
  currentUser: User;
  programs: Program[];
  surveys: FieldSurvey[];
  onSaveSurvey: (survey: FieldSurvey) => void;
  onDeleteSurvey: (id: string) => void;
  onNavigateToProgram?: (programId: number) => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({
  currentUser,
  programs,
  surveys,
  onSaveSurvey,
  onDeleteSurvey,
  onNavigateToProgram,
}) => {
  const isOperator = currentUser.role === "Operator";
  const isAdmin = currentUser.role === "Admin";

  // Tab State: "form" | "list"
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("");

  // Detail Modal State
  const [viewingSurvey, setViewingSurvey] = useState<FieldSurvey | null>(null);

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
  const [status, setStatus] = useState<"Draft" | "Selesai Survey" | "Diverifikasi">("Selesai Survey");
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-calculate Luas / Volume when panjang or lebar changes
  const handlePanjangChange = (val: string) => {
    const p = val === "" ? "" : Number(val);
    setPanjang(p);
    if (typeof p === "number" && typeof lebar === "number" && p > 0 && lebar > 0) {
      setLuasVolume(Math.round(p * lebar * 100) / 100);
    }
  };

  const handleLebarChange = (val: string) => {
    const l = val === "" ? "" : Number(val);
    setLebar(l);
    if (typeof panjang === "number" && typeof l === "number" && panjang > 0 && l > 0) {
      setLuasVolume(Math.round(panjang * l * 100) / 100);
    }
  };

  // Program selection change
  const handleProgramSelect = (progId: number | "") => {
    setSelectedProgramId(progId);
    if (progId !== "") {
      const prog = programs.find((p) => p.id === progId);
      if (prog) {
        setNamaKegiatan(prog.nama);
        setKategori(prog.kategori || "Jalan Lingkungan");
        if (prog.kecamatan) setKecamatan(prog.kecamatan);
        if (prog.desaKelurahan) setDesaKelurahan(prog.desaKelurahan);
        if (prog.detailLokasi) setDetailLokasi(prog.detailLokasi);
        if (prog.kondisiJalan) {
          const k = prog.kondisiJalan;
          if (k === "Baik" || k === "Rusak Ringan" || k === "Rusak Sedang" || k === "Rusak Berat") {
            setKondisi(k);
          }
        }
      }
    }
  };

  // Get GPS Location
  const handleGetLocation = () => {
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
        // Fallback default coordinates in Kuningan
        setKoordinat("-6.9745, 108.4912");
        setIsGettingLocation(false);
      },
      { timeout: 7000 }
    );
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
        setHasPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
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
    setFotoUrl("");
    setHasPhoto(false);
    setErrorMessage("");
  };

  // Load survey into form for editing
  const handleEditSurvey = (srv: FieldSurvey) => {
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
    setFotoUrl(srv.fotoUrl || "");
    setHasPhoto(!!srv.foto || !!srv.fotoUrl);
    setErrorMessage("");
    setActiveTab("form");
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan.trim()) {
      setErrorMessage("Nama kegiatan / lokasi survey wajib diisi.");
      return;
    }
    if (!desaKelurahan.trim()) {
      setErrorMessage("Nama Desa / Kelurahan wajib diisi.");
      return;
    }
    if (!uraianTemuan.trim()) {
      setErrorMessage("Uraian temuan kondisi lapangan wajib diisi.");
      return;
    }

    const surveyId = editingId || `SRV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const newSurvey: FieldSurvey = {
      id: surveyId,
      kodeSurvey: surveyId,
      tanggal,
      surveyor: surveyor.trim() || currentUser.nama,
      surveyorId: currentUser.id,
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
      foto: hasPhoto,
      fotoUrl: fotoUrl || undefined,
      status,
      createdAt: new Date().toISOString(),
    };

    onSaveSurvey(newSurvey);
    resetForm();
    setActiveTab("list");
  };

  // Filtered surveys
  const filteredSurveys = surveys.filter((s) => {
    const matchSearch =
      !searchTerm ||
      s.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desaKelurahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.detailLokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kodeSurvey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKecamatan = !filterKecamatan || s.kecamatan === filterKecamatan;
    const matchKondisi = !filterKondisi || s.kondisi === filterKondisi;

    return matchSearch && matchKecamatan && matchKondisi;
  });

  // Summary Metrics
  const totalSurveys = surveys.length;
  const rusakBeratCount = surveys.filter((s) => s.kondisi === "Rusak Berat" || s.kondisi === "Rusak Sedang").length;
  const selesaiCount = surveys.filter((s) => s.status === "Selesai Survey" || s.status === "Diverifikasi").length;
  const totalEstimasi = surveys.reduce((acc, curr) => acc + (curr.estimasiBiaya || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#143965]">Form Survey Lapangan</h2>
              <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
                Formulir pendataan teknis, dokumentasi fisik 0%, dan verifikasi lapangan Disperkimtan Kuningan
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#DCE5ED] shadow-xs">
          <button
            onClick={() => {
              if (activeTab !== "form") {
                resetForm();
                setActiveTab("form");
              }
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-[#1E4E8C] text-white shadow-xs"
                : "text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA]"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {editingId ? "Edit Form Survey" : "Input Survey Baru"}
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "list"
                ? "bg-[#1E4E8C] text-white shadow-xs"
                : "text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA]"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Daftar Survey Lapangan ({surveys.length})
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator">
          <p className="text-xs font-semibold text-[#65778B] m-0">Total Survey Dilakukan</p>
          <strong className="block text-2xl font-bold text-[#143965] mt-1.5">{totalSurveys}</strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Titik lokasi terdata</span>
        </article>

        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator orange">
          <p className="text-xs font-semibold text-[#65778B] m-0">Kondisi Rusak Sedang/Berat</p>
          <strong className="block text-2xl font-bold text-[#BD493B] mt-1.5">{rusakBeratCount}</strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Perlu prioritas penanganan</span>
        </article>

        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator green">
          <p className="text-xs font-semibold text-[#65778B] m-0">Survey Lengkap / Selesai</p>
          <strong className="block text-2xl font-bold text-[#258050] mt-1.5">{selesaiCount}</strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Siap verifikasi & penganggaran</span>
        </article>

        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator teal">
          <p className="text-xs font-semibold text-[#65778B] m-0">Total Estimasi Kebutuhan</p>
          <strong className="block text-xl font-bold text-[#148B87] mt-1.5 truncate">
            {currency(totalEstimasi)}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Kalkulasi usulan lapangan</span>
        </article>
      </div>

      {/* Main Content Area */}
      {activeTab === "form" ? (
        /* ================== FORMULIR SURVEY LAPANGAN ================== */
        <section className="bg-white rounded-2xl border border-[#E1E9F0] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#F8FAFC] to-[#EFF5FA] border-b border-[#E1E9F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
                <ClipboardCheck className="w-4 h-4" />
                {editingId ? "Mode Edit Data Survey" : "Formulir Survey Lapangan Resmi"}
              </span>
              <h3 className="text-lg font-bold text-[#143965] mt-1">
                {editingId ? `Perbarui Survey: ${editingId}` : "Input Data Hasil Survey Lapangan"}
              </h3>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D5E6F3] transition"
              >
                Batal Edit & Buat Baru
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-7">
            {errorMessage && (
              <div className="p-3.5 bg-[#FDEEED] text-[#BD493B] border border-[#F8C8C4] rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SEKSI 1: KETERKAITAN KEGIATAN & SURVEYOR */}
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
                <Layers className="w-4 h-4 text-[#1E4E8C]" />
                <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
                  1. Informasi Kegiatan & Petugas Lapangan
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Hubungkan ke Program / Kegiatan */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Hubungkan ke Data Program / Kegiatan (Opsional)
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => handleProgramSelect(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
                  >
                    <option value="">— Survey Mandiri / Usulan Baru (Non-Program Terdaftar) —</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.kode}] {p.nama} — {p.lokasi}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#65778B] mt-1">
                    Pilih kegiatan untuk mengisi otomatis lokasi, kategori, dan detail teknis dari master kegiatan.
                  </p>
                </div>

                {/* Tanggal Survey */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Tanggal Pelaksanaan Survey *
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Nama Kegiatan / Judul Lokasi */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Nama Kegiatan / Judul Lokasi Survey *
                  </label>
                  <input
                    type="text"
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Perbaikan Jalan Lingkungan Ruas Dusun Manis"
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2.5 text-sm bg-white"
                  />
                </div>

                {/* Kategori Prasarana */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Kategori Prasarana *
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2.5 text-sm bg-white"
                  >
                    {standardCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surveyor */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Nama Petugas Surveyor (Operator) *
                  </label>
                  <input
                    type="text"
                    value={surveyor}
                    onChange={(e) => setSurveyor(e.target.value)}
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Kontak / Pendamping Lapangan */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Pendamping / Tokoh Lapangan (RT / RW / Tokoh Warga)
                  </label>
                  <input
                    type="text"
                    value={kontakPendamping}
                    onChange={(e) => setKontakPendamping(e.target.value)}
                    placeholder="Contoh: Pak Sutrisno (Ketua RW 02 - 08123456789)"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 2: LOKASI & TITIK KOORDINAT GPS */}
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
                <MapPin className="w-4 h-4 text-[#1E4E8C]" />
                <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
                  2. Lokasi Geografis & Titik Koordinat GPS
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Kecamatan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Kecamatan *
                  </label>
                  <select
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2.5 text-sm bg-white"
                  >
                    {defaultKecamatanList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                    <option value="Kuningan">Kuningan</option>
                    <option value="Cilimus">Cilimus</option>
                    <option value="Jalaksana">Jalaksana</option>
                    <option value="Kramatmulya">Kramatmulya</option>
                    <option value="Darma">Darma</option>
                    <option value="Luragung">Luragung</option>
                  </select>
                </div>

                {/* Desa / Kelurahan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Desa / Kelurahan *
                  </label>
                  <input
                    type="text"
                    value={desaKelurahan}
                    onChange={(e) => setDesaKelurahan(e.target.value)}
                    placeholder="Contoh: Ciawigebang / Cigugur"
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Detail Lokasi / Ruas Jalan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Detail Lokasi / Ruas / Gang / Dusun *
                  </label>
                  <input
                    type="text"
                    value={detailLokasi}
                    onChange={(e) => setDetailLokasi(e.target.value)}
                    placeholder="Contoh: Ruas Dusun Manis Gang 4 RT 02/03"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Titik Koordinat GPS with action */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Titik Koordinat GPS (Latitude, Longitude)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={koordinat}
                      onChange={(e) => setKoordinat(e.target.value)}
                      placeholder="Contoh: -6.9835, 108.5742"
                      className="flex-1 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D5E6F3] border border-[#C5DCEB] flex items-center justify-center gap-1.5 transition shrink-0"
                    >
                      <Compass className={`w-4 h-4 ${isGettingLocation ? "animate-spin" : ""}`} />
                      {isGettingLocation ? "Mendeteksi Posisi..." : "Dapatkan Koordinat Saat Ini"}
                    </button>
                    {koordinat && (
                      <a
                        href={`https://www.google.com/maps?q=${koordinat}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4F7FA] text-[#65778B] hover:text-[#143965] border border-[#CCD9E4] flex items-center justify-center gap-1.5 transition shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Peta
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 3: KONDISI TEKNIS & DIMENSI */}
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
                <Info className="w-4 h-4 text-[#1E4E8C]" />
                <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
                  3. Kondisi Eksisting & Dimensi Teknis
                </h4>
              </div>

              {/* Kondisi Visual Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-2">
                  Kondisi Eksisting Infrastruktur *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Baik", color: "border-[#258050] text-[#258050] bg-[#E7F6ED]" },
                    { label: "Rusak Ringan", color: "border-[#D98E04] text-[#B07300] bg-[#FEF7E9]" },
                    { label: "Rusak Sedang", color: "border-[#E78A31] text-[#BD6C1E] bg-[#FFF3E8]" },
                    { label: "Rusak Berat", color: "border-[#BD493B] text-[#BD493B] bg-[#FDEEED]" },
                  ].map((item) => {
                    const isSelected = kondisi === item.label;
                    return (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => setKondisi(item.label as typeof kondisi)}
                        className={`p-3 rounded-xl border-2 text-center font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                          isSelected
                            ? `${item.color} shadow-xs ring-2 ring-offset-1 ring-[#1E4E8C]/30`
                            : "border-[#DCE5ED] bg-white text-[#65778B] hover:border-[#BACDD9]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tipe Konstruksi */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Tipe Eksisting / Konstruksi
                  </label>
                  <input
                    type="text"
                    value={tipeKonstruksi}
                    onChange={(e) => setTipeKonstruksi(e.target.value)}
                    placeholder="Contoh: Aspal Lapen / Rabat Beton / Paving Block"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Panjang */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Panjang (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={panjang}
                    onChange={(e) => handlePanjangChange(e.target.value)}
                    placeholder="Contoh: 350"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Lebar */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Lebar (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lebar}
                    onChange={(e) => handleLebarChange(e.target.value)}
                    placeholder="Contoh: 3.0"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Luas / Volume */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Luas / Volume Estimasi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={luasVolume}
                      onChange={(e) => setLuasVolume(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Contoh: 1050"
                      className="flex-1 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                    />
                    <select
                      value={satuan}
                      onChange={(e) => setSatuan(e.target.value)}
                      className="w-40 border border-[#CCD9E4] rounded-xl px-2 py-2 text-xs bg-white"
                    >
                      <option value="m'">m'</option>
                      <option value="m2">m2</option>
                      <option value="m3">m3</option>
                      <option value="Unit">Unit</option>
                      <option value="ha">ha</option>
                      <option value="Titik">Titik</option>
                    </select>
                  </div>
                </div>

                {/* Tingkat Urgensi */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Tingkat Urgensi Penanganan *
                  </label>
                  <select
                    value={tingkatUrgensi}
                    onChange={(e) => setTingkatUrgensi(e.target.value as typeof tingkatUrgensi)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                  >
                    <option value="Tinggi / Mendesak">Tinggi / Mendesak (Prioritas Utama)</option>
                    <option value="Sedang">Sedang (Dapat dijadwalkan tahun berjalan)</option>
                    <option value="Rendah">Rendah (Pemeliharaan berkala)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEKSI 4: TEMUAN LAPANGAN & REKOMENDASI TEKNIS */}
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
                <AlertTriangle className="w-4 h-4 text-[#1E4E8C]" />
                <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
                  4. Temuan Kerusakan Lapangan & Rekomendasi
                </h4>
              </div>

              <div className="space-y-4">
                {/* Uraian Temuan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Uraian Temuan Kondisi / Kerusakan Fisik di Lapangan *
                  </label>
                  <textarea
                    rows={3}
                    value={uraianTemuan}
                    onChange={(e) => setUraianTemuan(e.target.value)}
                    placeholder="Jelaskan kondisi detail kerusakan, seperti badan jalan ambles, saluran tersumbat, retak buaya, dsb..."
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
                  />
                </div>

                {/* Rekomendasi Penanganan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Rekomendasi Penanganan Teknis
                  </label>
                  <textarea
                    rows={2}
                    value={rekomendasi}
                    onChange={(e) => setRekomendasi(e.target.value)}
                    placeholder="Usulan konstruksi atau perbaikan (contoh: Pembangunan rabat beton mutu K-250 tebal 15 cm disertai pembuatan saluran tali air)..."
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
                  />
                </div>

                {/* Estimasi Kebutuhan Biaya */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Estimasi Kebutuhan Anggaran (Rupiah)
                    </label>
                    <input
                      type="number"
                      value={estimasiBiaya}
                      onChange={(e) => setEstimasiBiaya(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Contoh: 150000000"
                      className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                    />
                    {typeof estimasiBiaya === "number" && estimasiBiaya > 0 && (
                      <p className="text-xs text-[#148B87] font-semibold mt-1">
                        Format: {currency(estimasiBiaya)}
                      </p>
                    )}
                  </div>

                  {/* Status Survey */}
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Status Hasil Survey Lapangan
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as typeof status)}
                      className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-bold"
                    >
                      <option value="Selesai Survey">Selesai Survey (Data Lengkap)</option>
                      <option value="Draft">Draft (Belum Lengkap / Perlu Lanjutan)</option>
                      <option value="Diverifikasi">Diverifikasi (Siap Masuk Usulan Rencana)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 5: DOKUMENTASI FOTO 0% */}
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
                <Camera className="w-4 h-4 text-[#1E4E8C]" />
                <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
                  5. Dokumentasi Foto Lapangan (Titik 0%)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Upload Foto Lapangan (Kamera / File)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs text-[#65778B] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E8F2F8] file:text-[#1E4E8C] hover:file:bg-[#D5E6F3] cursor-pointer border border-[#CCD9E4] rounded-xl p-2 bg-[#FBFDFE]"
                  />
                  <p className="text-[11px] text-[#65778B] mt-1.5">
                    Unggah foto dokumentasi kondisi eksisting 0% titik kerusakan sebagai bukti visual lapangan.
                  </p>
                  
                  {/* Quick sample photo selector if user wants a ready demo image */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-[#65778B]">Gunakan contoh foto:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFotoUrl("https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80");
                        setHasPhoto(true);
                      }}
                      className="text-[11px] font-bold text-[#1E4E8C] underline hover:text-[#143965]"
                    >
                      Jalan Rusak
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFotoUrl("https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80");
                        setHasPhoto(true);
                      }}
                      className="text-[11px] font-bold text-[#1E4E8C] underline hover:text-[#143965]"
                    >
                      Saluran Drainase
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Pratinjau Bukti Visual
                  </label>
                  {fotoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#DCE5ED] bg-black/5 aspect-video max-h-48 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoUrl}
                        alt="Pratinjau Survey Lapangan"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFotoUrl("");
                          setHasPhoto(false);
                        }}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-lg text-xs"
                        title="Hapus foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#CCD9E4] p-6 text-center text-[#65778B] text-xs bg-[#FBFDFE]">
                      <Camera className="w-6 h-6 mx-auto mb-1 text-[#9BB1C2]" />
                      Belum ada foto yang dipilih.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BUTTON SUBMIT & CANCEL */}
            <div className="pt-5 border-t border-[#EAF0F4] flex flex-col sm:flex-row justify-end items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] border border-[#CCD9E4] transition text-center"
              >
                Reset Formulir
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center justify-center gap-2 transition"
              >
                <ClipboardCheck className="w-4 h-4" />
                {editingId ? "Perbarui Data Survey" : "Simpan Data Survey Lapangan"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        /* ================== DAFTAR RIWAYAT SURVEY LAPANGAN ================== */
        <section className="bg-white rounded-2xl border border-[#E1E9F0] shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-5 border-b border-[#EAF0F4] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[#143965]">
                  Daftar Hasil Survey Lapangan
                </h3>
                <p className="text-xs text-[#65778B] mt-0.5">
                  Menampilkan data survey yang telah diinput oleh Operator Disperkimtan Kuningan
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("form");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Survey Baru
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8AA2B5] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari lokasi, desa, kode survey..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#CCD9E4] rounded-xl text-xs bg-white focus:outline-none"
                />
              </div>

              {/* Filter Kecamatan */}
              <div>
                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]"
                >
                  <option value="">Semua Kecamatan</option>
                  {defaultKecamatanList.map((k) => (
                    <option key={k} value={k}>
                      Kecamatan {k}
                    </option>
                  ))}
                  <option value="Kuningan">Kecamatan Kuningan</option>
                  <option value="Cilimus">Kecamatan Cilimus</option>
                </select>
              </div>

              {/* Filter Kondisi */}
              <div>
                <select
                  value={filterKondisi}
                  onChange={(e) => setFilterKondisi(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]"
                >
                  <option value="">Semua Kondisi Fisik</option>
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Sedang">Rusak Sedang</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table or Cards */}
          {filteredSurveys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#61738A] uppercase font-bold text-[11px] border-b border-[#EAF0F4]">
                  <tr>
                    <th className="p-3.5">Kode & Tanggal</th>
                    <th className="p-3.5">Nama Kegiatan / Lokasi</th>
                    <th className="p-3.5">Kondisi</th>
                    <th className="p-3.5">Dimensi</th>
                    <th className="p-3.5">Estimasi Biaya</th>
                    <th className="p-3.5">Urgensi</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF0F4]">
                  {filteredSurveys.map((srv) => {
                    const badgeKondisi =
                      srv.kondisi === "Baik"
                        ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
                        : srv.kondisi === "Rusak Ringan"
                        ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
                        : srv.kondisi === "Rusak Sedang"
                        ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
                        : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

                    return (
                      <tr key={srv.id} className="hover:bg-[#F9FBFC] transition">
                        {/* Kode & Tanggal */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-[#143965] block">{srv.kodeSurvey}</span>
                          <span className="text-[11px] text-[#65778B]">{srv.tanggal}</span>
                          <span className="block text-[10px] text-[#1E4E8C] font-semibold mt-0.5">
                            Oleh: {srv.surveyor}
                          </span>
                        </td>

                        {/* Nama & Lokasi */}
                        <td className="p-3.5 min-w-[220px]">
                          <strong className="block text-[#143965] text-sm leading-snug">
                            {srv.namaKegiatan}
                          </strong>
                          <span className="text-[11px] text-[#65778B] block mt-0.5">
                            {srv.detailLokasi || `${srv.desaKelurahan}, Kec. ${srv.kecamatan}`}
                          </span>
                          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EAF0F4] text-[#1E4E8C]">
                            {srv.kategori}
                          </span>
                        </td>

                        {/* Kondisi */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeKondisi}`}>
                            {srv.kondisi}
                          </span>
                        </td>

                        {/* Dimensi */}
                        <td className="p-3.5 whitespace-nowrap text-[#35536F]">
                          {srv.panjang ? (
                            <div>
                              <span>{srv.panjang} m</span>
                              {srv.lebar && <span className="text-[#8AA2B5]"> × {srv.lebar} m</span>}
                              {srv.luasVolume && (
                                <span className="block text-[11px] text-[#65778B]">
                                  ({srv.luasVolume} {srv.satuan || "m²"})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8AA2B5]">—</span>
                          )}
                        </td>

                        {/* Estimasi Biaya */}
                        <td className="p-3.5 whitespace-nowrap font-bold text-[#148B87]">
                          {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}
                        </td>

                        {/* Urgensi */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`font-semibold text-[11px] ${
                              srv.tingkatUrgensi === "Tinggi / Mendesak"
                                ? "text-[#BD493B]"
                                : srv.tingkatUrgensi === "Sedang"
                                ? "text-[#BD6C1E]"
                                : "text-[#258050]"
                            }`}
                          >
                            {srv.tingkatUrgensi}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="badge selesai text-[11px] font-bold">
                            {srv.status}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="p-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingSurvey(srv)}
                              title="Lihat Detail Survey"
                              className="p-1.5 rounded-lg text-[#1E4E8C] hover:bg-[#E8F2F8] transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditSurvey(srv)}
                              title="Edit Data Survey"
                              className="p-1.5 rounded-lg text-[#148B87] hover:bg-[#EAF6F5] transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data survey ${srv.kodeSurvey}?`)) {
                                  onDeleteSurvey(srv.id);
                                }
                              }}
                              title="Hapus Data Survey"
                              className="p-1.5 rounded-lg text-[#BD493B] hover:bg-[#FDEEED] transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-[#65778B] p-6">
              <ClipboardCheck className="w-10 h-10 mx-auto text-[#9BB1C2] mb-2" />
              <p className="font-bold text-sm text-[#143965]">Belum ada data survey yang cocok.</p>
              <p className="text-xs text-[#65778B] mt-0.5">
                Coba sesuaikan kata kunci pencarian atau buat formulir survey lapangan baru.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ================== MODAL DETAIL SURVEY LAPANGAN ================== */}
      {viewingSurvey && (
        <div className="fixed inset-0 z-50 bg-[#0B2540]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#143965]">
                    Lembar Hasil Survey Lapangan
                  </h3>
                  <p className="text-xs text-[#65778B]">
                    {viewingSurvey.kodeSurvey} · {viewingSurvey.tanggal}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSurvey(null)}
                className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-[#35536F]">
              {/* Kop / Info Card */}
              <div className="bg-[#F8FAFC] border border-[#E1E9F0] rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#1E4E8C] uppercase tracking-wider block">
                    {viewingSurvey.kategori}
                  </span>
                  <h4 className="text-base font-bold text-[#143965] mt-0.5">
                    {viewingSurvey.namaKegiatan}
                  </h4>
                  <p className="text-xs text-[#65778B] mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#BD493B]" />
                    {viewingSurvey.detailLokasi} ({viewingSurvey.desaKelurahan}, Kec. {viewingSurvey.kecamatan})
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="badge selesai">{viewingSurvey.status}</span>
                  <p className="text-[11px] text-[#65778B] mt-1.5">
                    Petugas: <strong>{viewingSurvey.surveyor}</strong>
                  </p>
                  {viewingSurvey.kontakPendamping && (
                    <p className="text-[11px] text-[#65778B]">
                      Pendamping: {viewingSurvey.kontakPendamping}
                    </p>
                  )}
                </div>
              </div>

              {/* Data Teknis Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
                  <span className="text-[10px] text-[#65778B] uppercase font-bold block">Kondisi Fisik</span>
                  <strong className="text-xs text-[#BD493B] block mt-0.5">{viewingSurvey.kondisi}</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
                  <span className="text-[10px] text-[#65778B] uppercase font-bold block">Dimensi</span>
                  <strong className="text-xs text-[#143965] block mt-0.5">
                    {viewingSurvey.panjang ? `${viewingSurvey.panjang}m × ${viewingSurvey.lebar || 0}m` : "—"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
                  <span className="text-[10px] text-[#65778B] uppercase font-bold block">Volume Luas</span>
                  <strong className="text-xs text-[#143965] block mt-0.5">
                    {viewingSurvey.luasVolume ? `${viewingSurvey.luasVolume} ${viewingSurvey.satuan}` : "—"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
                  <span className="text-[10px] text-[#65778B] uppercase font-bold block">Estimasi Biaya</span>
                  <strong className="text-xs text-[#148B87] block mt-0.5">
                    {viewingSurvey.estimasiBiaya ? currency(viewingSurvey.estimasiBiaya) : "—"}
                  </strong>
                </div>
              </div>

              {/* Temuan & Rekomendasi */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#FFFBF7] border border-[#FAD8B8]">
                  <strong className="block text-xs font-bold text-[#9C5311] uppercase tracking-wider mb-1">
                    Hasil Temuan Kerusakan Lapangan:
                  </strong>
                  <p className="text-xs text-[#4E3218] leading-relaxed">
                    {viewingSurvey.uraianTemuan}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F9FD] border border-[#CFE1EE]">
                  <strong className="block text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-1">
                    Rekomendasi Penanganan Teknis:
                  </strong>
                  <p className="text-xs text-[#173859] leading-relaxed">
                    {viewingSurvey.rekomendasi || "Belum ada rekomendasi teknis spesifik tercatat."}
                  </p>
                </div>
              </div>

              {/* Koordinat GPS & Peta */}
              {viewingSurvey.koordinat && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F9FB] border border-[#E1E9F0]">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#1E4E8C]" />
                    <span className="font-mono text-xs">Koordinat: {viewingSurvey.koordinat}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${viewingSurvey.koordinat}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
                  >
                    Buka Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Foto Bukti Lapangan */}
              {viewingSurvey.fotoUrl && (
                <div>
                  <strong className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-2">
                    Dokumentasi Kondisi 0% Lapangan:
                  </strong>
                  <div className="rounded-xl overflow-hidden border border-[#DCE5ED] aspect-video max-h-64 bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewingSurvey.fotoUrl}
                      alt="Dokumentasi Lapangan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAF0F4] bg-[#F8FAFC] flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#1E4E8C] border border-[#C5DCEB] hover:bg-[#E8F2F8] flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Lembar Survey
              </button>

              <button
                type="button"
                onClick={() => setViewingSurvey(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#143965] text-white hover:bg-[#0E2849] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
