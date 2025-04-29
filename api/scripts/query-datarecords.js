const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function queryDataRecords() {
  try {
    // Check if DataRecord model exists in the schema
    console.log('Checking DataRecord model in schema...');
    
    // Query for all data records
    console.log('\nQuerying all data records...');
    const records = await prisma.dataRecord.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        dataset: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });
    
    console.log(`Found ${records.length} data records:`);
    
    // Group records by dataset
    const recordsByDataset = {};
    records.forEach(record => {
      if (!recordsByDataset[record.datasetId]) {
        recordsByDataset[record.datasetId] = {
          datasetName: record.dataset.name,
          datasetType: record.dataset.type,
          records: []
        };
      }
      recordsByDataset[record.datasetId].records.push(record);
    });
    
    // Print records grouped by dataset
    console.log('\nRecords grouped by dataset:');
    for (const datasetId in recordsByDataset) {
      const { datasetName, datasetType, records } = recordsByDataset[datasetId];
      console.log(`\nDataset: ${datasetName} (${datasetId})`);
      console.log(`Type: ${datasetType}`);
      console.log(`Record count: ${records.length}`);
      
      console.log('Records:');
      records.forEach((record, index) => {
        console.log(`\n  Record ${index + 1}:`);
        console.log(`  ID: ${record.id}`);
        console.log(`  Created: ${record.createdAt}`);
        console.log(`  Data: ${JSON.stringify(record.data, null, 2)}`);
        
        // Check if metadata exists and print it
        if (record.metadata && Object.keys(record.metadata).length > 0) {
          console.log(`  Metadata: ${JSON.stringify(record.metadata, null, 2)}`);
        }
      });
    }
    
    // Check for any discrepancies between Dataset and DataRecord
    console.log('\n\nChecking for discrepancies...');
    const datasets = await prisma.dataset.findMany();
    
    for (const dataset of datasets) {
      const recordCount = await prisma.dataRecord.count({
        where: {
          datasetId: dataset.id
        }
      });
      
      console.log(`Dataset "${dataset.name}" (${dataset.id}):`);
      console.log(`  Record count: ${recordCount}`);
      
      // Check if there are any records with this dataset ID
      if (recordCount === 0) {
        console.log(`  WARNING: No records found for this dataset!`);
      }
    }
    
  } catch (error) {
    console.error('Error querying data records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryDataRecords()
  .then(() => console.log('Query completed'))
  .catch(error => console.error('Error running script:', error));
