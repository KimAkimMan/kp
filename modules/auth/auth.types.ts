import type { UserRole } from "@/generated/prisma/client";

export type PublicUser = {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthenticatedUser = PublicUser & {
  sessionId: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
