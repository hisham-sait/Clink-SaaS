const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dataService = require('../services/engage/data');

async function testDataService() {
  try {
    console.log('Testing data service with reinstated DataRecord table...');
    
    // Get a company ID to use for testing
    console.log('Getting a company ID for testing...');
    const company = await prisma.company.findFirst();
    
    if (!company) {
      console.error('No companies found in the database. Please create a company first.');
      return;
    }
    
    const companyId = company.id;
    console.log(`Using company: ${company.name} (${companyId})`);
    
    // Create a test dataset
    console.log('\nCreating a test dataset...');
    const testDataset = await dataService.createDataset({
      name: 'Test Dataset',
      description: 'Dataset created for testing',
      type: 'test'
    }, companyId);
    
    console.log(`Created dataset: ${testDataset.name} (${testDataset.id})`);
    
    // Add some test records
    console.log('\nAdding test records...');
    const testRecords = [
      { name: 'Record 1', value: 'Value 1', number: 1 },
      { name: 'Record 2', value: 'Value 2', number: 2 },
      { name: 'Record 3', value: 'Value 3', number: 3 }
    ];
    
    for (const recordData of testRecords) {
      const record = await dataService.addRecord(testDataset.id, recordData, { source: 'test' });
      console.log(`Added record: ${record.id}`);
    }
    
    // Get the dataset with record count
    console.log('\nGetting dataset with record count...');
    const dataset = await dataService.getDatasetById(testDataset.id, companyId);
    console.log(`Dataset ${dataset.name} has ${dataset.recordCount} records`);
    
    // Get the records
    console.log('\nGetting records...');
    const records = await dataService.getDatasetRecords(testDataset.id, companyId);
    console.log(`Retrieved ${records.data.length} records out of ${records.total} total`);
    console.log('Records:');
    records.data.forEach(record => {
      console.log(`- ${record.id}: ${JSON.stringify(record.data)}`);
    });
    
    // Clean up (optional - comment out to keep the test data)
    console.log('\nCleaning up test data...');
    await dataService.deleteDataset(testDataset.id, companyId);
    console.log('Test dataset deleted');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing data service:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDataService()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Error running script:', error));
