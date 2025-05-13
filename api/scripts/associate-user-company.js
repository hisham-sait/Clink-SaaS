const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function associateUserWithCompany() {
  try {
    // Email of the user to associate with a company
    const email = 'hisham@seegap.com';
    
    // First, check if there are any companies in the database
    const companies = await prisma.company.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        legalName: true,
        status: true
      }
    });
    
    if (companies.length === 0) {
      console.log('No companies found in the database. Creating a new company...');
      
      // Create a new company
      const newCompany = await prisma.company.create({
        data: {
          name: 'SeeGap',
          legalName: 'SeeGap Ltd',
          registrationNumber: 'SG12345',
          vatNumber: 'SG-VAT-12345',
          status: 'Active',
          isPrimary: true,
          isMyOrg: true,
          createdById: '9f651dcd-a60b-4b19-a170-a1e0a3f35651', // Using the user's ID we found earlier
          billingDetails: {
            create: {
              address: '123 SeeGap Street',
              city: 'SeeGap City',
              state: 'SeeGap State',
              country: 'Ireland',
              postalCode: 'SG12345',
              taxId: 'SG-TAX-12345',
              currency: 'EUR',
              paymentTerms: 30
            }
          }
        }
      });
      
      console.log('New company created:', newCompany);
      
      // Associate the user with the new company
      const userCompany = await prisma.userCompany.create({
        data: {
          userId: '9f651dcd-a60b-4b19-a170-a1e0a3f35651', // Using the user's ID we found earlier
          companyId: newCompany.id,
          role: 'Company Admin'
        }
      });
      
      console.log('User associated with new company:', userCompany);
      
      // Set the company as the user's billing company
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { billingCompanyId: newCompany.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          billingCompanyId: true
        }
      });
      
      console.log('User updated with billing company:', updatedUser);
    } else {
      console.log('Companies found in the database:', companies);
      
      // Use the first company
      const company = companies[0];
      
      // Check if the user is already associated with this company
      const existingUserCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: '9f651dcd-a60b-4b19-a170-a1e0a3f35651', // Using the user's ID we found earlier
            companyId: company.id
          }
        }
      });
      
      if (existingUserCompany) {
        console.log('User is already associated with this company:', existingUserCompany);
      } else {
        // Associate the user with the company
        const userCompany = await prisma.userCompany.create({
          data: {
            userId: '9f651dcd-a60b-4b19-a170-a1e0a3f35651', // Using the user's ID we found earlier
            companyId: company.id,
            role: 'Company Admin'
          }
        });
        
        console.log('User associated with existing company:', userCompany);
      }
      
      // Set the company as the user's billing company
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { billingCompanyId: company.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          billingCompanyId: true
        }
      });
      
      console.log('User updated with billing company:', updatedUser);
    }
    
  } catch (error) {
    console.error('Error associating user with company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

associateUserWithCompany();
