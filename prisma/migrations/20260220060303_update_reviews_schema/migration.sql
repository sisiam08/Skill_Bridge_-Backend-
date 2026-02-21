/*
  Warnings:

  - You are about to drop the column `studenId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_tutorId_fkey";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "studenId",
DROP COLUMN "tutorId";
