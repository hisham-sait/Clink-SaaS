const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSections() {
  console.log('Seeding product sections...');
  
  try {
    // Get all companies
    const companies = await prisma.company.findMany();
    
    // Default sections to create for each company
    const defaultSections = [
      { 
        name: 'General Information', 
        code: 'general-info', 
        description: 'Basic product information',
        displayIn: 'both',
        order: 1
      },
      { 
        name: 'Technical Specifications', 
        code: 'tech-specs', 
        description: 'Technical details and specifications',
        displayIn: 'right',
        order: 2
      },
      { 
        name: 'Marketing', 
        code: 'marketing', 
        description: 'Marketing information and materials',
        displayIn: 'left',
        order: 3
      }
    ];
    
    // Create sections for each company
    for (const company of companies) {
      console.log(`Creating sections for company: ${company.name}`);
      
      // Check if company already has sections
      const existingSections = await prisma.productSection.findMany({
        where: { companyId: company.id }
      });
      
      if (existingSections.length > 0) {
        console.log(`Company ${company.name} already has sections. Skipping...`);
        continue;
      }
      
      // Create sections for this company
      for (const section of defaultSections) {
        await prisma.productSection.create({
          data: {
            ...section,
            company: {
              connect: { id: company.id }
            }
          }
        });
      }
      
      console.log(`Created ${defaultSections.length} sections for company: ${company.name}`);
    }
    
    console.log('Product sections seeding completed.');
  } catch (error) {
    console.error('Error seeding sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSections()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
