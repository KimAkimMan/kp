export interface paths {
    "/public/programs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar program untuk landing publik dengan field terbatas */
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                    status?: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
                    kecamatan?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar program publik */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/photos/presign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Buat URL upload foto langsung ke object storage */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        originalName: string;
                        mimeType: string;
                        fileSize: number;
                    };
                };
            };
            responses: {
                /** @description Presigned upload URL */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/photos/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Simpan metadata foto setelah direct upload selesai */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Foto terdaftar */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/photos/{photoId}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Buat URL preview/download foto private */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    photoId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Presigned download URL */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/costs/{costId}/documents/presign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Buat URL upload dokumen biaya langsung ke object storage */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Presigned upload URL */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/costs/{costId}/documents/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Simpan metadata dokumen biaya setelah direct upload selesai */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Dokumen terdaftar */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/costs/{costId}/documents/{documentId}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Buat URL preview/download dokumen private */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                    documentId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Presigned download URL */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Ubah profil sendiri */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Profil diperbarui */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ubah password sendiri */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        currentPassword: string;
                        newPassword: string;
                    };
                };
            };
            responses: {
                /** @description Password diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Admin reset password pengguna */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Password direset */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reference-data/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Kategori program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reference-data/units": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Satuan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reference-data/periods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Periode aktif */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reference-data/districts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Kecamatan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reference-data/villages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    kecamatanId: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Desa/kelurahan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["LoginInput"];
                };
            };
            responses: {
                /** @description Login berhasil */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["AuthResponse"];
                        };
                    };
                };
                /** @description Payload tidak valid */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Credential salah */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Terlalu banyak percobaan */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Logout berhasil */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** User aktif */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description User aktif */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Application health */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Application is running */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Application readiness */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Configuration and database are ready */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Application is not ready */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar user */
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar user */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        /** Tambah user */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UserInput"];
                };
            };
            responses: {
                /** @description User dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Detail user */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description User dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UserUpdateInput"];
                };
            };
            responses: {
                /** @description User diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/programs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar program */
        get: {
            parameters: {
                query?: {
                    search?: components["parameters"]["Search"];
                    status?: components["parameters"]["Status"];
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        /** Tambah program */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ProgramInput"];
                };
            };
            responses: {
                /** @description Program dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Detail program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Program dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ProgramUpdateInput"];
                };
            };
            responses: {
                /** @description Program diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/programs/{id}/claim": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Program diambil operator */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}/progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar progres */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar progres program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ProgressInput"];
                };
            };
            responses: {
                /** @description Progres dicatat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}/costs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar biaya */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar biaya program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CostInput"];
                };
            };
            responses: {
                /** @description Biaya dicatat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Program selesai */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                    search?: string;
                    status?:
                      | "DRAFT"
                      | "SELESAI_SURVEY"
                      | "MENUNGGU_VERIFIKASI"
                      | "PERLU_REVISI"
                      | "DIVERIFIKASI"
                      | "DIKONVERSI";
                    kecamatan?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar survey */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SurveyInput"];
                };
            };
            responses: {
                /** @description Survey dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Detail survey */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Survey dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SurveyUpdateInput"];
                };
            };
            responses: {
                /** @description Survey diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/surveys/{id}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Survey diverifikasi */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/convert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Survey menjadi program */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advice": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                    search?: string;
                    status?: "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI";
                    operatorId?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar arahan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AdviceInput"];
                };
            };
            responses: {
                /** @description Arahan dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advice/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Detail arahan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Arahan dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AdviceStatusInput"];
                };
            };
            responses: {
                /** @description Status arahan diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/reports/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Ringkasan laporan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}/assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daftar assignment */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar assignment program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        operatorId: number;
                        notes?: string;
                    };
                };
            };
            responses: {
                /** @description Assignment dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/programs/{id}/assignments/{assignmentId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["Id"];
                assignmentId: number;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                    assignmentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Assignment dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["Id"];
                    assignmentId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Assignment diubah */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/programs/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Riwayat program */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Riwayat perubahan program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/progress/{progressId}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                progressId: number;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    progressId: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        decision: "APPROVED" | "REJECTED";
                        rejectionReason?: string;
                    };
                };
            };
            responses: {
                /** @description Progress diverifikasi */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/programs/progress/photos/{progressId}/download": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                progressId: number;
            };
            cookie?: never;
        };
        /** Unduh foto progres dengan presigned URL */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    progressId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Foto progres dan URL unduhan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/costs/{costId}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                costId: number;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    costId: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        decision: "APPROVED" | "REJECTED";
                        rejectionReason?: string;
                    };
                };
            };
            responses: {
                /** @description Biaya diverifikasi */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/costs/{costId}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                costId: number;
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    costId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar dokumen biaya */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    costId: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "multipart/form-data": {
                        /** Format: binary */
                        file: string;
                    };
                };
            };
            responses: {
                /** @description Dokumen diupload */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/costs/{costId}/documents/{documentId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                costId: number;
                documentId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    costId: number;
                    documentId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Dokumen dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar foto survey */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "multipart/form-data": {
                        /** Format: binary */
                        file: string;
                        caption?: string;
                        latitude?: number;
                        longitude?: number;
                    };
                };
            };
            responses: {
                /** @description Foto diupload */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/photos/{photoId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
                photoId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                    photoId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Foto dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar review survey */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/status-history": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Riwayat status survey */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/{id}/links": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar link survey-program */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        programId: number;
                        relationType?: string;
                    };
                };
            };
            responses: {
                /** @description Link dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/surveys/links/{linkId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                linkId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    linkId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Link dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advice/{id}/replies": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["StringId"];
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Daftar balasan arahan */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["StringId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        isi: string;
                    };
                };
            };
            responses: {
                /** @description Balasan dibuat */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advice/replies/{replyId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                replyId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    replyId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Balasan dihapus */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Error: {
            error: {
                code: string;
                message: string;
                details?: unknown;
            };
        };
        PaginationMeta: {
            page: number;
            pageSize: number;
            skip: number;
            total: number;
            totalPages: number;
        };
        User: {
            /** @example 1 */
            id?: number;
            nama?: string;
            /** Format: email */
            email?: string;
            /** @enum {string} */
            role?: "ADMIN" | "OPERATOR" | "PIMPINAN";
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        Program: {
            id?: number;
            kode?: string;
            nama?: string;
            kategori?: string;
            lokasi?: string;
            kecamatan?: string | null;
            desaKelurahan?: string | null;
            periode?: string;
            satuan?: string;
            target?: number;
            realisasi?: number;
            /** @enum {string} */
            status?: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
            pagu?: number;
            penggunaan?: number;
        };
        Survey: {
            id?: string;
            kodeSurvey?: string;
            /** Format: date-time */
            tanggal?: string;
            surveyor?: string;
            namaKegiatan?: string;
            kategori?: string;
            /** @enum {string} */
            kondisi?: "BAIK" | "RUSAK_RINGAN" | "RUSAK_SEDANG" | "RUSAK_BERAT";
            /** @enum {string} */
            tingkatUrgensi?: "RENDAH" | "SEDANG" | "TINGGI_MENDESAK";
            /** @enum {string} */
            status?: "DRAFT" | "SELESAI_SURVEY" | "MENUNGGU_VERIFIKASI" | "PERLU_REVISI" | "DIVERIFIKASI" | "DIKONVERSI";
        };
        Advice: {
            id?: string;
            idKegiatan?: number;
            namaKegiatan?: string;
            identitasPimpinan?: string;
            operatorPenerima?: string;
            isi?: string;
            status?: string;
            /** Format: date-time */
            tanggal?: string;
        };
        LoginInput: {
            /** Format: email */
            email: string;
            password: string;
        };
        AuthResponse: {
            /** @description JWT access token; juga dikirim sebagai cookie kp_session. */
            accessToken: string;
            user: components["schemas"]["User"];
            /** Format: date-time */
            expiresAt: string;
        };
        UserInput: {
            nama: string;
            /** Format: email */
            email: string;
            /** @enum {string} */
            role: "Admin" | "Operator" | "Pimpinan";
            password: string;
        };
        UserUpdateInput: {
            nama?: string;
            /** Format: email */
            email?: string;
            /** @enum {string} */
            role?: "Admin" | "Operator" | "Pimpinan";
            password?: string;
        };
        ProgramInput: {
            kode: string;
            nama: string;
            kategori: string;
            lokasi: string;
            periode: string;
            satuan: string;
            target: number;
            pagu: number;
        };
        ProgramUpdateInput: {
            nama?: string;
            kategori?: string;
            lokasi?: string;
            periode?: string;
            satuan?: string;
            target?: number;
            pagu?: number;
            /** @enum {string} */
            status?: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
        };
        SurveyInput: {
            kodeSurvey: string;
            /** Format: date */
            tanggal: string;
            surveyor: string;
            namaKegiatan: string;
            kategori: string;
            kecamatan: string;
            desaKelurahan: string;
            detailLokasi: string;
            /** @enum {string} */
            kondisi: "BAIK" | "RUSAK_RINGAN" | "RUSAK_SEDANG" | "RUSAK_BERAT";
            /** @enum {string} */
            tingkatUrgensi: "RENDAH" | "SEDANG" | "TINGGI_MENDESAK";
            uraianTemuan: string;
            rekomendasi: string;
            /** @enum {string} */
            status:
                | "DRAFT"
                | "SELESAI_SURVEY"
                | "MENUNGGU_VERIFIKASI"
                | "PERLU_REVISI"
                | "DIVERIFIKASI"
                | "DIKONVERSI";
        };
        SurveyUpdateInput: {
            kodeSurvey?: string;
            /** Format: date */
            tanggal?: string;
            surveyor?: string;
            /** @enum {string} */
            status?:
                | "DRAFT"
                | "SELESAI_SURVEY"
                | "MENUNGGU_VERIFIKASI"
                | "PERLU_REVISI"
                | "DIVERIFIKASI"
                | "DIKONVERSI";
        };
        AdviceInput: {
            idKegiatan: number;
            namaKegiatan: string;
            operatorPenerima: string;
            operatorId?: number | null;
            isi: string;
        };
        AdviceStatusInput: {
            /** @enum {string} */
            status: "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI";
        };
        ProgressInput: {
            /** Format: date */
            tanggal: string;
            tahap: string;
            nilai: number;
            satuan: string;
            keterangan: string;
            foto?: boolean;
            /** @enum {string} */
            status: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
        };
        CostInput: {
            /** Format: date */
            tanggal: string;
            uraian: string;
            nominal: number;
            bukti?: boolean;
        };
        ProgramAssignment: {
            id?: number;
            programId?: number;
            operatorId?: number;
            assignedById?: number | null;
            /** @enum {string} */
            status?: "DITUGASKAN" | "DITERIMA" | "DITOLAK" | "DILEPAS";
            notes?: string | null;
            /** Format: date-time */
            assignedAt?: string;
            /** Format: date-time */
            acceptedAt?: string | null;
            /** Format: date-time */
            releasedAt?: string | null;
        };
        ProgramHistory: {
            id?: number;
            programId?: number;
            /** Format: date-time */
            tanggal?: string;
            tahap?: string;
            nilai?: number;
            satuan?: string;
            keterangan?: string;
            foto?: boolean;
            penginput?: string;
            status?: string;
            /** Format: date-time */
            createdAt?: string;
        };
        ProgramProgress: {
            id?: number;
            programId?: number;
            /** Format: date-time */
            tanggal?: string;
            tahap?: string;
            volume?: number;
            satuan?: string;
            persentase?: number | null;
            keterangan?: string;
            /** @enum {string} */
            status?: "DRAFT" | "DIAJUKAN" | "DIVERIFIKASI" | "DITOLAK";
            /** Format: date-time */
            verifiedAt?: string | null;
            rejectionReason?: string | null;
            /** Format: date-time */
            createdAt?: string;
        };
        ProgramCost: {
            id?: number;
            programId?: number;
            /** Format: date-time */
            tanggal?: string;
            uraian?: string;
            nominal?: number;
            input?: string;
            bukti?: boolean;
            kategori?: string | null;
            /** @enum {string} */
            status?: "DRAFT" | "DIAJUKAN" | "DIVERIFIKASI" | "DITOLAK";
            /** Format: date-time */
            verifiedAt?: string | null;
            rejectionReason?: string | null;
            /** Format: date-time */
            createdAt?: string;
        };
        ProgramCostDocument: {
            id?: string;
            costId?: number;
            storageKey?: string;
            originalName?: string;
            mimeType?: string;
            fileSize?: number;
            /** Format: uri */
            url?: string;
            uploadedById?: number | null;
            /** Format: date-time */
            createdAt?: string;
        };
        SurveyPhoto: {
            id?: string;
            surveyId?: string;
            storageKey?: string;
            originalName?: string;
            mimeType?: string;
            fileSize?: number;
            /** Format: uri */
            url?: string;
            caption?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            uploadedById?: number | null;
            /** Format: date-time */
            createdAt?: string;
        };
        SurveyReview: {
            id?: string;
            surveyId?: string;
            reviewerId?: number;
            /** @enum {string} */
            decision?: "DISETUJUI" | "DITOLAK" | "PERLU_REVISI";
            notes?: string | null;
            /** Format: date-time */
            reviewedAt?: string;
        };
        SurveyStatusHistory: {
            id?: number;
            surveyId?: string;
            fromStatus?: string | null;
            toStatus?: string;
            changedById?: number | null;
            reason?: string | null;
            /** Format: date-time */
            createdAt?: string;
        };
        SurveyProgramLink: {
            id?: string;
            surveyId?: string;
            programId?: number;
            linkedById?: number | null;
            relationType?: string;
            /** Format: date-time */
            linkedAt?: string;
        };
        AdviceReply: {
            id?: string;
            adviceId?: string;
            authorId?: number;
            isi?: string;
            /** Format: date-time */
            createdAt?: string;
        };
    };
    responses: never;
    parameters: {
        Id: number;
        StringId: string;
        Search: string;
        Status: string;
        Page: number;
        PageSize: number;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
