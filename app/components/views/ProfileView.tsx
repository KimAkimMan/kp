"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Save,
  Lock,
  LogOut,
} from "lucide-react";
import { User as UserType, AdviceRecord } from "../../types";
import { authApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api/client";

interface ProfileViewProps {
  currentUser: UserType;
  adviceRecords: AdviceRecord[];
  onUpdateAdviceStatus: (id: string, newStatus: string) => void;
  onNavigateToProgram: (programId: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  adviceRecords,
  onUpdateAdviceStatus,
  onNavigateToProgram,
}) => {
  const isOperator = currentUser.role === "Operator";
  const isPimpinan = currentUser.role === "Pimpinan";

  // State untuk form ubah profil & ganti password
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileNama, setProfileNama] = useState(currentUser.nama);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    try {
      setProfileLoading(true);
      await authApi.updateProfile({ nama: profileNama, email: profileEmail });
      setEditingProfile(false);
    } catch (error) {
      setProfileError(
        error instanceof ApiClientError ? error.message : "Gagal memperbarui profil.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    try {
      setPasswordLoading(true);
      await authApi.changePassword({ currentPassword, newPassword });
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof ApiClientError ? error.message : "Gagal mengubah kata sandi.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filter advice relevant to the user
  const relevantAdvice = isOperator
    ? adviceRecords.filter(
        (a) =>
          a.operatorPenerima === currentUser.nama ||
          a.operatorPenerima === "Belum ditugaskan"
      )
    : isPimpinan
    ? adviceRecords.filter((a) => a.identitasPimpinan === currentUser.nama)
    : adviceRecords;

  const pendingCount = relevantAdvice.filter(
    (a) => a.status === "Belum ditindaklanjuti"
  ).length;

  return (
    <div className="space-y-6">
      {/* Head */}
      <div>
        <h2 className="text-2xl font-bold text-[#143965]">Profil & Notifikasi</h2>
        <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
          Informasi kredensial akun, kotak masuk pesan arahan pimpinan, dan status pemberitahuan sistem.
        </p>
      </div>

      {/* Account Info */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#1E4E8C]" /> Informasi Akun Pengguna
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FBFDFE] border border-[#EAF0F4]">
            <span className="text-[#65778B] block mb-1">Nama Lengkap:</span>
            <strong className="text-base text-[#143965] block font-bold">
              {currentUser.nama}
            </strong>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFDFE] border border-[#EAF0F4]">
            <span className="text-[#65778B] block mb-1">Role Akses:</span>
            <span className="badge sedang font-bold text-xs">{currentUser.role}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFDFE] border border-[#EAF0F4]">
            <span className="text-[#65778B] block mb-1">Alamat Email:</span>
            <strong className="text-sm text-[#143965] block font-medium">
              {currentUser.email}
            </strong>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFDFE] border border-[#EAF0F4]">
            <span className="text-[#65778B] block mb-1">Status Keaktifan:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#258050] bg-[#E7F6ED] px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-4 h-4" /> Aktif
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#EAF0F4]">
          <button
            onClick={() => {
              setEditingProfile(true);
              setEditingPassword(false);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
          >
            <Save className="w-3.5 h-3.5" /> Ubah Profil
          </button>
          <button
            onClick={() => {
              setEditingPassword(true);
              setEditingProfile(false);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
          >
            <Lock className="w-3.5 h-3.5" /> Ganti Kata Sandi
          </button>
        </div>
      </section>

      {/* Kotak Pesan & Arahan Masuk dari Pimpinan (Khusus Operator / Pimpinan / Admin) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-[#EAF0F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EDF5FB] text-[#1E4E8C] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#143965]">
                {isOperator
                  ? "Pesan & Arahan Masuk dari Pimpinan"
                  : isPimpinan
                  ? "Arahan yang Telah Anda Kirimkan ke Operator"
                  : "Rekap Seluruh Arahan Pimpinan"}
              </h3>
              <p className="text-xs text-[#65778B] mt-0.5">
                {isOperator
                  ? "Instruksi khusus dan disposisi evaluasi kegiatan dari Pimpinan Disperkimtan."
                  : "Pantau tindak lanjut arahan yang telah disampaikan kepada para Operator."}
              </p>
            </div>
          </div>

          {isOperator && pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4EB] text-[#E78A31] border border-[#FAD8B8]">
              <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} Belum Ditindaklanjuti
            </span>
          )}
        </div>

        {relevantAdvice.length > 0 ? (
          <div className="space-y-4">
            {relevantAdvice.map((advice) => {
              const isPending = advice.status === "Belum ditindaklanjuti";

              return (
                <article
                  key={advice.id}
                  className={`rounded-2xl p-5 border transition ${
                    isPending
                      ? "bg-[#FFFDFB] border-[#FBD8B7] shadow-xs"
                      : "bg-[#FBFDFE] border-[#E5EDF3]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1E4E8C]" />
                      <strong className="text-sm text-[#143965] font-bold">
                        {advice.identitasPimpinan}
                      </strong>
                      <span className="text-xs text-[#65778B]">
                        (Pimpinan Disperkimtan)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#65778B]">
                        <Clock className="w-3 h-3" /> {advice.tanggal}
                      </span>
                      <span
                        className={`badge ${
                          isPending
                            ? "belum bg-[#FFF4EB] text-[#E78A31] border border-[#FCDDC0]"
                            : "selesai"
                        }`}
                      >
                        {isPending ? (
                          <span className="inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Belum Ditindaklanjuti
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Ditindaklanjuti
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Program tag */}
                  <div className="mb-2 text-xs">
                    <span className="text-[#65778B]">Kegiatan Terkait:</span>{" "}
                    <strong className="text-[#143965] font-semibold">
                      {advice.namaKegiatan}
                    </strong>
                  </div>

                  {/* Message body */}
                  <div className="bg-white border border-[#E2ECF2] p-4 rounded-xl text-xs sm:text-sm text-[#18304B] leading-relaxed shadow-2xs mb-4">
                    &ldquo;{advice.isi}&rdquo;
                  </div>

                  {/* Actions for Operator */}
                  {isOperator && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onNavigateToProgram(advice.idKegiatan)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Kegiatan & Tindak Lanjuti
                      </button>

                      {isPending ? (
                        <button
                          onClick={() =>
                            onUpdateAdviceStatus(
                              advice.id,
                              "Sudah ditindaklanjuti"
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E7F6ED] text-[#258050] hover:bg-[#D3EFE0] transition border border-[#BCE5CC]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Sudah Ditindaklanjuti
                        </button>
                      ) : (
                        <span className="text-xs text-[#258050] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Arahan ini telah selesai dijalankan
                        </span>
                      )}
                    </div>
                  )}

                  {!isOperator && (
                    <div className="text-xs text-[#65778B]">
                      Penerima: <strong className="text-[#143965]">{advice.operatorPenerima}</strong>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-2xl text-xs sm:text-sm">
            <MessageSquare className="w-8 h-8 text-[#A8C2D8] mx-auto mb-2" />
            {isOperator
              ? "Belum ada pesan atau arahan masuk dari Pimpinan untuk akun Anda."
              : "Belum ada arahan yang dikirimkan."}
          </div>
        )}
      </section>

      {/* Notification Center */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#148B87]" /> Notifikasi Sistem
        </h3>

        <div className="space-y-3">
          <div className="bg-[#F6FBFD] border border-[#D6E5EC] rounded-xl p-4 text-xs">
            <strong className="text-[#143965] font-bold text-sm block mb-1">
              Pembaruan Ringkasan Otomatis Aktif
            </strong>
            <p className="text-[#65778B] m-0 leading-relaxed">
              Data target, realisasi kumulatif, penggunaan biaya, dan sisa anggaran disegarkan dari backend saat akun dimuat atau data diperbarui.
            </p>
          </div>

          <div className="bg-[#FAFBFD] border border-[#E1E9F0] rounded-xl p-4 text-xs">
            <strong className="text-[#143965] font-bold text-sm block mb-1">
              Sinkronisasi Multirole Disperkimtan Kuningan
            </strong>
            <p className="text-[#65778B] m-0 leading-relaxed">
              Setiap perubahan target oleh Admin akan otomatis tersedia untuk dilengkapi oleh Operator dan dipantau oleh Pimpinan melalui dashboard analitik.
            </p>
          </div>
        </div>
      </section>

      {/* Form Ubah Profil */}
      {editingProfile && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <h3 className="text-base font-bold text-[#143965] mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-[#1E4E8C]" /> Ubah Data Profil
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profileNama}
                onChange={(e) => setProfileNama(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            {profileError && (
              <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </div>
            )}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#EAF0F4]">
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setProfileNama(currentUser.nama);
                  setProfileEmail(currentUser.email);
                  setProfileError("");
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] disabled:opacity-50"
              >
                {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Form Ganti Password */}
      {editingPassword && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <h3 className="text-base font-bold text-[#143965] mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1E4E8C]" /> Ganti Kata Sandi
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
                minLength={8}
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
                <AlertCircle className="w-4 h-4" /> {passwordError}
              </div>
            )}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#EAF0F4]">
              <button
                type="button"
                onClick={() => {
                  setEditingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] disabled:opacity-50"
              >
                {passwordLoading ? "Mengubah..." : "Ubah Kata Sandi"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
