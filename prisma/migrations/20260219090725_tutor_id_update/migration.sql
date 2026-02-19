/*
  Warnings:

  - You are about to drop the column `tutorid` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `tutorId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tutorid_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "tutorid",
ADD COLUMN     "tutorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutorProfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
