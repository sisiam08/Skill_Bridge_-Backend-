/*
  Warnings:

  - You are about to drop the column `averagerating` on the `tutorProfiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tutorProfiles" DROP COLUMN "averagerating",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
