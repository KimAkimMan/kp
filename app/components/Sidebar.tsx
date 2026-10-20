"use client";

import React from "react";
import {
  Building2,
  LayoutDashboard,
  Users,
  FolderPlus,
  FolderKanban,
  ClipboardCheck,
  FileBarChart,
  UserRound,
  History,
  LogOut,
  X,
} from "lucide-react";
import { PageType, User } from "../types";

interface SidebarProps {
  currentUser: User;
  currentPage: PageType;
  isOpen: boolean;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentPage,
  isOpen,
  onNavigate,
  onLogout,
  onCloseMobile,
}) => {
  const getNavItems = () => {
    switch (currentUser.role) {
      case "Admin":
        return [
          { page: "dashboard" as PageType, label: "Dashboard Admin", icon: LayoutDashboard },
          { page: "users" as PageType, label: "Manajemen Pengguna", icon: Users },
          { page: "masteractivities" as PageType, label: "Master Kegiatan", icon: FolderPlus },
          { page: "adminsurvey" as PageType, label: "Hasil Survey Operator", icon: ClipboardCheck },
          { page: "programs" as PageType, label: "Data Program", icon: FolderKanban },
          { page: "reports" as PageType, label: "Laporan", icon: FileBarChart },
          { page: "profile" as PageType, label: "Profil & Notifikasi", icon: UserRound },
        ];
      case "Operator":
        return [
          { page: "dashboard" as PageType, label: "Dashboard Operator", icon: LayoutDashboard },
          { page: "programs" as PageType, label: "Kegiatan Saya / Data Program", icon: FolderKanban },
          { page: "survey" as PageType, label: "Form Survey Lapangan", icon: ClipboardCheck },
          { page: "history" as PageType, label: "Riwayat Progres", icon: History },
          { page: "reports" as PageType, label: "Laporan", icon: FileBarChart },
          { page: "profile" as PageType, label: "Profil & Notifikasi", icon: UserRound },
        ];
      case "Pimpinan":
        return [
          { page: "dashboard" as PageType, label: "Dashboard Pimpinan", icon: LayoutDashboard },
          { page: "programs" as PageType, label: "Data Program", icon: FolderKanban },
          { page: "reports" as PageType, label: "Laporan", icon: FileBarChart },
          { page: "profile" as PageType, label: "Profil & Notifikasi", icon: UserRound },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 xl:w-72 bg-gradient-to-b from-[#1E4E8C] to-[#143965] text-white p-5 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between pb-5 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong className="block text-white font-bold text-base leading-tight">
                  SIMP-Kuningan
                </strong>
                <small className="block text-[#C8DCEC] text-xs">
                  Dinas PKPP Kab. Kuningan
                </small>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items */}
          <div className="mt-6">
            <span className="block text-[11px] font-bold tracking-widest text-[#BDD2E7] uppercase mb-2 px-3">
              MENU UTAMA
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPage === item.page ||
                  (item.page === "programs" && currentPage === "detail");

                return (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
                      isActive
                        ? "bg-white/20 text-white shadow-xs"
                        : "text-[#DCEAF6] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-white/10">
          <div className="bg-black/20 rounded-2xl p-4">
            <strong className="block text-white text-sm font-bold truncate">
              {currentUser.nama}
            </strong>
            <p className="text-[#C7DCEC] text-xs mt-0.5 truncate">
              {currentUser.role}
            </p>
            <button
              onClick={onLogout}
              className="w-full mt-3 py-2 px-3 rounded-lg text-xs font-bold bg-[#143965] hover:bg-[#0E2849] border border-white/30 text-white flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
