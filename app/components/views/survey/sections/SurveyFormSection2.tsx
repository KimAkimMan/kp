"use client";

import React from "react";
import { MapPin, Compass, ExternalLink } from "lucide-react";
import { Select, Input } from "@/app/components/ui/Input";

interface SurveyFormSection2Props {
  kecamatan: string;
  setKecamatan: (v: string) => void;
  desaKelurahan: string;
  setDesaKelurahan: (v: string) => void;
  detailLokasi: string;
  setDetailLokasi: (v: string) => void;
  koordinat: string;
  setKoordinat: (v: string) => void;
  isGettingLocation: boolean;
  setIsGettingLocation: (v: boolean) => void;
  handleGetLocation: () => void;
}

export function SurveyFormSection2({
  kecamatan,
  setKecamatan,
  desaKelurahan,
  setDesaKelurahan,
  detailLokasi,
  setDetailLokasi,
  koordinat,
  setKoordinat,
  isGettingLocation,
  setIsGettingLocation,
  handleGetLocation,
}: SurveyFormSection2Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
        <MapPin className="w-4 h-4 text-[#1E4E8C]" />
        <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
          2. Lokasi Geografis & Titik Koordinat GPS
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kecamatan */}
        <div>
          <Select
            label="Kecamatan *"
            value={kecamatan}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setKecamatan(e.target.value)
            }
          >
            <option value="Ciawigebang">Ciawigebang</option>
            <option value="Cibeureum">Cibeureum</option>
            <option value="Cibingbin">Cibingbin</option>
            <option value="Cidahu">Cidahu</option>
            <option value="Cigandamekar">Cigandamekar</option>
            <option value="Cigugur">Cigugur</option>
            <option value="Cilebak">Cilebak</option>
            <option value="Cilimus">Cilimus</option>
            <option value="Cimahi">Cimahi</option>
            <option value="Ciniru">Ciniru</option>
            <option value="Cipicung">Cipicung</option>
            <option value="Ciwaru">Ciwaru</option>
            <option value="Darma">Darma</option>
            <option value="Garawangi">Garawangi</option>
            <option value="Hantara">Hantara</option>
            <option value="Jalaksana">Jalaksana</option>
            <option value="Japara">Japara</option>
            <option value="Kadugede">Kadugede</option>
            <option value="Kalimanggis">Kalimanggis</option>
            <option value="Kramatmulya">Kramatmulya</option>
            <option value="Kuningan">Kuningan</option>
            <option value="Lebakwangi">Lebakwangi</option>
            <option value="Luragung">Luragung</option>
            <option value="Maleber">Maleber</option>
            <option value="Mandirancan">Mandirancan</option>
            <option value="Nusaherang">Nusaherang</option>
            <option value="Pancalang">Pancalang</option>
            <option value="Pasawahan">Pasawahan</option>
            <option value="Selajambe">Selajambe</option>
            <option value="Sindangagung">Sindangagung</option>
            <option value="Subang">Subang</option>
          </Select>
        </div>
        {/* Desa / Kelurahan */}
        <div>
          <Input
            label="Desa / Kelurahan *"
            type="text"
            value={desaKelurahan}
            onChange={(e) => setDesaKelurahan(e.target.value)}
            placeholder="Contoh: Ciawigebang / Cigugur"
            required
          />
        </div>
        {/* Detail Lokasi / Ruas Jalan */}
        <div>
          <Input
            label="Detail Lokasi / Ruas / Gang / Dusun *"
            type="text"
            value={detailLokasi}
            onChange={(e) => setDetailLokasi(e.target.value)}
            placeholder="Contoh: Ruas Dusun Manis Gang 4 RT 02/03"
          />
        </div>
        {/* Titik Koordinat GPS with action */}
        <div className="lg:col-span-3">
          <Input
            label="Titik Koordinat GPS (Latitude, Longitude)"
            type="text"
            value={koordinat}
            onChange={(e) => setKoordinat(e.target.value)}
            placeholder="Contoh: -6.9835, 108.5742"
            className="flex-1 font-mono"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D5E6F3] border border-[#C5DCEB] flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <Compass className={`w-4 h-4 ${isGettingLocation ? "animate-spin" : ""}`} />
            {isGettingLocation ? "Mendeteksi Posisi..." : "Dapatkan Koordinat Saat Ini"}
          </button>
          {koordinat && (
            <a
              href={`https://www.google.com/maps?q=${koordinat}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4F7FA] text-[#65778B] hover:text-[#143965] border border-[#CCD9E4] flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Peta
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
