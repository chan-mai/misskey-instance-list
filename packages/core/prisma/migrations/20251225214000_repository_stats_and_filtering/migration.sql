-- CreateTable
CREATE TABLE "repositories" (
    "url" STRING NOT NULL,
    "name" STRING,
    "description" STRING,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("url")
);

-- CreateIndex
CREATE INDEX "instances_repository_url_idx" ON "instances"("repository_url");

-- AddForeignKey
ALTER TABLE "instances" ADD CONSTRAINT "instances_repository_url_fkey" FOREIGN KEY ("repository_url") REFERENCES "repositories"("url") ON DELETE SET NULL ON UPDATE CASCADE;
