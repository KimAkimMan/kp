"use client";

import React, { useState } from "react";
import { Landmark, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Role, User } from "../types";

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>("Admin");
  const [email, setEmail] = useState("ahmad.suryana@kuningankab.go.id");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage("");
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setEmail(matchedUser.email);
      setPassword(matchedUser.password || "demo123");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage("Username/email dan kata sandi wajib diisi.");
      return;
    }

    const matched = users.find(
      (u) =>
        u.email.trim().toLowerCase() === trimmedEmail &&
        u.role === selectedRole &&
        u.password === password
    );

    if (!matched) {
      setErrorMessage("Username/email, role, atau kata sandi tidak sesuai.");
      return;
    }

    onLoginSuccess(matched);
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] bg-[#EAF3FB]">
      {/* Left Visual Banner */}
      <aside className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-[#1E4E8C] to-[#286BA3] text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Sistem Monitoring Permukiman Kuningan
          </h1>
          <p className="text-[#D9EBFA] text-lg max-w-lg leading-relaxed">
            Platform terpadu untuk memantau target capaian fisik, realisasi
            lapangan, pagu, dan penyerapan anggaran Dinas PKPP Kabupaten
            Kuningan.
          </p>
        </div>
        <div className="text-xs text-[#BED8F0]">
          Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kabupaten Kuningan
        </div>
      </aside>

      {/* Right Login Form Side */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-xl border border-[#DCE5ED]"
          noValidate
        >
          <div className="w-14 h-14 rounded-2xl bg-[#E3F0F6] text-[#1E4E8C] flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-[#143965] mb-1">
            Masuk ke Sistem
          </h2>
          <p className="text-sm text-[#64758A] mb-6">
            Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kabupaten Kuningan
          </p>

          {/* Role selector buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(["Admin", "Operator", "Pimpinan"] as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  selectedRole === role
                    ? "border-[#1E4E8C] bg-[#EDF5FB] text-[#1E4E8C] shadow-xs"
                    : "border-[#D4E0EB] bg-white text-[#4A647D] hover:bg-[#F7FAFC]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="text-xs bg-[#F2F7FC] border-l-4 border-[#148B87] p-3 rounded-r-lg text-[#45627C] mb-5">
            Akun demo {selectedRole}:{" "}
            <span className="font-semibold">{email}</span> · kata sandi:{" "}
            <span className="font-mono">demo123</span>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1.5">
              Username/Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
              placeholder="Masukkan username atau email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3.5 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#1E4E8C] hover:text-[#143965]"
                aria-label="Tampilkan kata sandi"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-[#C44C3B] font-semibold mb-4">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-md"
          >
            Masuk ke Aplikasi
          </button>

          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full mt-3 py-2.5 text-xs sm:text-sm font-semibold text-[#1E4E8C] hover:bg-[#EDF4F8] rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke halaman transparansi
          </button>
        </form>
      </main>
    </div>
  );
};
