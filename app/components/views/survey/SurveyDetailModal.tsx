"use client";

import React from "react";
import { X, MapPin, Compass, ExternalLink, Printer, ClipboardCheck } from "lucide-react";
import { FieldSurvey } from "../../../types";
import { currency } from "../../../utils/helpers";
import { surveyApi } from "@/lib/api";

interface SurveyDetailModalProps {
  viewingSurvey: FieldSurvey | null;
  onClose: () => void;
}

export function SurveyDetailModal({ viewingSurvey, onClose }: SurveyDetailModalProps) {
  const [surveyPhotos, setSurveyPhotos] = React.useState<Array<{
    id: string;
    storageKey: string;
    originalName: string | null;
    surveyId: string;
    createdAt: string;
  }>>([]);
  const [surveyPhotoUrls, setSurveyPhotoUrls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!viewingSurvey) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await surveyApi.photos(viewingSurvey.id);
        const photos = (response.data || []) as Array<{
          id: string;
          storageKey: string;
          originalName: string | null;
          surveyId: string;
          createdAt: string;
        }>;
        setSurveyPhotos(photos);
        const urls: Record<string, string> = {};
        for (const photo of photos) {
          try {
            const download = await surveyApi.photoDownload(photo.id);
            urls[photo.id] = download.data.downloadUrl;
          } catch {}
        }
        if (!cancelled) setSurveyPhotoUrls(urls);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [viewingSurvey?.id]);

  if (!viewingSurvey) return null;

  const badgeKondisi =
    viewingSurvey.kondisi === "Baik"
      ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
      : viewingSurvey.kondisi === "Rusak Ringan"
      ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
      : viewingSurvey.kondisi === "Rusak Sedang"
      ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
      : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2540]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#143965]">Lembar Hasil Survey Lapangan</h3>
              <p className="text-xs text-[#65778B]">{viewingSurvey.kodeSurvey} · {viewingSurvey.tanggal}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-[#35536F]">
          {/* Kop / Info Card */}
          <div className="bg-[#F8FAFC] border border-[#E1E9F0] rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#1E4E8C] uppercase tracking-wider block">{viewingSurvey.kategori}</span>
              <h4 className="text-base font-bold text-[#143965] mt-0.5">{viewingSurvey.namaKegiatan}</h4>
              <p className="text-xs text-[#65778B] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#BD493B]" />
                {viewingSurvey.detailLokasi} ({viewingSurvey.desaKelurahan}, Kec. {viewingSurvey.kecamatan})
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="badge selesai">{viewingSurvey.status}</span>
              <p className="text-[11px] text-[#65778B] mt-1.5">Petugas: <strong>{viewingSurvey.surveyor}</strong></p>
              {viewingSurvey.kontakPendamping && (
                <p className="text-[11px] text-[#65778B]">Pendamping: {viewingSurvey.kontakPendamping}</p>
              )}
            </div>
          </div>

          {/* Data Teknis Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
              <span className="text-[10px] text-[#65778B] uppercase font-bold block">Kondisi Fisik</span>
              <strong className="text-xs text-[#BD493B] block mt-0.5">{viewingSurvey.kondisi}</strong>
            </div>
            <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
              <span className="text-[10px] text-[#65778B] uppercase font-bold block">Dimensi</span>
              <strong className="text-xs text-[#143965] block mt-0.5">
                {viewingSurvey.panjang ? `${viewingSurvey.panjang}m × ${viewingSurvey.lebar || 0}m` : "—"}
              </strong>
            </div>
            <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
              <span className="text-[10px] text-[#65778B] uppercase font-bold block">Volume Luas</span>
              <strong className="text-xs text-[#143965] block mt-0.5">
                {viewingSurvey.luasVolume ? `${viewingSurvey.luasVolume} ${viewingSurvey.satuan}` : "—"}
              </strong>
            </div>
            <div className="p-3 rounded-xl border border-[#E1E9F0] bg-white">
              <span className="text-[10px] text-[#65778B] uppercase font-bold block">Estimasi Biaya</span>
              <strong className="text-xs text-[#148B87] block mt-0.5">
                {viewingSurvey.estimasiBiaya ? currency(viewingSurvey.estimasiBiaya) : "—"}
              </strong>
            </div>
          </div>

          {/* Temuan & Rekomendasi */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#FFFBF7] border border-[#FAD8B8]">
              <strong className="block text-xs font-bold text-[#9C5311] uppercase tracking-wider mb-1">Hasil Temuan Kerusakan Lapangan:</strong>
              <p className="text-xs text-[#4E3218] leading-relaxed">{viewingSurvey.uraianTemuan}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F9FD] border border-[#CFE1EE]">
              <strong className="block text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-1">Rekomendasi Penanganan Teknis:</strong>
              <p className="text-xs text-[#173859] leading-relaxed">{viewingSurvey.rekomendasi || "Belum ada rekomendasi teknis spesifik tercatat."}</p>
            </div>
          </div>

          {/* Koordinat GPS & Peta */}
          {viewingSurvey.koordinat && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F9FB] border border-[#E1E9F0]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#1E4E8C]" />
                <span className="font-mono text-xs">Koordinat: {viewingSurvey.koordinat}</span>
              </div>
              <a href={`https://www.google.com/maps?q=${viewingSurvey.koordinat}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#1E4E8C] hover:underline flex items-center gap-1">
                Buka Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Foto Bukti Lapangan */}
          {surveyPhotos.length > 0 && (
            <div>
              <strong className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-2">Dokumentasi Kondisi Lapangan ({surveyPhotos.length} foto):</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {surveyPhotos.map((photo) => {
                  const url = surveyPhotoUrls[photo.id];
                  return (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden border border-[#DCE5ED] aspect-video max-h-48 bg-black/5">
                      {url ? (
                        <img src={url} alt={`Foto ${photo.originalName || "Lapangan"}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#65778B] bg-[#F4F7FA]">Memuat...</div>
                      )}
                      {photo.originalName && (
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded">{photo.originalName}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EAF0F4] bg-[#F8FAFC] flex justify-between items-center">
          <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#1E4E8C] border border-[#C5DCEB] hover:bg-[#E8F2F8] flex items-center gap-1.5 transition">
            <Printer className="w-3.5 h-3.5" /> Cetak Lembar Survey
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold bg-[#143965] text-white hover:bg-[#0E2849] transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
