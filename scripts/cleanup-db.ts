import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  // Disable foreign key checks so we can delete in dependency order
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

  // Delete in reverse dependency order (children first, parents last)
  await prisma.adviceReply.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.surveyProgramLink.deleteMany();
  await prisma.surveyStatusHistory.deleteMany();
  await prisma.surveyReview.deleteMany();
  await prisma.surveyPhoto.deleteMany();
  await prisma.fieldSurvey.deleteMany();
  await prisma.programCostDocument.deleteMany();
  await prisma.programCost.deleteMany();
  await prisma.programProgress.deleteMany();
  await prisma.programHistory.deleteMany();
  await prisma.programAssignment.deleteMany();
  await prisma.adviceRecord.deleteMany();
  await prisma.program.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.programCategory.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.kecamatan.deleteMany();
  await prisma.village.deleteMany();
  await prisma.period.deleteMany();

  // Re-enable foreign key checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

  console.log("All tables cleaned successfully.");
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
