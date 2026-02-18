/*
  Warnings:

  - You are about to drop the column `availability` on the `tutorProfiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tutorProfiles" DROP COLUMN "availability";

-- CreateTable
CREATE TABLE "TutorAvailability" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "TutorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_id_idx" ON "bookings"("id");

-- AddForeignKey
ALTER TABLE "TutorAvailability" ADD CONSTRAINT "TutorAvailability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutorProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
