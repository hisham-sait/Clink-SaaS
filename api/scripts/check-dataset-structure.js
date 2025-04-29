const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatasetStructure() {
  try {
    console.log('Checking Dataset table structure...');
    
    // Get the column information for the Dataset table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Dataset'
      ORDER BY ordinal_position;
    `;
    
    console.log('Dataset table columns:');
    columns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Try to insert a test dataset
    console.log('\nAttempting to insert a test dataset...');
    try {
      const testDataset = await prisma.dataset.create({
        data: {
          name: 'Test Dataset',
          description: 'Test dataset created via script',
          type: 'test',
          companyId: '1', // This needs to be a valid company ID
          data: { test: 'data' }
        }
      });
      
      console.log('Test dataset created successfully:');
      console.log(testDataset);
      
      // Clean up the test dataset
      await prisma.dataset.delete({
        where: {
          id: testDataset.id
        }
      });
      console.log('Test dataset deleted.');
    } catch (error) {
      console.error('Error creating test dataset:', error);
    }
    
    // Check if there are any existing datasets
    console.log('\nChecking for existing datasets...');
    const datasets = await prisma.dataset.findMany();
    
    console.log(`Found ${datasets.length} datasets:`);
    datasets.forEach(dataset => {
      console.log(`\nID: ${dataset.id}`);
      console.log(`Name: ${dataset.name}`);
      console.log(`Type: ${dataset.type}`);
      console.log(`Company ID: ${dataset.companyId}`);
      console.log(`Created: ${dataset.createdAt}`);
      console.log(`Updated: ${dataset.updatedAt}`);
      console.log(`Description: ${dataset.description || 'N/A'}`);
      
      // Check the data field
      console.log(`Data: ${JSON.stringify(dataset.data, null, 2)}`);
      
      if (dataset.schema) {
        console.log(`Schema: ${JSON.stringify(dataset.schema, null, 2)}`);
      }
    });
    
  } catch (error) {
    console.error('Error checking dataset structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatasetStructure()
  .then(() => console.log('Check completed'))
  .catch(error => console.error('Error running script:', error));
