-- DropIndex
DROP INDEX "Submission_userId_pageSlug_key";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Submission_userId_pageSlug_attemptNumber_idx" ON "Submission"("userId", "pageSlug", "attemptNumber");
