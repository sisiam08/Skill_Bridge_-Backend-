-- DropForeignKey
ALTER TABLE "tutorProfiles" DROP CONSTRAINT "tutorProfiles_categoriesId_fkey";

-- AlterTable
ALTER TABLE "tutorProfiles" ALTER COLUMN "categoriesId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tutorProfiles" ADD CONSTRAINT "tutorProfiles_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
