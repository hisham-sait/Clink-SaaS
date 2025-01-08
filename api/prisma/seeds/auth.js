const { PrismaClient, UserStatus, RoleScope } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAuth() {
  try {
    // First, delete all existing users and roles
    console.log('Cleaning up existing data...');
    
    // Delete in correct order due to foreign key constraints
    await prisma.userRole.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();

    console.log('Existing data cleaned up');

    // Create roles
    const roles = [
      // Platform Level
      {
        name: 'Super Admin',
        description: 'Full platform access',
        scope: RoleScope.Global,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Platform Admin',
        description: 'Platform administration',
        scope: RoleScope.Global,
        isSystem: true,
        isCustom: false
      },
      
      // Company Level
      {
        name: 'Company Admin',
        description: 'Company administration',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Company Manager',
        description: 'Company management',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Accountant',
        description: 'Financial access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Viewer',
        description: 'Read-only access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },

      // Third Party Level
      {
        name: 'Auditor',
        description: 'External auditor access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Tax Advisor',
        description: 'External tax advisor access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Legal Advisor',
        description: 'External legal advisor access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      },
      {
        name: 'Consultant',
        description: 'External consultant access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false
      }
    ];

    console.log('Creating roles...');
    for (const role of roles) {
      await prisma.role.create({
        data: role
      });
    }

    // Get role IDs
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
    const platformAdminRole = await prisma.role.findUnique({ where: { name: 'Platform Admin' } });
    const companyAdminRole = await prisma.role.findUnique({ where: { name: 'Company Admin' } });
    const managerRole = await prisma.role.findUnique({ where: { name: 'Company Manager' } });
    const accountantRole = await prisma.role.findUnique({ where: { name: 'Accountant' } });
    const viewerRole = await prisma.role.findUnique({ where: { name: 'Viewer' } });
    const auditorRole = await prisma.role.findUnique({ where: { name: 'Auditor' } });
    const taxAdvisorRole = await prisma.role.findUnique({ where: { name: 'Tax Advisor' } });
    const legalAdvisorRole = await prisma.role.findUnique({ where: { name: 'Legal Advisor' } });
    const consultantRole = await prisma.role.findUnique({ where: { name: 'Consultant' } });

    // Create test users
    const users = [
      // Platform Level
      {
        email: 'superadmin@bradan.com',
        password: await bcrypt.hash('superadmin123', 10),
        firstName: 'Super',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: superAdminRole.id }]
        }
      },
      {
        email: 'platformadmin@bradan.com',
        password: await bcrypt.hash('platformadmin123', 10),
        firstName: 'Platform',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: platformAdminRole.id }]
        }
      },
      
      // Company Level
      {
        email: 'companyadmin@bradan.com',
        password: await bcrypt.hash('companyadmin123', 10),
        firstName: 'Company',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: companyAdminRole.id }]
        }
      },
      {
        email: 'manager@bradan.com',
        password: await bcrypt.hash('manager123', 10),
        firstName: 'Company',
        lastName: 'Manager',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: managerRole.id }]
        }
      },
      {
        email: 'accountant@bradan.com',
        password: await bcrypt.hash('accountant123', 10),
        firstName: 'Company',
        lastName: 'Accountant',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: accountantRole.id }]
        }
      },
      {
        email: 'viewer@bradan.com',
        password: await bcrypt.hash('viewer123', 10),
        firstName: 'Company',
        lastName: 'Viewer',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: viewerRole.id }]
        }
      },

      // Third Party Level
      {
        email: 'auditor@bradan.com',
        password: await bcrypt.hash('auditor123', 10),
        firstName: 'External',
        lastName: 'Auditor',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: auditorRole.id }]
        }
      },
      {
        email: 'taxadvisor@bradan.com',
        password: await bcrypt.hash('taxadvisor123', 10),
        firstName: 'Tax',
        lastName: 'Advisor',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: taxAdvisorRole.id }]
        }
      },
      {
        email: 'legaladvisor@bradan.com',
        password: await bcrypt.hash('legaladvisor123', 10),
        firstName: 'Legal',
        lastName: 'Advisor',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: legalAdvisorRole.id }]
        }
      },
      {
        email: 'consultant@bradan.com',
        password: await bcrypt.hash('consultant123', 10),
        firstName: 'External',
        lastName: 'Consultant',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: consultantRole.id }]
        }
      }
    ];

    console.log('Creating users...');
    for (const userData of users) {
      await prisma.user.create({
        data: userData
      });
    }

    console.log('Auth seed completed successfully');
  } catch (error) {
    console.error('Error seeding auth:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedAuth;
