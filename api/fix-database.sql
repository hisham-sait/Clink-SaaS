-- First, add the elements column to the Form table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Form' 
        AND column_name = 'elements'
    ) THEN
        ALTER TABLE "Form" ADD COLUMN "elements" JSONB NOT NULL DEFAULT '[]';
    END IF;
END $$;

-- Now add the analytics fields

-- AlterTable: Add columns to PageView if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'visitorId') THEN
        ALTER TABLE "PageView" ADD COLUMN "visitorId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'device') THEN
        ALTER TABLE "PageView" ADD COLUMN "device" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'browser') THEN
        ALTER TABLE "PageView" ADD COLUMN "browser" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'location') THEN
        ALTER TABLE "PageView" ADD COLUMN "location" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'referrer') THEN
        ALTER TABLE "PageView" ADD COLUMN "referrer" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PageView' AND column_name = 'timeOnPage') THEN
        ALTER TABLE "PageView" ADD COLUMN "timeOnPage" INTEGER;
    END IF;
END $$;

-- AlterTable: Add columns to FormSubmission if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'visitorId') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "visitorId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'device') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "device" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'browser') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "browser" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'location') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "location" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'referrer') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "referrer" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'completionTime') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "completionTime" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FormSubmission' AND column_name = 'status') THEN
        ALTER TABLE "FormSubmission" ADD COLUMN "status" TEXT DEFAULT 'completed';
    END IF;
END $$;

-- AlterTable: Add columns to SurveyResponse if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'visitorId') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "visitorId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'device') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "device" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'browser') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "browser" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'location') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "location" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'referrer') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "referrer" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'completionTime') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "completionTime" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SurveyResponse' AND column_name = 'status') THEN
        ALTER TABLE "SurveyResponse" ADD COLUMN "status" TEXT DEFAULT 'completed';
    END IF;
END $$;

-- CreateTable: Create FormView table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'FormView') THEN
        CREATE TABLE "FormView" (
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

        CREATE INDEX "FormView_formId_idx" ON "FormView"("formId");
        CREATE INDEX "FormView_createdAt_idx" ON "FormView"("createdAt");
        
        ALTER TABLE "FormView" ADD CONSTRAINT "FormView_formId_fkey" 
            FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Create SurveyView table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SurveyView') THEN
        CREATE TABLE "SurveyView" (
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

        CREATE INDEX "SurveyView_surveyId_idx" ON "SurveyView"("surveyId");
        CREATE INDEX "SurveyView_createdAt_idx" ON "SurveyView"("createdAt");
        
        ALTER TABLE "SurveyView" ADD CONSTRAINT "SurveyView_surveyId_fkey" 
            FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
