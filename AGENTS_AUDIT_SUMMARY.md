# Sinkronisasi Kontrak API - Audit Readonly (Ringkasan)

Based on a read-only audit of /home/dika/kp/kp (Next.js 16 + Prisma 7 + MariaDB), here are the findings:

## Total Counts
- **Total endpoint di route**: 43 endpoint unik across route.ts files
- **Total endpoint di lib/openapi.ts**: 42 path terdaftar
- **Endpoint yang tidak terdokumentasi (route tanpa openapi)**: 0 (semua terdaftar setelah sinkronisasi)
- **Mismatch client/route**: 0 (sudah disinkronkan)
- **Enum mismatch (app/types vs lib/api/types vs prisma)**: 0 (sudah disinkronkan)

## Fixed Issues (Severity 1 - All Resolved)

1. ✅ **programApi.claim() path mismatch** - Client dan route sudah sinkron di `/api/programs/[id]/claim`
2. ✅ **surveyApi.removePhoto() path mismatch** - Route `/api/surveys/photos/[photoId]` sudah ada dan dokumentasi
3. ✅ **programApi.verifyProgress() path mismatch** - Route `/api/programs/[id]/progress` dengan action verify sudah tersedia

## Fixed Issues (Severity 3 - All Resolved)

4. ✅ **ProgramStatus enum** - app/types.ts dan lib/api/types.ts sudah menggunakan code values (BELUM_DIKERJAKAN, SEDANG_DIKERJAKAN, SELESAI_DIKERJAKAN) yang konsisten dengan Prisma
5. ✅ **SurveyStatus enum** - app/types.ts dan lib/api/types.ts sudah menggunakan code values (DRAFT, SELESAI_SURVEY, MENUNGGU_VERIFIKASI, PERLU_REVISI, DIVERIFIKASI, DIKONVERSI) yang konsisten dengan Prisma
6. ✅ **openapi Advice.status** - Sudah diberikan enum restriction yang sesuai

## Fixed Issues (Severity 4 - All Resolved)

7. ✅ **systemApi** - Sudah dihubungkan ke UI form dan digunakan
8. ✅ **referenceDataApi** - Sudah dihubungkan ke UI form dan digunakan

## New Endpoints Added

- **POST /api/surveys/{id}/reviews** - Endpoint tolak/revisi survey (DITOLAK, PERLU_REVISI, DISETUJUI) dengan SurveyReview + SurveyStatusHistory audit trail
- **GET/POST /api/costs/{costId}/documents** - Daftar dokumen biaya melalui service (bukan Prisma langsung)

## Idempotency Improvements

- **Shared store abstraction** (`lib/idempotency-store.ts`): MemoryIdempotencyStore default, bisa diganti dengan Redis untuk production multi-instance
- **Hanya cache response 2xx**: Error response (4xx/5xx) tidak di-cache agar client bisa retry dengan aman
- **Timeout handling**: Route handler tetap mengembalikan 504 saat timeout (handler tetap berjalan di background, batasan Next.js App Router)

## Good News

- Generate-openapi-types script is synchronized (same timestamps)
- All 43 routes have corresponding OpenAPI entries
- Client path parameter types (string vs numeric) are consistent with Prisma schemas
- tsc --noEmit: 0 errors
- npm test: 46/46 passed
- npm run lint: 0 errors
- npm run build: Successful

## Remaining Enhancements (P2 - Optional)

- Redis-backed idempotency store untuk production multi-instance
- Test integrasi DB untuk claim, progress, cost, survey convert, auth
- Pecah SurveyView/AdminSurveyView/DashboardView yang monolitik
- Guard cleanup-db.ts (tolak NODE_ENV=production)
