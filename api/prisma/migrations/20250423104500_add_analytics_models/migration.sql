-- Create analytics tables for storing data from various providers (including Microsoft Clarity)

-- Main table to track analytics sessions
CREATE TABLE IF NOT EXISTS "AnalyticsSession" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "userId" TEXT,
  "sessionStart" TIMESTAMP(3) NOT NULL,
  "sessionEnd" TIMESTAMP(3),
  "deviceType" TEXT NOT NULL,
  "browser" TEXT NOT NULL,
  "os" TEXT NOT NULL,
  "screenResolution" TEXT NOT NULL,
  "country" TEXT,
  "region" TEXT,
  "referrer" TEXT,
  "landingPage" TEXT NOT NULL,
  "exitPage" TEXT,
  "totalPages" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

-- Page views within sessions
CREATE TABLE IF NOT EXISTS "AnalyticsPageView" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "pageUrl" TEXT NOT NULL,
  "pageTitle" TEXT NOT NULL,
  "viewStart" TIMESTAMP(3) NOT NULL,
  "viewEnd" TIMESTAMP(3),
  "timeOnPage" INTEGER,
  "scrollDepth" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

-- User behaviors/events
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "pageViewId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "eventTime" TIMESTAMP(3) NOT NULL,
  "targetElement" TEXT,
  "xPosition" INTEGER,
  "yPosition" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- Aggregated metrics (daily)
CREATE TABLE IF NOT EXISTS "AnalyticsDailyMetric" (
  "id" SERIAL NOT NULL,
  "provider" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "pageUrl" TEXT NOT NULL,
  "totalViews" INTEGER NOT NULL DEFAULT 0,
  "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
  "avgTimeOnPage" INTEGER,
  "bounceRate" DECIMAL(5,2),
  "rageClicks" INTEGER NOT NULL DEFAULT 0,
  "deadClicks" INTEGER NOT NULL DEFAULT 0,
  "excessiveScrolls" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsDailyMetric_pkey" PRIMARY KEY ("id")
);

-- Mapping between analytics sessions and our entities
CREATE TABLE IF NOT EXISTS "AnalyticsEntityMapping" (
  "id" SERIAL NOT NULL,
  "sessionId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsEntityMapping_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_pageViewId_fkey" FOREIGN KEY ("pageViewId") REFERENCES "AnalyticsPageView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "AnalyticsDailyMetric" ADD CONSTRAINT "AnalyticsDailyMetric_provider_date_pageUrl_key" UNIQUE ("provider", "date", "pageUrl");
ALTER TABLE "AnalyticsEntityMapping" ADD CONSTRAINT "AnalyticsEntityMapping_sessionId_entityType_entityId_key" UNIQUE ("sessionId", "entityType", "entityId");

-- Add indexes for better query performance
CREATE INDEX "AnalyticsSession_provider_idx" ON "AnalyticsSession"("provider");
CREATE INDEX "AnalyticsSession_sessionStart_idx" ON "AnalyticsSession"("sessionStart");
CREATE INDEX "AnalyticsSession_deviceType_idx" ON "AnalyticsSession"("deviceType");
CREATE INDEX "AnalyticsSession_country_idx" ON "AnalyticsSession"("country");

CREATE INDEX "AnalyticsPageView_sessionId_idx" ON "AnalyticsPageView"("sessionId");
CREATE INDEX "AnalyticsPageView_pageUrl_idx" ON "AnalyticsPageView"("pageUrl");
CREATE INDEX "AnalyticsPageView_viewStart_idx" ON "AnalyticsPageView"("viewStart");

CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX "AnalyticsEvent_pageViewId_idx" ON "AnalyticsEvent"("pageViewId");
CREATE INDEX "AnalyticsEvent_provider_idx" ON "AnalyticsEvent"("provider");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_eventTime_idx" ON "AnalyticsEvent"("eventTime");

CREATE INDEX "AnalyticsDailyMetric_provider_idx" ON "AnalyticsDailyMetric"("provider");
CREATE INDEX "AnalyticsDailyMetric_date_idx" ON "AnalyticsDailyMetric"("date");
CREATE INDEX "AnalyticsDailyMetric_pageUrl_idx" ON "AnalyticsDailyMetric"("pageUrl");

CREATE INDEX "AnalyticsEntityMapping_sessionId_idx" ON "AnalyticsEntityMapping"("sessionId");
CREATE INDEX "AnalyticsEntityMapping_provider_idx" ON "AnalyticsEntityMapping"("provider");
CREATE INDEX "AnalyticsEntityMapping_entityType_entityId_idx" ON "AnalyticsEntityMapping"("entityType", "entityId");
