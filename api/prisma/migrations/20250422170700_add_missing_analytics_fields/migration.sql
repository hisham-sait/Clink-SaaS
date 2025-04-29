-- Add missing visitorId column to PageView table
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;

-- Add missing columns to FormView table
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "timeOnPage" INTEGER;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "FormView" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Add missing columns to SurveyView table
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "timeOnPage" INTEGER;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "SurveyView" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Add missing columns to FormSubmission table
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "completionTime" INTEGER;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'completed';

-- Add missing columns to SurveyResponse table
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "completionTime" INTEGER;
ALTER TABLE "SurveyResponse" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'completed';
