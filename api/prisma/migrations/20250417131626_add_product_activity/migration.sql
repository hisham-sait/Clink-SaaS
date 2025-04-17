-- CreateTable
CREATE TABLE "ProductActivity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductActivity_companyId_idx" ON "ProductActivity"("companyId");

-- CreateIndex
CREATE INDEX "ProductActivity_userId_idx" ON "ProductActivity"("userId");

-- CreateIndex
CREATE INDEX "ProductActivity_itemType_itemId_idx" ON "ProductActivity"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "ProductActivity_timestamp_idx" ON "ProductActivity"("timestamp");

-- AddForeignKey
ALTER TABLE "ProductActivity" ADD CONSTRAINT "ProductActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
