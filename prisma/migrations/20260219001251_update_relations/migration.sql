-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- AddForeignKey
ALTER TABLE "tutorProfiles" ADD CONSTRAINT "tutorProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
