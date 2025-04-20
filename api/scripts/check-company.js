const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompany() {
  try {
    // Check if the company exists
    const companyId = 'cm9lkm41s00036coz6mpzfl48';
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (company) {
      console.log('Company found:', company);
    } else {
      console.log(`Company with ID ${companyId} not found.`);
    }

    // Check if there are any companies in the database
    const companiesCount = await prisma.company.count();
    console.log(`Total companies in database: ${companiesCount}`);

    if (companiesCount > 0) {
      const companies = await prisma.company.findMany({
        take: 5 // Limit to 5 companies to avoid too much output
      });
      console.log('Sample companies:', companies);
    }
  } catch (error) {
    console.error('Error checking company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompany();
