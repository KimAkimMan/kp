"use client";

import React from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Paperclip,
  MessageSquarePlus,
} from "lucide-react";
import { Program, User } from "../../types";
import {
  currency,
  quantity,
  remBudget,
} from "../../utils/helpers";
import { SimpleBarChart } from "../Charts";

interface DetailViewProps {
  program: Program;
  onBack: () => void;
  currentUser?: User;
  onNavigateToDashboardAdvice?: (programId: number) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  program,
  onBack,
  currentUser,
  onNavigateToDashboardAdvice,
}) => {
  const percent =
    program.target > 0
      ? Math.min(100, Math.round((program.realisasi / program.target) * 100))
      : 0;

  const badgeClass =
    program.status === "Belum Dikerjakan"
      ? "belum"
      : program.status === "Sedang Dikerjakan"
      ? "sedang"
      : "selesai";

  return (
    <div className="space-y-6">
      {/* Navigation bar with Back button & Pimpinan advice button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </button>

        {currentUser?.role === "Pimpinan" && onNavigateToDashboardAdvice && (
          <button
            onClick={() => onNavigateToDashboardAdvice(program.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs transition"
          >
            <MessageSquarePlus className="w-4 h-4" /> Isi Saran & Arahan untuk Kegiatan Ini
          </button>
        )}
      </div>

      {/* Main Details Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-[#EAF0F4]">
          <div>
            <span className={`badge ${badgeClass} mb-2`}>{program.status}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#143965]">
              {program.nama}
            </h2>
            <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
              {program.kode} · {program.kategori}
            </p>
          </div>

          <div className="bg-[#F6FBFD] border border-[#D6E5EC] p-3.5 rounded-xl text-xs min-w-[200px]">
            <span className="text-[#65778B]">Status Pekerjaan:</span>
            <strong className="block text-[#143965] font-bold mt-0.5">
              {program.status}
            </strong>
            <span className="text-[#65778B] block mt-2">Sumber Pembaruan:</span>
            <strong className="block text-[#143965] font-bold mt-0.5 truncate">
              {program.sumber}
            </strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-5">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#65778B] font-semibold">
              Progres Capaian Fisik
            </span>
            <span className="font-extrabold text-[#1E4E8C]">{percent}%</span>
          </div>
          <div className="w-full h-3.5 bg-[#E6EEF3] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1E4E8C] to-[#148B87] rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#65778B] mt-1.5">
            <span>Realisasi: {quantity(program.realisasi, program.satuan)}</span>
            <span>Target: {quantity(program.target, program.satuan)}</span>
          </div>
        </div>

        {/* Attributes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs pt-4 border-t border-[#F0F4F8]">
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Lokasi Lengkap:</span>
            <strong className="text-[#143965] ml-1.5">{program.lokasi}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Penanggung Jawab:</span>
            <strong className="text-[#143965] ml-1.5">{program.pj}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Penyedia CV/PT:</span>
            <strong className="text-[#143965] ml-1.5">{program.penyedia || "-"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Direktur:</span>
            <strong className="text-[#143965] ml-1.5">{program.direktur || "-"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Periode:</span>
            <strong className="text-[#143965] ml-1.5">Tahun {program.periode}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Waktu Pelaksanaan:</span>
            <strong className="text-[#143965] ml-1.5">{program.jadwal || "Sesuai periode"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Pagu Anggaran:</span>
            <strong className="text-[#143965] ml-1.5">{currency(program.pagu)}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Nilai Kontrak:</span>
            <strong className="text-[#143965] ml-1.5">
              {program.nilaiKontrak ? currency(program.nilaiKontrak) : "-"}
            </strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Nomor Kontrak:</span>
            <strong className="text-[#143965] ml-1.5">{program.noKontrak || "-"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Satuan:</span>
            <strong className="text-[#143965] ml-1.5">{program.satuan}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Update Terakhir:</span>
            <strong className="text-[#143965] ml-1.5">{program.update}</strong>
          </div>
          <div className="col-span-1 sm:col-span-2 py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Keterangan Terakhir:</span>
            <strong className="text-[#143965] ml-1.5">{program.catatan}</strong>
          </div>
        </div>
      </section>

      {/* Riwayat Realisasi */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-4">
          Riwayat Realisasi
        </h3>
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">Tanggal Update</th>
                <th className="p-3">Tahap Pekerjaan</th>
                <th className="p-3">Nilai Realisasi</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3">Dokumentasi</th>
                <th className="p-3">Penginput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {program.histories && program.histories.length > 0 ? (
                program.histories.map((h, i) => (
                  <tr key={i} className="hover:bg-[#FBFDFE]">
                    <td className="p-3 text-[#65778B] whitespace-nowrap">{h.tanggal}</td>
                    <td className="p-3 font-bold text-[#143965]">{h.tahap}</td>
                    <td className="p-3 font-semibold text-[#148B87] whitespace-nowrap">
                      {quantity(h.nilai, h.satuan)}
                    </td>
                    <td className="p-3 text-[#496178] max-w-sm">{h.keterangan}</td>
                    <td className="p-3 whitespace-nowrap">
                      {h.foto ? (
                        <span className="inline-flex items-center gap-1.5 text-[#1E4E8C] font-semibold">
                          <ImageIcon className="w-3.5 h-3.5" /> Foto tersedia
                        </span>
                      ) : (
                        <span className="text-[#65778B]">Tidak ada</span>
                      )}
                    </td>
                    <td className="p-3 text-[#65778B] whitespace-nowrap">{h.penginput}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#65778B]">
                    Belum ada riwayat realisasi untuk kegiatan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Akumulasi Anggaran Kegiatan */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-4">
          Akumulasi Anggaran dan Pagu Kegiatan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-[#F6FBFD] p-4 rounded-xl border border-[#D6E5EC] text-xs">
          <div>
            <span className="text-[#65778B]">Pagu Total:</span>
            <strong className="block text-base font-bold text-[#143965] mt-1">
              {currency(program.pagu)}
            </strong>
          </div>
          <div>
            <span className="text-[#65778B]">Total Penggunaan:</span>
            <strong className="block text-base font-bold text-[#148B87] mt-1">
              {currency(program.penggunaan)}
            </strong>
          </div>
          <div>
            <span className="text-[#65778B]">Sisa Anggaran:</span>
            <strong className="block text-base font-bold text-[#E78A31] mt-1">
              {currency(remBudget(program))}
            </strong>
          </div>
        </div>

        {program.pagu > 0 ? (
          <SimpleBarChart
            labels={["Anggaran Kegiatan"]}
            datasets={[
              {
                label: "Pagu",
                data: [program.pagu],
                backgroundColor: "#1E4E8C",
              },
              {
                label: "Penggunaan",
                data: [program.penggunaan],
                backgroundColor: "#148B87",
              },
              {
                label: "Sisa Anggaran",
                data: [remBudget(program)],
                backgroundColor: "#E78A31",
              },
            ]}
            formatValue={(v) => currency(v)}
            height={220}
          />
        ) : (
          <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
            Pagu anggaran belum ditentukan untuk kegiatan ini.
          </div>
        )}
      </section>

      {/* Riwayat Biaya */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-4">
          Riwayat Penggunaan Biaya
        </h3>
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Uraian Transaksi</th>
                <th className="p-3">Nominal (Rp)</th>
                <th className="p-3">Input Oleh</th>
                <th className="p-3">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {program.costs && program.costs.length > 0 ? (
                program.costs.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FBFDFE]">
                    <td className="p-3 text-[#65778B] whitespace-nowrap">{c.tanggal}</td>
                    <td className="p-3 font-semibold text-[#143965]">{c.uraian}</td>
                    <td className="p-3 font-bold text-[#148B87] whitespace-nowrap">
                      {currency(c.nominal)}
                    </td>
                    <td className="p-3 text-[#65778B]">{c.input}</td>
                    <td className="p-3 whitespace-nowrap">
                      {c.bukti ? (
                        <span className="inline-flex items-center gap-1.5 text-[#1E4E8C] font-semibold">
                          <Paperclip className="w-3.5 h-3.5" /> Bukti tersedia
                        </span>
                      ) : (
                        <span className="text-[#65778B]">Tidak ada</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#65778B]">
                    Belum ada transaksi penggunaan biaya.
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
