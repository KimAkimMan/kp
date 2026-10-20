import { prisma } from "@/lib/prisma";
import type { SurveyInput } from "./survey.types";

export const surveyRepository = {
  findMany() {
    return prisma.fieldSurvey.findMany({
      include: { program: true, surveyorUser: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.fieldSurvey.findUnique({
      where: { id },
      include: { program: true, surveyorUser: true },
    });
  },

  create(input: SurveyInput, id: string) {
    return prisma.fieldSurvey.create({
      data: {
        id,
        kodeSurvey: input.kodeSurvey,
        tanggal: new Date(input.tanggal),
        surveyor: input.surveyor,
        surveyorId: input.surveyorId ?? null,
        programId: input.programId ?? null,
        namaKegiatan: input.namaKegiatan,
        kategori: input.kategori,
        kecamatan: input.kecamatan,
        desaKelurahan: input.desaKelurahan,
        detailLokasi: input.detailLokasi,
        koordinat: input.koordinat ?? null,
        kondisi: input.kondisi,
        panjang: input.panjang ?? null,
        lebar: input.lebar ?? null,
        luasVolume: input.luasVolume ?? null,
        satuan: input.satuan ?? null,
        tipeKonstruksi: input.tipeKonstruksi ?? null,
        estimasiBiaya: input.estimasiBiaya ?? null,
        tingkatUrgensi: input.tingkatUrgensi,
        uraianTemuan: input.uraianTemuan,
        rekomendasi: input.rekomendasi,
        kontakPendamping: input.kontakPendamping ?? null,
        foto: input.foto ?? false,
        fotoUrl: input.fotoUrl ?? null,
        status: input.status,
      },
      include: { program: true, surveyorUser: true },
    });
  },

  update(id: string, input: Partial<SurveyInput>) {
    return prisma.fieldSurvey.update({
      where: { id },
      data: {
        ...(input.kodeSurvey === undefined ? {} : { kodeSurvey: input.kodeSurvey }),
        ...(input.tanggal === undefined ? {} : { tanggal: new Date(input.tanggal) }),
        ...Object.fromEntries(
          Object.entries(input).filter(([key]) => !["id", "kodeSurvey", "tanggal"].includes(key)),
        ),
      },
      include: { program: true, surveyorUser: true },
    });
  },

  delete(id: string) {
    return prisma.fieldSurvey.delete({ where: { id }, select: { id: true } });
  },
};
