"use client";

import { useState } from "react";
import type { PageType, Program, User } from "@/app/types";
import { PublicLanding } from "@/app/components/PublicLanding";
import { LoginScreen } from "@/app/components/LoginScreen";
import { Sidebar } from "@/app/components/Sidebar";
import { Topbar } from "@/app/components/Topbar";
import { Toast } from "@/app/components/Toast";
import { DashboardView } from "@/app/components/views/DashboardView";
import { UsersView } from "@/app/components/views/UsersView";
import { MasterActivitiesView } from "@/app/components/views/MasterActivitiesView";
import { ProgramsView } from "@/app/components/views/ProgramsView";
import { SurveyView } from "@/app/components/views/SurveyView";
import { AdminSurveyView } from "@/app/components/views/AdminSurveyView";
import { ScheduleView } from "@/app/components/views/ScheduleView";
import { HistoryView } from "@/app/components/views/HistoryView";
import { ReportsView } from "@/app/components/views/ReportsView";
import { DetailView } from "@/app/components/views/DetailView";
import { MasterActivityDetailView } from "@/app/components/views/MasterActivityDetailView";
import { ProfileView } from "@/app/components/views/ProfileView";
import { UserModal, ActivityModal, ScheduleModal, CostModal } from "@/app/components/Modals";
import { useAppState } from "@/app/hooks/useAppState";

