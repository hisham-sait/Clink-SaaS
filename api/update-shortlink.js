// Script to update the originalUrl of a shortlink
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateShortlinkUrl() {
  try {
    // Find the shortlink by shortCode
    const shortlink = await prisma.link.findUnique({
      where: { shortCode: 'WMsCoX' }
    });

    if (!shortlink) {
      console.error('Shortlink with code WMsCoX not found');
      return;
    }

    console.log('Current shortlink details:');
    console.log(`ID: ${shortlink.id}`);
    console.log(`Original URL: ${shortlink.originalUrl}`);
    console.log(`Short Code: ${shortlink.shortCode}`);
    console.log(`Status: ${shortlink.status}`);

    // Update the shortlink to redirect to Google with trailing slash
    const updatedShortlink = await prisma.link.update({
      where: { id: shortlink.id },
      data: { originalUrl: 'https://google.com/' }
    });

    console.log('\nShortlink updated successfully:');
    console.log(`ID: ${updatedShortlink.id}`);
    console.log(`Original URL: ${updatedShortlink.originalUrl}`);
    console.log(`Short Code: ${updatedShortlink.shortCode}`);
    console.log(`Status: ${updatedShortlink.status}`);

  } catch (error) {
    console.error('Error updating shortlink:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateShortlinkUrl()
  .then(() => console.log('Update completed'))
  .catch(error => console.error('Update failed:', error));
