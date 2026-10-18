"use client";

import React, { useState } from "react";
import { UserPlus, Search, RotateCcw, Edit2 } from "lucide-react";
import { User } from "../../types";

interface UsersViewProps {
  users: User[];
  onOpenAddUser: () => void;
  onOpenEditUser: (user: User) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onOpenAddUser,
  onOpenEditUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u) =>
    (u.nama + " " + u.email + " " + u.role)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Manajemen Pengguna</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Kelola akun dan hak akses untuk tiga role pengguna (Admin, Operator, Pimpinan).
          </p>
        </div>
        <button
          onClick={onOpenAddUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#718296] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email pengguna..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#CCD9E4] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Nama Lengkap</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FBFDFE] transition">
                    <td className="p-3.5 font-bold text-[#143965]">{u.nama}</td>
                    <td className="p-3.5 text-[#65778B]">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`badge ${
                          u.role === "Admin"
                            ? "sedang"
                            : u.role === "Operator"
                            ? "belum"
                            : "selesai"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onOpenEditUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Ubah
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-[#65778B]">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