export default function Home() {
  const {
    screen, setScreen,
    currentPage, setCurrentPage,
    previousPage, setPreviousPage,
    sidebarOpen, setSidebarOpen,
    selectedProgramId, setSelectedProgramId,
    targetAdviceProgramId, setTargetAdviceProgramId,
    currentUser, setCurrentUser,
    users, setUsers,
    programs, setPrograms,
    adviceRecords, setAdviceRecords,
    surveys, setSurveys,
    userModalOpen, setUserModalOpen,
    editingUser, setEditingUser,
    activityModalOpen, setActivityModalOpen,
    editingActivity, setEditingActivity,
    scheduleModalOpen, setScheduleModalOpen,
    targetProgramForSchedule, setTargetProgramForSchedule,
    costModalOpen, setCostModalOpen,
    targetProgramForCost, setTargetProgramForCost,
    showToast,
    handleLoginSuccess,
    handleLogout,
    handleViewProgram,
    handleViewMasterActivity,
    handleNavigateSchedulePage,
    handleClaimProgram,
    handleAcceptAssignment,
    handleReleaseAssignment,
    handleDeleteAssignment,
    handleSaveUser,
    handleDeleteUser,
    handleResetPassword,
    handleDeleteActivity,
    handleSaveActivity,
    handleSaveSurvey,
    handleDeleteSurvey,
    handleVerifySurvey,
    handleRejectSurvey,
    handleRequestRevision,
    handleCreateProgramFromSurvey,
    handleSaveSchedule,
    handleSaveProgress,
    handleMarkComplete,
    handleVerifyProgress,
    handleVerifyCost,
    handleSaveCost,
    handleUpdateAdviceStatus,
    refreshAdvice,
    pendingNotificationCount,
    toast, setToast,
  } = useAppState();

  // Public Landing Screen
  if (screen === "landing") {
    return (
      <>
        <PublicLanding
          onOpenLogin={() => setScreen("login")}
          onSelectProgram={(id) => {
            setSelectedProgramId(id);
            setScreen("login");
          }}
        />
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null })} />
      </>
    );
  }

  // Login Screen
  if (screen === "login") {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} onBackToLanding={() => setScreen("landing")} />
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null })} />
      </>
    );
  }

  // Active App Screen
  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];

  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      {currentUser && (
        <Sidebar
          currentUser={currentUser}
          currentPage={currentPage}
          isOpen={sidebarOpen}
          onNavigate={(page: PageType) => setCurrentPage(page)}
          onLogout={handleLogout}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {currentUser && (
          <Topbar
            currentUser={currentUser}
            currentPage={currentPage}
            pendingNotificationCount={pendingNotificationCount}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigate={(page: PageType) => setCurrentPage(page)}
          />
        )}

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {currentUser && currentPage === "dashboard" && (
            <DashboardView
              currentUser={currentUser}
              programs={programs}
              adviceRecords={adviceRecords}
              surveys={surveys}
              onNavigate={(page: PageType) => setCurrentPage(page)}
              onSelectProgram={handleViewProgram}
              onDeleteProgram={handleDeleteActivity}
              onDeleteSurvey={handleDeleteSurvey}
              onAdviceCreated={refreshAdvice}
              initialAdviceProgramId={targetAdviceProgramId}
              onClearInitialAdviceProgramId={() => setTargetAdviceProgramId(null)}
            />
          )}

          {currentUser && currentPage === "users" && currentUser.role === "Admin" && (
            <UsersView
              users={users}
              currentUser={currentUser}
              onOpenAddUser={() => { setEditingUser(null); setUserModalOpen(true); }}
              onOpenEditUser={(u: User) => { setEditingUser(u); setUserModalOpen(true); }}
              onDeleteUser={handleDeleteUser}
              onResetPassword={handleResetPassword}
            />
          )}

          {currentUser && currentPage === "masteractivities" && currentUser.role === "Admin" && (
            <MasterActivitiesView
              programs={programs}
              onOpenAddActivity={() => { setEditingActivity(null); setActivityModalOpen(true); }}
              onOpenEditActivity={(p: Program) => { setEditingActivity(p); setActivityModalOpen(true); }}
              onViewProgram={handleViewMasterActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {currentUser && currentPage === "programs" && (
            <ProgramsView
              currentUser={currentUser}
              programs={programs}
              onViewProgram={handleViewProgram}
              onOpenScheduleModal={(p: Program) => { setTargetProgramForSchedule(p); setScheduleModalOpen(true); }}
              onClaimProgram={handleClaimProgram}
              onNavigateSchedulePage={handleNavigateSchedulePage}
              onAcceptAssignment={handleAcceptAssignment}
              onReleaseAssignment={handleReleaseAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {currentUser && currentPage === "survey" && (
            <SurveyView
              currentUser={currentUser}
              programs={programs}
              surveys={surveys}
              onSaveSurvey={handleSaveSurvey}
              onDeleteSurvey={handleDeleteSurvey}
              onNavigateToProgram={(progId: number) => { setSelectedProgramId(progId); setCurrentPage("schedule"); }}
            />
          )}

          {currentUser && currentPage === "adminsurvey" && (
            <AdminSurveyView
              currentUser={currentUser}
              surveys={surveys}
              programs={programs}
              operators={users}
              onVerifySurvey={handleVerifySurvey}
              onRejectSurvey={handleRejectSurvey}
              onRequestRevision={handleRequestRevision}
              onCreateProgramFromSurvey={handleCreateProgramFromSurvey}
              onViewProgram={handleViewProgram}
            />
          )}

          {currentUser && currentPage === "schedule" && (
            <ScheduleView
              currentUser={currentUser}
              programs={programs}
              selectedProgramId={selectedProgramId}
              onSelectProgramId={setSelectedProgramId}
              onBack={() => setCurrentPage("programs")}
              onOpenScheduleModal={(p: Program) => { setTargetProgramForSchedule(p); setScheduleModalOpen(true); }}
              onOpenCostModal={(p: Program) => { setTargetProgramForCost(p); setCostModalOpen(true); }}
              onSaveProgress={handleSaveProgress}
              onMarkComplete={handleMarkComplete}
              onVerifyProgress={handleVerifyProgress}
              onVerifyCost={handleVerifyCost}
              onNotify={(msg: string, type?: "success" | "error") => showToast(msg, type)}
            />
          )}

          {currentUser && currentPage === "history" && (
            <HistoryView
              currentUser={currentUser}
              programs={programs}
              selectedProgramId={selectedProgramId}
              onSelectProgramId={setSelectedProgramId}
            />
          )}

          {currentUser && currentPage === "reports" && (
            <ReportsView
              currentUser={currentUser}
              programs={programs}
              onNotify={(msg: string) => showToast(msg)}
            />
          )}

          {currentUser && currentPage === "detail" && selectedProgram && (
            <DetailView
              program={selectedProgram}
              currentUser={currentUser}
              onBack={() => setCurrentPage(previousPage)}
              onNavigateToDashboardAdvice={(programId: number) => { setTargetAdviceProgramId(programId); setCurrentPage("dashboard"); }}
              onNotify={(msg: string, type?: "success" | "error") => showToast(msg, type)}
            />
          )}

          {currentUser && currentPage === "masteractivitydetail" && selectedProgram && (
            <MasterActivityDetailView
              program={selectedProgram}
              currentUser={currentUser}
              onBack={() => setCurrentPage("masteractivities")}
              onNotify={(msg: string, type?: "success" | "error") => showToast(msg, type)}
            />
          )}

          {currentUser && currentPage === "profile" && (
            <ProfileView
              currentUser={currentUser}
              adviceRecords={adviceRecords}
              onUpdateAdviceStatus={handleUpdateAdviceStatus}
              onNavigateToProgram={(programId: number) => { setSelectedProgramId(programId); setCurrentPage("schedule"); }}
            />
          )}
        </main>
      </div>

      {userModalOpen && (
        <UserModal user={editingUser} onClose={() => { setUserModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} />
      )}
      {activityModalOpen && (
        <ActivityModal activity={editingActivity} operators={users} onClose={() => { setActivityModalOpen(false); setEditingActivity(null); }} onSave={handleSaveActivity} />
      )}
      {scheduleModalOpen && targetProgramForSchedule && (
        <ScheduleModal program={targetProgramForSchedule} onClose={() => { setScheduleModalOpen(false); setTargetProgramForSchedule(null); }} onSave={handleSaveSchedule} />
      )}
      {costModalOpen && targetProgramForCost && (
        <CostModal program={targetProgramForCost} onClose={() => { setCostModalOpen(false); setTargetProgramForCost(null); }} onSave={handleSaveCost} />
      )}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null })} />
    </div>
  );
}
