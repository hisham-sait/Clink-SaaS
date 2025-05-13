const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Check if the user exists by email
    const email = 'hisham@seegap.com';
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        userCompanies: {
          select: {
            companyId: true,
            role: true
          }
        },
        billingCompany: true
      }
    });

    if (user) {
      console.log('User found:');
      console.log({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: user.roles.map(r => r.role.name),
        companies: user.userCompanies.map(uc => ({
          companyId: uc.companyId,
          role: uc.role
        })),
        billingCompanyId: user.billingCompanyId
      });
    } else {
      console.log(`User with email ${email} not found.`);
    }

    // Check if there are any users in the database
    const usersCount = await prisma.user.count();
    console.log(`Total users in database: ${usersCount}`);

    if (usersCount > 0) {
      console.log('\nSample users:');
      const users = await prisma.user.findMany({
        take: 5, // Limit to 5 users to avoid too much output
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true
        }
      });
      console.log(users);
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
