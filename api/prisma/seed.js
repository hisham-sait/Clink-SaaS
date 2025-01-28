const { PrismaClient } = require('@prisma/client');
const createSettingsData = require('./seeds/settings');
const createStatutoryData = require('./seeds/statutory');
const seedAuth = require('./seeds/auth');
const seedPlans = require('./seeds/plans');
const { seedBilling } = require('./seeds/billing');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  try {
    // Create plans data first
    console.log('Creating plans data...');
    const plans = await seedPlans();
    console.log('Created plans:', plans);
    console.log('✓ Plans data created');
    
    // Create auth data (users and roles)
    console.log('Creating auth data...');
    await seedAuth(plans);
    console.log('✓ Auth data created');
    
    // Create settings data (including companies)
    console.log('Creating settings data...');
    const settingsData = await createSettingsData();
    console.log('✓ Settings data created');

    // Create billing data (after companies are created)
    console.log('Creating billing data...');
    await seedBilling();
    console.log('✓ Billing data created');
    
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
