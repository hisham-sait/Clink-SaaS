const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function queryDataTable() {
  try {
    console.log('Checking for Data table in the database...');
    
    // Try to query the Dataset model and check its data field
    console.log('\nQuerying Dataset model and its data field:');
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
    
    // Try to execute a raw query to check if there's a table named "Data"
    console.log('\n\nExecuting raw query to check for "Data" table:');
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'Data'
        );
      `;
      console.log('Raw query result:', result);
      
      if (result[0] && result[0].exists) {
        console.log('The "Data" table exists in the database.');
        
        // Try to query the Data table
        const dataRecords = await prisma.$queryRaw`
          SELECT * FROM "Data" LIMIT 10;
        `;
        console.log(`Found ${dataRecords.length} records in the Data table:`);
        console.log(JSON.stringify(dataRecords, null, 2));
      } else {
        console.log('The "Data" table does NOT exist in the database.');
      }
    } catch (error) {
      console.error('Error executing raw query:', error);
    }
    
    // List all tables in the database
    console.log('\n\nListing all tables in the database:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('Tables in the database:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('Error querying data table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryDataTable()
  .then(() => console.log('Query completed'))
  .catch(error => console.error('Error running script:', error));
