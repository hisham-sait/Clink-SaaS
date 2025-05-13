-- Add type field to Form model
ALTER TABLE "Form" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'form';

-- Create index on type field
CREATE INDEX "Form_type_idx" ON "Form"("type");
