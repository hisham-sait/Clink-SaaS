-- CreateTable
CREATE TABLE "InsightReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dashboardId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsightReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightReportView" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "visitorId" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "location" TEXT,
    "referrer" TEXT,
    "timeOnPage" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsightReportView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsightReport_companyId_idx" ON "InsightReport"("companyId");

-- CreateIndex
CREATE INDEX "InsightReport_status_idx" ON "InsightReport"("status");

-- CreateIndex
CREATE INDEX "InsightReportView_reportId_idx" ON "InsightReportView"("reportId");

-- CreateIndex
CREATE INDEX "InsightReportView_createdAt_idx" ON "InsightReportView"("createdAt");

-- AddForeignKey
ALTER TABLE "InsightReport" ADD CONSTRAINT "InsightReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightReportView" ADD CONSTRAINT "InsightReportView_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "InsightReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
