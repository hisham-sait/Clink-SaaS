-- CreateTable
CREATE TABLE "DataRecord" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataRecord_pkey" PRIMARY KEY ("id")
);

-- AddField
ALTER TABLE "Dataset" ADD COLUMN "webhookId" TEXT;
ALTER TABLE "Dataset" ADD COLUMN "webhookSecret" TEXT;
ALTER TABLE "Dataset" ADD COLUMN "sourceId" TEXT;
ALTER TABLE "Dataset" ADD COLUMN "sourceName" TEXT;

-- CreateIndex
CREATE INDEX "DataRecord_datasetId_idx" ON "DataRecord"("datasetId");
CREATE INDEX "DataRecord_createdAt_idx" ON "DataRecord"("createdAt");
CREATE UNIQUE INDEX "Dataset_webhookId_key" ON "Dataset"("webhookId");
CREATE INDEX "Dataset_sourceId_idx" ON "Dataset"("sourceId");

-- AddForeignKey
ALTER TABLE "DataRecord" ADD CONSTRAINT "DataRecord_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
