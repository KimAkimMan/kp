"use client";

import React from "react";
import { FieldSurvey, Program, User, PageType } from "../../types";
import { currency } from "../../utils/helpers";
import { useAdminSurveyForm } from "./admin-survey/useAdminSurveyForm";
import { AdminSurveyDetailSection } from "./admin-survey/AdminSurveyDetailSection";
import { AdminSurveyListSection } from "./admin-survey/AdminSurveyListSection";
import { AdminSurveyConversionModal } from "./admin-survey/AdminSurveyConversionModal";

interface AdminSurveyViewProps {
  currentUser: User;
  surveys: FieldSurvey[];
  programs: Program[];
  operators: User[];
  onVerifySurvey: (survey: FieldSurvey, reason?: string) => void | Promise<void>;
  onRejectSurvey: (survey: FieldSurvey, reason?: string) => void | Promise<void>;
  onRequestRevision: (survey: FieldSurvey, reason?: string) => void | Promise<void>;
  onCreateProgramFromSurvey: (
    survey: FieldSurvey,
    customData?: Partial<Program>
  ) => void;
  onViewProgram?: (programId: number) => void;
}

export const AdminSurveyView: React.FC<AdminSurveyViewProps> = ({
  currentUser,
  surveys,
  programs,
  operators,
  onVerifySurvey,
  onRejectSurvey,
  onRequestRevision,
  onCreateProgramFromSurvey,
  onViewProgram,
}) => {
  const form = useAdminSurveyForm({ currentUser, programs, surveys, operators });

  const {
    // Form state
    selectedSurveyId,
    setSelectedSurveyId,
    detailSurvey,
    convertingSurvey,
    setConvertingSurvey,
    convertedNama,
    setConvertedNama,
    convertedKategori,
    setConvertedKategori,
    convertedPagu,
    setConvertedPagu,
    convertedTarget,
    setConvertedTarget,
    convertedSatuan,
    setConvertedSatuan,
    convertedKecamatan,
    setConvertedKecamatan,
    convertedDesa,
    setConvertedDesa,
    convertedDetailLokasi,
    setConvertedDetailLokasi,
    convertedOperatorId,
    setConvertedOperatorId,
    // Filter state
    searchTerm,
    setSearchTerm,
    filterKategori,
    setFilterKategori,
    filterStatusKonversi,
    setFilterStatusKonversi,
    filterUrgensi,
    setFilterUrgensi,
    filterKecamatan,
    setFilterKecamatan,
    // Derived
    filteredSurveys,
    totalSurveys,
    unconvertedCount,
    convertedCount,
    totalEstimasiUnconverted,
    // Handlers
    handleOpenConversionModal,
    resetFilters,
  } = form;

  const handleConfirmConversion = (data: {
    nama: string;
    namaKegiatan: string;
    kategori: string;
    pagu: number;
    target: number;
    targetVolume: number;
    satuan: string;
    kecamatan: string;
    desaKelurahan: string;
    detailLokasi: string;
    lokasi: string;
    operatorPengelolaId: number | null;
    operatorPengelola: string | null;
  }) => {
    const surveyForConversion = form.detailSurvey || convertingSurvey
    if (!surveyForConversion) return
    onCreateProgramFromSurvey(surveyForConversion, data);
    setConvertingSurvey(null);
    setSelectedSurveyId(null);
  };

  return (
    <div className="space-y-6">
      {selectedSurveyId ? (
        <AdminSurveyDetailSection
          detailSurvey={detailSurvey}
          connectedProgram={
            form.detailSurvey ? programs.find((p) => p.id === form.detailSurvey?.programId) : undefined
          }
          isConverted={
            !!form.detailSurvey?.programId ||
            form.detailSurvey?.status === "Dikonversi"
          }
          isVerified={form.detailSurvey?.status === "Diverifikasi"}
          onClose={() => setSelectedSurveyId(null)}
          onVerifySurvey={onVerifySurvey}
          onRejectSurvey={onRejectSurvey}
          onRequestRevision={onRequestRevision}
          onOpenConversionModal={handleOpenConversionModal}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#143965]">
                    Hasil Survey Lapangan Operator
                  </h2>
                  <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
                    Tinjau pendataan riil lapangan dari operator dan konversi langsung
                    menjadi kegiatan resmi di Master Kegiatan
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator">
              <p className="text-xs font-semibold text-[#65778B] m-0">
                Total Survey Masuk
              </p>
              <strong className="block text-2xl font-bold text-[#143965] mt-1.5">
                {totalSurveys}
              </strong>
              <span className="text-[11px] text-[#65778B] block mt-1">
                Dari seluruh operator dinas
              </span>
            </article>
            <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator orange">
              <p className="text-xs font-semibold text-[#65778B] m-0">
                Belum Jadi Kegiatan
              </p>
              <strong className="block text-2xl font-bold text-[#E78A31] mt-1.5">
                {unconvertedCount} Usulan
              </strong>
              <span className="text-[11px] text-[#65778B] block mt-1">
                Menunggu konversi ke Master
              </span>
            </article>
            <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator green">
              <p className="text-xs font-semibold text-[#65778B] m-0">
                Sudah Jadi Master Kegiatan
              </p>
              <strong className="block text-2xl font-bold text-[#258050] mt-1.5">
                {convertedCount} Kegiatan
              </strong>
              <span className="text-[11px] text-[#65778B] block mt-1">
                Telah diagendakan di dinas
              </span>
            </article>
            <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator teal">
              <p className="text-xs font-semibold text-[#65778B] m-0">
                Estimasi Usulan Menunggu
              </p>
              <strong className="block text-xl font-bold text-[#148B87] mt-1.5 truncate">
                {currency(totalEstimasiUnconverted)}
              </strong>
              <span className="text-[11px] text-[#65778B] block mt-1">
                Total biaya usulan baru
              </span>
            </article>
          </div>

          <AdminSurveyListSection
            surveys={filteredSurveys}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterKategori={filterKategori}
            setFilterKategori={setFilterKategori}
            filterStatusKonversi={filterStatusKonversi}
            setFilterStatusKonversi={setFilterStatusKonversi}
            filterUrgensi={filterUrgensi}
            setFilterUrgensi={setFilterUrgensi}
            filterKecamatan={filterKecamatan}
            setFilterKecamatan={setFilterKecamatan}
            totalSurveys={totalSurveys}
            unconvertedCount={unconvertedCount}
            convertedCount={convertedCount}
            totalEstimasiUnconverted={totalEstimasiUnconverted}
            onViewSurvey={(srv) => setSelectedSurveyId(srv.id)}
            onEditSurvey={() => {}}
            onDeleteSurvey={() => {}}
            onAddSurvey={() => resetFilters()}
          />
        </>
      )}

      {convertingSurvey && (
        <AdminSurveyConversionModal
          convertingSurvey={convertingSurvey}
          operators={operators}
          convertedNama={convertedNama}
          setConvertedNama={setConvertedNama}
          convertedKategori={convertedKategori}
          setConvertedKategori={setConvertedKategori}
          convertedPagu={convertedPagu}
          setConvertedPagu={setConvertedPagu}
          convertedTarget={convertedTarget}
          setConvertedTarget={setConvertedTarget}
          convertedSatuan={convertedSatuan}
          setConvertedSatuan={setConvertedSatuan}
          convertedKecamatan={convertedKecamatan}
          setConvertedKecamatan={setConvertedKecamatan}
          convertedDesa={convertedDesa}
          setConvertedDesa={setConvertedDesa}
          convertedDetailLokasi={convertedDetailLokasi}
          setConvertedDetailLokasi={setConvertedDetailLokasi}
          convertedOperatorId={convertedOperatorId}
          setConvertedOperatorId={setConvertedOperatorId}
          onClose={() => setConvertingSurvey(null)}
          onConfirm={handleConfirmConversion}
        />
      )}
    </div>
  );
};
