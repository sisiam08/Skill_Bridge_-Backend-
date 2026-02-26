/*
  Warnings:

  - You are about to drop the column `averageRating` on the `tutorProfiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tutorProfiles" DROP COLUMN "averageRating",
ADD COLUMN     "totalRating" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "experienceYears" SET DATA TYPE DOUBLE PRECISION;
