"use client";

import React, { useState } from "react";
import { ClipboardCheck, Plus, FileSpreadsheet } from "lucide-react";
import { FieldSurvey, Program, User } from "../../types";
import { currency } from "../../utils/helpers";
import { SurveyFormSection } from "./survey/SurveyFormSection";
import { SurveyListSection } from "./survey/SurveyListSection";
import { SurveyDetailModal } from "./survey/SurveyDetailModal";
import { useSurveyForm } from "./survey/useSurveyForm";

interface SurveyViewProps {
  currentUser: User;
  programs: Program[];
  surveys: FieldSurvey[];
  onSaveSurvey: (survey: FieldSurvey, photoFile?: File) => void;
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
  const isAdmin = currentUser.role === "Admin";

  // Tab State: "form" | "list"
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [viewingSurvey, setViewingSurvey] = useState<FieldSurvey | null>(null);

  // Filter & Search State (for list tab)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("");

  // Form state & handlers (extracted to hook)
  const form = useSurveyForm({ currentUser, programs, surveys });

  // Summary Metrics
  const totalSurveys = surveys.length;
  const rusakBeratCount = surveys.filter(
    (s) => s.kondisi === "Rusak Berat" || s.kondisi === "Rusak Sedang"
  ).length;
  const selesaiCount = surveys.filter(
    (s) => s.status === "Selesai Survey" || s.status === "Diverifikasi"
  ).length;
  const totalEstimasi = surveys.reduce(
    (acc, curr) => acc + (curr.estimasiBiaya || 0),
    0
  );

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
              <h2 className="text-2xl font-bold text-[#143965]">
                Form Survey Lapangan
              </h2>
              <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
                Formulir pendataan teknis, dokumentasi fisik 0%, dan verifikasi
                lapangan Disperkimtan Kuningan
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#DCE5ED] shadow-xs">
          <button
            onClick={() => {
              if (activeTab !== "form") {
                form.resetForm();
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
            {form.editingId ? "Edit Form Survey" : "Input Survey Baru"}
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
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Total Survey Dilakukan
          </p>
          <strong className="block text-2xl font-bold text-[#143965] mt-1.5">
            {totalSurveys}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Titik lokasi terdata
          </span>
        </article>
        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator orange">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Kondisi Rusak Sedang/Berat
          </p>
          <strong className="block text-2xl font-bold text-[#BD493B] mt-1.5">
            {rusakBeratCount}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Perlu prioritas penanganan
          </span>
        </article>
        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator green">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Survey Lengkap / Selesai
          </p>
          <strong className="block text-2xl font-bold text-[#258050] mt-1.5">
            {selesaiCount}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Siap verifikasi & penganggaran
          </span>
        </article>
        <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator teal">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Total Estimasi Kebutuhan
          </p>
          <strong className="block text-xl font-bold text-[#148B87] mt-1.5 truncate">
            {currency(totalEstimasi)}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Kalkulasi usulan lapangan
          </span>
        </article>
      </div>

      {/* Main Content Area */}
      {activeTab === "form" ? (
        <SurveyFormSection
          activeTab={activeTab}
          currentUser={currentUser}
          programs={programs}
          surveys={surveys}
          onSaveSurvey={onSaveSurvey}
          onCancelEdit={() => setActiveTab("list")}
        />
      ) : (
        <SurveyListSection
          surveys={surveys}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterKecamatan={filterKecamatan}
          setFilterKecamatan={setFilterKecamatan}
          filterKondisi={filterKondisi}
          setFilterKondisi={setFilterKondisi}
          onViewSurvey={setViewingSurvey}
          onEditSurvey={form.handleEditSurvey}
          onDeleteSurvey={onDeleteSurvey}
          isAdmin={isAdmin}
          onAddSurvey={() => {
            form.resetForm();
            setActiveTab("form");
          }}
        />
      )}

      {/* Detail Modal */}
      <SurveyDetailModal
        viewingSurvey={viewingSurvey}
        onClose={() => setViewingSurvey(null)}
      />
    </div>
  );
};
