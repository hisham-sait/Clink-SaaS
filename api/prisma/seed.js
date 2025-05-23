const { PrismaClient } = require('@prisma/client');
const createSettingsData = require('./seeds/settings');
const seedAuth = require('./seeds/auth');
const seedPlans = require('./seeds/plans');
const { seedBilling } = require('./seeds/billing');
const seedSections = require('./seeds/sections');
const seedFMCGProducts = require('./seeds/fmcg-products');
const seedEngage = require('./seeds/engage');

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
    
    // Create product sections
    console.log('Creating product sections...');
    await seedSections();
    console.log('✓ Product sections created');
    
    // Create FMCG products
    console.log('Creating FMCG products...');
    await seedFMCGProducts();
    console.log('✓ FMCG products created');
    
    // Create engage data (pages, forms, surveys, links)
    console.log('Creating engage data...');
    await seedEngage();
    console.log('✓ Engage data created');
    
    console.log('Seed completed successfully');
    
    return {
      settings: settingsData
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
