"use client";

import React, { useState } from "react";
import { ClipboardCheck, AlertTriangle, Camera, X, CheckCircle2 } from "lucide-react";
import { FieldSurvey, Program, User } from "../../../types";
import { currency } from "../../../utils/helpers";
import { Select, Input } from "@/app/components/ui/Input";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { useSurveyForm } from "./useSurveyForm";
import { SurveyFormSection1 } from "./sections/SurveyFormSection1";
import { SurveyFormSection2 } from "./sections/SurveyFormSection2";
import { SurveyFormSection3 } from "./sections/SurveyFormSection3";
import { SurveyFormSection4 } from "./sections/SurveyFormSection4";
import { SurveyFormSection5 } from "./sections/SurveyFormSection5";

interface SurveyFormSectionProps {
  activeTab: "form" | "list";
  currentUser: User;
  programs: Program[];
  surveys: FieldSurvey[];
  onSaveSurvey: (survey: FieldSurvey, photoFile?: File) => void;
  onCancelEdit?: () => void;
}

export function SurveyFormSection({
  activeTab,
  currentUser,
  programs,
  surveys,
  onSaveSurvey,
  onCancelEdit,
}: SurveyFormSectionProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel: string;
  } | null>(null);

  const {
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
    errorMessage,
    setErrorMessage,
    resetForm,
    handleEditSurvey,
    handleProgramSelect,
    handleGetLocation,
    handlePhotoUpload,
    handlePanjangChange,
    handleLebarChange,
    buildSurvey,
  } = useSurveyForm({ currentUser, programs, surveys });

  if (activeTab !== "form") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const survey = buildSurvey();
    if (!survey) return;

    setConfirmDialog({
      open: true,
      title: editingId ? "Perbarui Data Survey" : "Simpan Survey Baru",
      message: editingId ? "Yakin ingin memperbarui data survey ini?" : "Yakin ingin menyimpan survey baru ini?",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await onSaveSurvey(survey, photoFile ?? undefined);
          resetForm();
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Survey gagal disimpan.");
        }
      },
      onCancel: () => setConfirmDialog(null),
      confirmLabel: editingId ? "Ya, Perbarui" : "Ya, Simpan",
    });
  };

  return (
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
            onClick={() => {
              resetForm();
              onCancelEdit?.();
            }}
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

        <SurveyFormSection1
          currentUser={currentUser}
          programs={programs}
          selectedProgramId={selectedProgramId}
          setSelectedProgramId={setSelectedProgramId}
          namaKegiatan={namaKegiatan}
          setNamaKegiatan={setNamaKegiatan}
          kategori={kategori}
          setKategori={setKategori}
          tanggal={tanggal}
          setTanggal={setTanggal}
          surveyor={surveyor}
          setSurveyor={setSurveyor}
          kontakPendamping={kontakPendamping}
          setKontakPendamping={setKontakPendamping}
          kecamatan={kecamatan}
          setKecamatan={setKecamatan}
          desaKelurahan={desaKelurahan}
          setDesaKelurahan={setDesaKelurahan}
          detailLokasi={detailLokasi}
          setDetailLokasi={setDetailLokasi}
          handleProgramSelect={handleProgramSelect}
        />

        <SurveyFormSection2
          kecamatan={kecamatan}
          setKecamatan={setKecamatan}
          desaKelurahan={desaKelurahan}
          setDesaKelurahan={setDesaKelurahan}
          detailLokasi={detailLokasi}
          setDetailLokasi={setDetailLokasi}
          koordinat={koordinat}
          setKoordinat={setKoordinat}
          isGettingLocation={isGettingLocation}
          setIsGettingLocation={setIsGettingLocation}
          handleGetLocation={handleGetLocation}
        />

        <SurveyFormSection3
          kondisi={kondisi}
          setKondisi={setKondisi}
          tipeKonstruksi={tipeKonstruksi}
          setTipeKonstruksi={setTipeKonstruksi}
          panjang={panjang}
          setPanjang={setPanjang}
          lebar={lebar}
          setLebar={setLebar}
          luasVolume={luasVolume}
          setLuasVolume={setLuasVolume}
          satuan={satuan}
          setSatuan={setSatuan}
          tingkatUrgensi={tingkatUrgensi}
          setTingkatUrgensi={setTingkatUrgensi}
          handlePanjangChange={handlePanjangChange}
          handleLebarChange={handleLebarChange}
        />

        <SurveyFormSection4
          uraianTemuan={uraianTemuan}
          setUraianTemuan={setUraianTemuan}
          rekomendasi={rekomendasi}
          setRekomendasi={setRekomendasi}
          estimasiBiaya={estimasiBiaya}
          setEstimasiBiaya={setEstimasiBiaya}
          status={status}
          setStatus={setStatus}
        />

        <SurveyFormSection5
          photoFile={photoFile}
          setPhotoFile={setPhotoFile}
        />

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

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          confirmLabel={confirmDialog.confirmLabel}
        />
      )}
    </section>
  );
}
