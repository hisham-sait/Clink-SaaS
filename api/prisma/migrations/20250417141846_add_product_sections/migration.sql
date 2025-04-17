-- CreateTable
CREATE TABLE "ProductSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "displayIn" TEXT NOT NULL DEFAULT 'both',
    "order" INTEGER NOT NULL DEFAULT 1,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSection_companyId_idx" ON "ProductSection"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSection_companyId_code_key" ON "ProductSection"("companyId", "code");

-- AddForeignKey
ALTER TABLE "ProductSection" ADD CONSTRAINT "ProductSection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
