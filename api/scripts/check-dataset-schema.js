const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatasetSchema() {
  try {
    console.log('Checking Dataset table schema...');
    
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
    
    // Check if the webhookId and webhookSecret columns exist
    const hasWebhookId = columns.some(column => column.column_name === 'webhookId');
    const hasWebhookSecret = columns.some(column => column.column_name === 'webhookSecret');
    
    console.log(`\nwebhookId column exists: ${hasWebhookId}`);
    console.log(`webhookSecret column exists: ${hasWebhookSecret}`);
    
    // Generate Prisma schema for Dataset model based on actual columns
    console.log('\nGenerated Prisma schema for Dataset model:');
    console.log('model Dataset {');
    columns.forEach(column => {
      let type = '';
      switch (column.data_type) {
        case 'text':
          type = 'String';
          break;
        case 'timestamp without time zone':
          type = 'DateTime';
          break;
        case 'jsonb':
          type = 'Json';
          break;
        default:
          type = 'String';
      }
      
      if (column.is_nullable === 'YES') {
        type += '?';
      }
      
      if (column.column_name === 'id') {
        type += ' @id @default(cuid())';
      } else if (column.column_name === 'createdAt') {
        type += ' @default(now())';
      } else if (column.column_name === 'updatedAt') {
        type += ' @updatedAt';
      }
      
      console.log(`  ${column.column_name} ${type}`);
    });
    console.log('}');
    
  } catch (error) {
    console.error('Error checking Dataset schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatasetSchema()
  .then(() => console.log('Schema check completed'))
  .catch(error => console.error('Error running script:', error));
