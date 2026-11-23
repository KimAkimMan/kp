# Sinkronisasi Kontrak API - Audit Readonly (Ringkasan)

Based on a read-only audit of /home/dika/kp/kp/kp (Next.js 16 + Prisma 7 + MariaDB), here are the findings:

## Total Counts
- **Total endpoint di route**: 41 endpoint unik across 43 file route.ts
- **Total endpoint di lib/openapi.ts**: 41 path terdaftar
- **Endpoint yang tidak terdokumentasi (route tanpa openapi)**: 0 (semua terdaftar)
- **Mismatch client/route**: 3 endpoint utama
- **Enum mismatch (app/types vs lib/api/types vs prisma)**: 2 status + 1 openapi schema

## Critical Issues (Severity 1)

1. **programApi.claim() path mismatch** (modules/programs/program.client.ts:60-62 vs app/api/programs/[id]/complete/route.ts:28)
   - Client calls: `/programs/${id}/claim`
   - Route handler at: `/api/programs/[id]/complete`
   - Impact: Feature broken - claim won't work via client

2. **surveyApi.removePhoto() path mismatch** (modules/surveys/survey.client.ts:163)
   - Client calls: `/surveys/photos/${photoId}` (without surveyId)
   - Route exists at: `/api/surveys/[id]/photos` (requires surveyId context)
   - Impact: Cannot delete survey photos via client

3. **programApi.verifyProgress() path mismatch** (modules/programs/program.client.ts:156)
   - Client calls: `/progress/${id}/verify`
   - No route file found for this path
   - Impact: 404 error when calling

## Enum Mismatches (Severity 3)

4. **ProgramStatus**: `app/types.ts` uses translated values ("Belum Dikerjakan") while `lib/api/types.ts` and `prisma/schema.prisma` use code values ("BELUM_DIKERJAKAN")

5. **SurveyStatus**: `app/types.ts` uses translated values ("Draft") while `lib/api/types.ts` and `prisma/schema.prisma` use code values ("DRAFT")

6. **openapi Advice.status**: Missing enum restriction in OpenAPI document (only `type: "string"`), while Prisma/types have enum values

## Dead Exports (Severity 4)

7. **systemApi** exported from `lib/api/index.ts` but not imported/used anywhere in codebase
8. **referenceDataApi** exported from `lib/api/index.ts` but not imported/used anywhere

## Good News
- Generate-openapi-types script is synchronized (same timestamps)
- All 41 routes have corresponding OpenAPI entries
- Client path parameter types (string vs numeric) are consistent with Prisma schemas