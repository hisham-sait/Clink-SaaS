const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reinstateDataRecordTable() {
  try {
    console.log('Starting to reinstate DataRecord table...');
    
    // Execute raw SQL to add columns to Dataset table
    console.log('Adding columns to Dataset table...');
    await prisma.$executeRaw`
      ALTER TABLE "Dataset" 
      ADD COLUMN IF NOT EXISTS "webhookId" TEXT,
      ADD COLUMN IF NOT EXISTS "webhookSecret" TEXT,
      ADD COLUMN IF NOT EXISTS "sourceId" TEXT,
      ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
    `;
    
    // Create unique index on webhookId
    console.log('Creating unique index on webhookId...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Dataset_webhookId_key" ON "Dataset"("webhookId");
    `;
    
    // Create index on sourceId
    console.log('Creating index on sourceId...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Dataset_sourceId_idx" ON "Dataset"("sourceId");
    `;
    
    // Check if DataRecord table exists
    console.log('Checking if DataRecord table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'DataRecord'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('Creating DataRecord table...');
      await prisma.$executeRaw`
        CREATE TABLE "DataRecord" (
          "id" TEXT NOT NULL,
          "datasetId" TEXT NOT NULL,
          "data" JSONB NOT NULL,
          "metadata" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "DataRecord_pkey" PRIMARY KEY ("id")
        );
      `;
      
      // Create indexes
      console.log('Creating indexes on DataRecord table...');
      await prisma.$executeRaw`
        CREATE INDEX "DataRecord_datasetId_idx" ON "DataRecord"("datasetId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX "DataRecord_createdAt_idx" ON "DataRecord"("createdAt");
      `;
      
      // Add foreign key constraint
      console.log('Adding foreign key constraint...');
      await prisma.$executeRaw`
        ALTER TABLE "DataRecord" 
        ADD CONSTRAINT "DataRecord_datasetId_fkey" 
        FOREIGN KEY ("datasetId") 
        REFERENCES "Dataset"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
      `;
    } else {
      console.log('DataRecord table already exists.');
    }
    
    console.log('Successfully reinstated DataRecord table!');
    
    // Migrate data from Dataset.data to DataRecord
    console.log('\nMigrating data from Dataset.data to DataRecord...');
    const datasets = await prisma.dataset.findMany();
    
    console.log(`Found ${datasets.length} datasets to process.`);
    
    for (const dataset of datasets) {
      console.log(`Processing dataset: ${dataset.name} (${dataset.id})`);
      
      // Check if dataset.data contains records
      let records = [];
      
      if (Array.isArray(dataset.data)) {
        records = dataset.data;
      } else if (dataset.data && typeof dataset.data === 'object') {
        if (dataset.data.records && Array.isArray(dataset.data.records)) {
          records = dataset.data.records;
        }
      }
      
      if (records.length > 0) {
        console.log(`Found ${records.length} records to migrate.`);
        
        // Create DataRecord entries for each record
        for (const record of records) {
          const recordData = { ...record };
          delete recordData.id; // Remove id if present, as we'll create a new one
          
          await prisma.dataRecord.create({
            data: {
              datasetId: dataset.id,
              data: recordData,
              metadata: record.metadata || {},
              updatedAt: new Date()
            }
          });
        }
        
        console.log(`Migrated ${records.length} records for dataset ${dataset.name}.`);
      } else {
        console.log(`No records found in dataset ${dataset.name}.`);
      }
    }
    
    console.log('\nData migration completed successfully!');
    
  } catch (error) {
    console.error('Error reinstating DataRecord table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reinstateDataRecordTable()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Error running script:', error));
