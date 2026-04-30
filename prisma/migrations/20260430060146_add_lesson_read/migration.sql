-- CreateTable
CREATE TABLE "LessonRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonRead_userId_idx" ON "LessonRead"("userId");

-- CreateIndex
CREATE INDEX "LessonRead_pageSlug_idx" ON "LessonRead"("pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "LessonRead_userId_pageSlug_key" ON "LessonRead"("userId", "pageSlug");

-- AddForeignKey
ALTER TABLE "LessonRead" ADD CONSTRAINT "LessonRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
