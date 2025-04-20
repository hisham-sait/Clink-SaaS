-- DropIndex
DROP INDEX "Link_shortCode_idx";

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "webhookId" TEXT,
    "webhookSecret" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRecord" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_webhookId_key" ON "Dataset"("webhookId");

-- CreateIndex
CREATE INDEX "Dataset_companyId_idx" ON "Dataset"("companyId");

-- CreateIndex
CREATE INDEX "Dataset_type_idx" ON "Dataset"("type");

-- CreateIndex
CREATE INDEX "Dataset_sourceId_idx" ON "Dataset"("sourceId");

-- CreateIndex
CREATE INDEX "DataRecord_datasetId_idx" ON "DataRecord"("datasetId");

-- CreateIndex
CREATE INDEX "DataRecord_createdAt_idx" ON "DataRecord"("createdAt");

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRecord" ADD CONSTRAINT "DataRecord_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
