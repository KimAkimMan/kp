"use client";

import React from "react";
import { Menu, Bell } from "lucide-react";
import { PageType, User } from "../types";

interface TopbarProps {
  currentUser: User;
  currentPage: PageType;
  pendingNotificationCount?: number;
  onToggleSidebar: () => void;
  onNavigate: (page: PageType) => void;
}

const pageTitles: Record<PageType, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Ringkasan monitoring permukiman",
  },
  users: {
    title: "Manajemen Pengguna",
    subtitle: "Kelola akun dan hak akses tiga role aplikasi",
  },
  masteractivities: {
    title: "Master Kegiatan",
    subtitle: "Atur data dasar, lokasi, target, dan pagu kegiatan",
  },
  programs: {
    title: "Data Program",
    subtitle: "Target, realisasi, pagu, penggunaan, dan sisa anggaran",
  },
  survey: {
    title: "Form Survey Lapangan",
    subtitle: "Pendataan teknis, dokumentasi fisik, dan verifikasi lapangan permukiman",
  },
  adminsurvey: {
    title: "Hasil Survey Operator",
    subtitle: "Daftar hasil survei lapangan operator untuk diverifikasi dan dijadikan kegiatan master",
  },
  schedule: {
    title: "Pengaturan Jadwal & Target",
    subtitle: "Kelola rincian teknis, target, dan progres kegiatan",
  },
  history: {
    title: "Riwayat Progres",
    subtitle: "Telusuri tanggal, tahap pekerjaan, dan riwayat realisasi",
  },
  reports: {
    title: "Laporan Monitoring",
    subtitle: "Ringkasan target, realisasi, pagu, penggunaan, dan sisa anggaran",
  },
  profile: {
    title: "Profil & Notifikasi",
    subtitle: "Informasi akun dan pemberitahuan sistem",
  },
  detail: {
    title: "Detail Program",
    subtitle: "Informasi lengkap capaian, realisasi fisik, dan biaya",
  },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  currentPage,
  pendingNotificationCount = 0,
  onToggleSidebar,
  onNavigate,
}) => {
  const currentInfo = pageTitles[currentPage] || {
    title: "Sistem Informasi",
    subtitle: `${currentUser.role} · Dinas PKPP Kabupaten Kuningan`,
  };

  const initials = currentUser.nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-20 h-20 bg-white border-b border-[#DCE5ED] px-5 sm:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl border border-[#DCE5ED] text-[#1E4E8C] hover:bg-[#F4F7FA] transition"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#143965] leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64758A] mt-0.5">
            {currentUser.role} · Dinas PKPP Kabupaten Kuningan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => onNavigate("profile")}
          className="relative w-10 h-10 rounded-xl border border-[#DCE5ED] flex items-center justify-center text-[#64758A] hover:text-[#1E4E8C] hover:bg-[#F4F7FA] transition"
          aria-label="Buka notifikasi"
          title={
            pendingNotificationCount > 0
              ? `${pendingNotificationCount} arahan baru dari Pimpinan`
              : "Profil & Notifikasi"
          }
        >
          <Bell className="w-5 h-5" />
          {pendingNotificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#E95F45] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {pendingNotificationCount}
            </span>
          ) : (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E95F45]" />
          )}
        </button>

        {/* User Chip */}
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F4F7FA] transition text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#D9ECEC] text-[#148B87] font-bold text-sm flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <strong className="block text-xs font-bold text-[#143965] leading-tight">
              {currentUser.nama}
            </strong>
            <p className="text-[11px] text-[#64758A] mt-0.5 leading-none">
              {currentUser.role}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
