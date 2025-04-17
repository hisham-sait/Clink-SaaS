// Script to query the shortlink with code WMsCoX from the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function queryShortlink() {
  try {
    // Find the shortlink by shortCode
    const shortlink = await prisma.link.findUnique({
      where: { shortCode: 'WMsCoX' }
    });

    if (!shortlink) {
      console.error('Shortlink with code WMsCoX not found');
      return;
    }

    console.log('Shortlink details:');
    console.log(`ID: ${shortlink.id}`);
    console.log(`Original URL: ${shortlink.originalUrl}`);
    console.log(`Short Code: ${shortlink.shortCode}`);
    console.log(`Status: ${shortlink.status}`);
    console.log(`Created At: ${shortlink.createdAt}`);
    console.log(`Updated At: ${shortlink.updatedAt}`);

  } catch (error) {
    console.error('Error querying shortlink:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryShortlink()
  .then(() => console.log('Query completed'))
  .catch(error => console.error('Query failed:', error));
