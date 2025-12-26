-- AlterTable
ALTER TABLE "instances" ADD COLUMN     "language" STRING;

-- CreateIndex
CREATE INDEX "instances_language_idx" ON "instances"("language");
