"use client";

import React from "react";
import { User, AdviceRecord, FieldSurvey, PageType, Program } from "../../types";
import { getProgramYear } from "../../utils/helpers";
import { useDashboard } from "./dashboard/useDashboard";
import { DashboardStatCards } from "./dashboard/DashboardStatCards";
import { DashboardSurveyBanner } from "./dashboard/DashboardSurveyBanner";
import { DashboardAdviceBanner } from "./dashboard/DashboardAdviceBanner";
import { DashboardOperatorSurveySection } from "./dashboard/DashboardOperatorSurveySection";
import { DashboardPimpinanSection } from "./dashboard/DashboardPimpinanSection";
import { DashboardBudgetSection } from "./dashboard/DashboardBudgetSection";
import { DashboardProgramList } from "./dashboard/DashboardProgramList";
import { DashboardAdminDeletePanel } from "./dashboard/DashboardAdminDeletePanel";
import { DeleteConfirmModal } from "./dashboard/DeleteConfirmModal";

interface DashboardViewProps {
  currentUser: User;
  programs: Program[];
  adviceRecords: AdviceRecord[];
  surveys?: FieldSurvey[];
  onNavigate: (page: PageType) => void;
  onSelectProgram: (id: number) => void;
  onDeleteProgram?: (program: Program) => void | Promise<void>;
  onDeleteSurvey?: (surveyId: string) => void;
  onAdviceCreated?: () => void | Promise<void>;
  initialAdviceProgramId?: number | null;
  onClearInitialAdviceProgramId?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  programs,
  adviceRecords,
  surveys = [],
  onNavigate,
  onSelectProgram,
  onDeleteProgram,
  onDeleteSurvey,
  onAdviceCreated,
  initialAdviceProgramId,
  onClearInitialAdviceProgramId,
}) => {
  const {
    livePrograms,
    liveSurveys,
    liveAdviceRecords,
    isLoading,
    feedbackNotice,
    feedbackError,
    setFeedbackNotice,
    setFeedbackError,
    isOperator,
    isPimpnin,
    isAdmin,
    displayPrograms,
    summary,
    activeCount,
    doneCount,
    availableYears,
    availableCategories,
    filteredDashboardPrograms,
    operatorAdvice,
    pendingAdvice,
    dashboardYearFilter,
    setDashboardYearFilter,
    dashboardCategoryFilter,
    setDashboardCategoryFilter,
    confirmDeleteProgram,
    setConfirmDeleteProgram,
    confirmDeleteSurveyId,
    setConfirmDeleteSurveyId,
    adminSearchTerm,
    setAdminSearchTerm,
    refreshDashboardData,
    handleAdviceSubmit,
    handleConfirmDeleteProgram,
    handleConfirmDeleteSurvey,
  } = useDashboard({
    currentUser,
    programs,
    adviceRecords,
    surveys,
    onNavigate,
    onAdviceCreated,
    initialAdviceProgramId,
    onClearInitialAdviceProgramId,
  });

  const renderNotice = () => (
    <>
      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-[#E7F6ED] border border-[#C8E8D5] text-xs font-semibold text-[#258050] flex items-center justify-between shadow-xs">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-[#258050] hover:underline text-[11px]"
          >
            Tutup
          </button>
        </div>
      )}
      {feedbackError && (
        <div className="p-3.5 rounded-xl bg-[#FDEEED] border border-[#F8C8C4] text-xs font-semibold text-[#BD493B] flex items-center justify-between shadow-xs">
          <span>{feedbackError}</span>
          <button
            type="button"
            onClick={() => setFeedbackError(null)}
            className="text-[#BD493B] hover:underline text-[11px]"
          >
            Tutup
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {renderNotice()}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-[#143965]">
              {isAdmin && "Dashboard Admin"}
              {isOperator && "Dashboard Operator"}
              {isPimpnin && "Dashboard Pimpnin"}
            </h2>
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F2F8] text-[#1E4E8C] animate-pulse">
                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Memuat API...
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void refreshDashboardData()}
                title="Segarkan data dari backend"
                className="p-1 rounded-lg text-[#65778B] hover:text-[#1E4E8C] hover:bg-[#E8F2F8] transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            {isAdmin && "Kelola master kegiatan, sortir kategori tahun anggaran, serta pantau target dan realisasi."}
            {isOperator && "Pantau kegiatan yang Anda kelola per kategori tahun, realisasi lapangan, dan jadwal."}
            {isPimpnin && "Ringkasan capaian target dan akumulasi anggaran seluruh kegiatan permukiman."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate("masteractivities")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Kegiatan
          </button>
        )}

        {isPimpnin && (
          <button
            onClick={() => onNavigate("reports")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zM12 15a2 2 0 01-2-2V4a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2z"
              />
            </svg>
            Tinjau Laporan
          </button>
        )}
      </div>

      <DashboardStatCards
        displayPrograms={displayPrograms}
        summary={summary as unknown as Record<string, unknown>}
        activeCount={activeCount}
        doneCount={doneCount}
      />

      {isAdmin && liveSurveys.length > 0 && (
        <DashboardSurveyBanner
          surveys={liveSurveys}
          onNavigateToAdminSurvey={() => onNavigate("adminsurvey")}
          onDeleteSurvey={onDeleteSurvey || (() => {})}
          setConfirmDeleteSurveyId={setConfirmDeleteSurveyId}
          isDeleting={false}
        />
      )}

      {isOperator && (
        <DashboardAdviceBanner
          user={currentUser}
          operatorAdvice={operatorAdvice}
          pendingAdvice={pendingAdvice}
          onNavigateToProfile={() => onNavigate("profile")}
        />
      )}

      {isOperator && (
        <DashboardOperatorSurveySection
          user={currentUser}
          surveys={liveSurveys}
          onNavigateToSurvey={() => onNavigate("survey")}
        />
      )}

      {isPimpnin && (
        <DashboardPimpinanSection
          programs={displayPrograms}
          adviceRecords={liveAdviceRecords}
        />
      )}

      <DashboardBudgetSection summary={summary as unknown as Record<string, unknown>} />

      <DashboardProgramList
        filteredPrograms={filteredDashboardPrograms}
        yearFilter={dashboardYearFilter}
        categoryFilter={dashboardCategoryFilter}
        totalCount={displayPrograms.length}
        onYearChange={setDashboardYearFilter}
        onCategoryChange={setDashboardCategoryFilter}
        onSelectProgram={onSelectProgram}
        isAdmin={isAdmin}
        onDeleteProgram={(p: Program) => setConfirmDeleteProgram(p)}
        onNavigateToPrograms={() => onNavigate("programs")}
      />

      {isAdmin && (
        <DashboardAdminDeletePanel
          adminFilteredPrograms={displayPrograms.filter((p: Program) => {
            const matchesQuery = (
              p.nama +
              " " +
              p.kode +
              " " +
              (p.penyedia || "") +
              " " +
              (p.operatorPengelola || "")
            )
              .toLowerCase()
              .includes(adminSearchTerm.toLowerCase());
            const matchesYear =
              !dashboardYearFilter || getProgramYear(p) === dashboardYearFilter;
            const matchesCategory =
              !dashboardCategoryFilter || p.kategori === dashboardCategoryFilter;
            return matchesQuery && matchesYear && matchesCategory;
          })}
          adminSearchTerm={adminSearchTerm}
          setAdminSearchTerm={setAdminSearchTerm}
          isDeleting={false}
          onDeleteProgram={(p: Program) => setConfirmDeleteProgram(p)}
          setConfirmDeleteProgram={setConfirmDeleteProgram}
        />
      )}

      {confirmDeleteProgram && (
        <DeleteConfirmModal
          open={true}
          title="Hapus Kegiatan"
          message={`Apakah Anda yakin ingin menghapus kegiatan "${confirmDeleteProgram.nama}"? Data ini akan dihapus secara permanen dari server.`}
          onConfirm={handleConfirmDeleteProgram}
          onCancel={() => setConfirmDeleteProgram(null)}
          isDeleting={false}
          confirmLabel="Ya, Hapus"
        />
      )}

      {confirmDeleteSurveyId && (
        <DeleteConfirmModal
          open={true}
          title="Hapus Survey Lapangan"
          message="Apakah Anda yakin ingin menghapus data survey lapangan ini?"
          onConfirm={handleConfirmDeleteSurvey}
          onCancel={() => setConfirmDeleteSurveyId(null)}
          isDeleting={false}
          confirmLabel="Ya, Hapus"
        />
      )}
    </div>
  );
};
