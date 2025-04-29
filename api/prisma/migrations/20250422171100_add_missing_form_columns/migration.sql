-- Add missing columns to Form table
ALTER TABLE "Form" ADD COLUMN IF NOT EXISTS "elements" JSONB;
ALTER TABLE "Form" ADD COLUMN IF NOT EXISTS "sections" JSONB;
