import { prisma } from "@/lib/prisma";
import { ProgramAssignmentStatus } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";

export type ProgramAssignmentInput = {
  operatorId: number;
  assignedById?: number;
  notes?: string;
};

export type ProgramAssignmentUpdateInput = {
  status?: ProgramAssignmentStatus;
  acceptedAt?: Date | null;
  releasedAt?: Date | null;
  notes?: string;
};

export const programAssignmentRepository = {
  async list(programId: number) {
    return prisma.programAssignment.findMany({
      where: { programId },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  },

  async findById(id: number) {
    const assignment = await prisma.programAssignment.findUnique({
      where: { id },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
    });
    if (!assignment) throw new ApiError("ASSIGNMENT_NOT_FOUND", "Assignment tidak ditemukan.", 404);
    return assignment;
  },

  async create(programId: number, input: ProgramAssignmentInput) {
    const program = await prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    // Cek apakah operator sudah memiliki assignment aktif
    const existing = await prisma.programAssignment.findFirst({
      where: {
        programId,
        operatorId: input.operatorId,
        status: { in: ["DITUGASKAN", "DITERIMA"] },
      },
    });
    if (existing) {
      throw new ApiError(
        "OPERATOR_ALREADY_ASSIGNED",
        "Operator sudah ditugaskan untuk program ini.",
        409,
      );
    }

    return prisma.programAssignment.create({
      data: {
        programId,
        operatorId: input.operatorId,
        assignedById: input.assignedById,
        status: ProgramAssignmentStatus.DITUGASKAN,
        notes: input.notes ?? null,
        assignedAt: new Date(),
      },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async update(id: number, input: ProgramAssignmentUpdateInput) {
    const assignment = await this.findById(id);
    return prisma.programAssignment.update({
      where: { id },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.acceptedAt !== undefined ? { acceptedAt: input.acceptedAt } : {}),
        ...(input.releasedAt !== undefined ? { releasedAt: input.releasedAt } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async delete(id: number) {
    await this.findById(id);
    return prisma.programAssignment.delete({ where: { id } });
  },

  async accept(assignmentId: number, operatorId: number) {
    const assignment = await this.findById(assignmentId);
    if (assignment.operatorId !== operatorId) {
      throw new ApiError("FORBIDDEN", "Anda bukan operator yang ditugaskan.", 403);
    }
    if (assignment.status !== ProgramAssignmentStatus.DITUGASKAN) {
      throw new ApiError(
        "INVALID_ASSIGNMENT_STATUS",
        "Assignment tidak dalam status ditugaskan.",
        409,
      );
    }
    return prisma.programAssignment.update({
      where: { id: assignmentId },
      data: {
        status: ProgramAssignmentStatus.DITERIMA,
        acceptedAt: new Date(),
      },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async release(assignmentId: number, operatorId: number, isAdmin: boolean) {
    const assignment = await this.findById(assignmentId);
    if (!isAdmin && assignment.operatorId !== operatorId) {
      throw new ApiError("FORBIDDEN", "Anda bukan operator yang ditugaskan.", 403);
    }
    return prisma.programAssignment.update({
      where: { id: assignmentId },
      data: {
        status: ProgramAssignmentStatus.DILEPAS,
        releasedAt: new Date(),
      },
      include: {
        operator: { select: { id: true, nama: true, email: true, role: true } },
        assignedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },
};