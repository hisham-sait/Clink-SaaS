const { PrismaClient } = require('@prisma/client');
const createSettingsData = require('./seeds/settings');
const createStatutoryData = require('./seeds/statutory');
const seedAuth = require('./seeds/auth');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  try {
    // Create auth data first (users and roles)
    console.log('Creating auth data...');
    await seedAuth();
    console.log('✓ Auth data created');
    
    // Create settings data
    console.log('Creating settings data...');
    const settingsData = await createSettingsData();
    console.log('✓ Settings data created');
    
    // Create statutory data
    console.log('Creating statutory data...');
    const statutoryData = await createStatutoryData();
    console.log('✓ Statutory data created');
    
    console.log('Seed completed successfully');
    
    return {
      settings: settingsData,
      statutory: statutoryData
    };
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error creating seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
