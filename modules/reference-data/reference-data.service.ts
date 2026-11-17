import { ApiError } from "@/lib/http/api-error";
import { referenceDataRepository } from "./reference-data.repository";

export const referenceDataService = {
  categories: referenceDataRepository.categories,
  units: referenceDataRepository.units,
  periods: referenceDataRepository.periods,
  districts: referenceDataRepository.districts,
  villages(kecamatanId: number) {
    if (!Number.isSafeInteger(kecamatanId) || kecamatanId < 1) {
      throw new ApiError("VALIDATION_ERROR", "kecamatanId harus berupa bilangan bulat positif.", 400);
    }
    return referenceDataRepository.villages(kecamatanId);
  },
};
