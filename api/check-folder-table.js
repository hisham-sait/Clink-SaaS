const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFolderTable() {
  try {
    const result = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Folder') as exists`;
    console.log('Folder table exists:', result[0].exists);
    
    // Try to count folders
    try {
      const count = await prisma.folder.count();
      console.log('Number of folders:', count);
    } catch (e) {
      console.error('Error counting folders:', e);
    }
  } catch (e) {
    console.error('Error checking Folder table:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkFolderTable();
