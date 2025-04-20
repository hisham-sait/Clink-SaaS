-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodeClick" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "location" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodeClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodeActivity" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodeActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRCode_companyId_idx" ON "QRCode"("companyId");

-- CreateIndex
CREATE INDEX "QRCode_status_idx" ON "QRCode"("status");

-- CreateIndex
CREATE INDEX "QRCode_categoryId_idx" ON "QRCode"("categoryId");

-- CreateIndex
CREATE INDEX "QRCodeClick_qrCodeId_idx" ON "QRCodeClick"("qrCodeId");

-- CreateIndex
CREATE INDEX "QRCodeClick_timestamp_idx" ON "QRCodeClick"("timestamp");

-- CreateIndex
CREATE INDEX "QRCodeActivity_qrCodeId_idx" ON "QRCodeActivity"("qrCodeId");

-- CreateIndex
CREATE INDEX "QRCodeActivity_userId_idx" ON "QRCodeActivity"("userId");

-- CreateIndex
CREATE INDEX "QRCodeActivity_timestamp_idx" ON "QRCodeActivity"("timestamp");

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LinkCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeClick" ADD CONSTRAINT "QRCodeClick_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeActivity" ADD CONSTRAINT "QRCodeActivity_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeActivity" ADD CONSTRAINT "QRCodeActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
