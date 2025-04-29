-- Create FormView table if it doesn't exist
CREATE TABLE IF NOT EXISTS "FormView" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
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

  CONSTRAINT "FormView_pkey" PRIMARY KEY ("id")
);

-- Create SurveyView table if it doesn't exist
CREATE TABLE IF NOT EXISTS "SurveyView" (
  "id" TEXT NOT NULL,
  "surveyId" TEXT NOT NULL,
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

  CONSTRAINT "SurveyView_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "FormView" ADD CONSTRAINT "FormView_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SurveyView" ADD CONSTRAINT "SurveyView_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "FormView_formId_idx" ON "FormView"("formId");
CREATE INDEX "FormView_createdAt_idx" ON "FormView"("createdAt");
CREATE INDEX "SurveyView_surveyId_idx" ON "SurveyView"("surveyId");
CREATE INDEX "SurveyView_createdAt_idx" ON "SurveyView"("createdAt");
