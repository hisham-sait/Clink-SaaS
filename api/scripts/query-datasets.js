const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function queryDatasets() {
  try {
    console.log('Querying all datasets...');
    const datasets = await prisma.dataset.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`Found ${datasets.length} datasets:`);
    datasets.forEach(dataset => {
      console.log(`\nID: ${dataset.id}`);
      console.log(`Name: ${dataset.name}`);
      console.log(`Type: ${dataset.type}`);
      console.log(`Company ID: ${dataset.companyId}`);
      console.log(`Created: ${dataset.createdAt}`);
      console.log(`Updated: ${dataset.updatedAt}`);
      console.log(`Description: ${dataset.description || 'N/A'}`);
      
      // Check for webhook fields
      if (dataset.webhookId) {
        console.log(`Webhook ID: ${dataset.webhookId}`);
        console.log(`Webhook Secret: ${dataset.webhookSecret ? '******' : 'N/A'}`);
      }
    });

    // For each dataset, get the record count
    console.log('\n\nQuerying record counts for each dataset...');
    for (const dataset of datasets) {
      const count = await prisma.dataRecord.count({
        where: {
          datasetId: dataset.id
        }
      });
      console.log(`Dataset "${dataset.name}" (${dataset.id}) has ${count} records`);
    }

    // Get the most recent records
    console.log('\n\nQuerying most recent records...');
    const recentRecords = await prisma.dataRecord.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        dataset: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`Found ${recentRecords.length} recent records:`);
    recentRecords.forEach(record => {
      console.log(`\nRecord ID: ${record.id}`);
      console.log(`Dataset: ${record.dataset.name}`);
      console.log(`Dataset ID: ${record.datasetId}`);
      console.log(`Created: ${record.createdAt}`);
      console.log(`Data: ${JSON.stringify(record.data, null, 2)}`);
      console.log(`Metadata: ${JSON.stringify(record.metadata || {}, null, 2)}`);
    });

  } catch (error) {
    console.error('Error querying datasets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryDatasets()
  .then(() => console.log('Query completed'))
  .catch(error => console.error('Error running script:', error));
