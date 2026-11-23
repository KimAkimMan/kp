"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { User, Role } from "../../types";
import { ModalFrame } from "./ModalFrame";

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [nama, setNama] = useState(user?.nama || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<Role>(user?.role || "Operator");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setError("Nama lengkap dan email wajib diisi.");
      return;
    }
    if (!user && password.length < 8) {
      setError("Password pengguna baru minimal 8 karakter.");
      return;
    }
    if (password && password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    onSave({
      nama: nama.trim(),
      email: email.trim(),
      role,
      ...(password ? { password } : {}),
    });
  };

  return (
    <ModalFrame
      title={user ? "Ubah Data Pengguna" : "Tambah Pengguna Baru"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Budi Pratama, S.T."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Email Akun
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="nama@kuningankab.go.id"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Role Hak Akses
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Pimpinan">Pimpinan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            {user ? "Password Baru (opsional)" : "Password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder={user ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
            minLength={8}
            required={!user}
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Pengguna
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
