const { PrismaClient, UserStatus, RoleScope, AccessLevel } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAuth(inputPlans) {
  console.log('Received plans in auth seed:', inputPlans);
  
  if (!inputPlans || !Array.isArray(inputPlans) || inputPlans.length === 0) {
    throw new Error('Plans array is required and must not be empty');
  }

  // Store the plan data before cleanup
  const planData = inputPlans.map(plan => ({
    name: plan.name,
    description: plan.description,
    price: plan.price,
    billingCycle: plan.billingCycle,
    features: plan.features,
    maxUsers: plan.maxUsers,
    maxCompanies: plan.maxCompanies,
    status: plan.status,
    isCustom: plan.isCustom,
    metadata: plan.metadata
  }));

  console.log('Plans array validation passed');

  try {
    // First, delete all existing data in correct order due to foreign key constraints
    console.log('Cleaning up existing data...');
    
    // Delete CRM models first
    await prisma.deal.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.pipeline.deleteMany();
    await prisma.automation.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.client.deleteMany();
    await prisma.organisation.deleteMany();

    await prisma.activity.deleteMany();

    // Delete billing related models
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.billingDetails.deleteMany();

    // Delete company related models
    await prisma.primaryContact.deleteMany();
    await prisma.userCompany.deleteMany();
    
    // Delete proposal related models
    await prisma.proposal.deleteMany();
    
    // Delete product related models
    await prisma.productTier.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productAttributeValue.deleteMany();
    await prisma.productFamilyAttribute.deleteMany();
    await prisma.productAttributeGroup.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.productFamily.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productSection.deleteMany();
    await prisma.productActivity.deleteMany();
    
    // Delete engage related models
    await prisma.pageView.deleteMany();
    await prisma.page.deleteMany();
    await prisma.pageCategory.deleteMany();
    
    await prisma.formSubmission.deleteMany();
    await prisma.formView.deleteMany();
    await prisma.form.deleteMany();
    await prisma.formCategory.deleteMany();
    
    await prisma.surveyResponse.deleteMany();
    await prisma.surveyView.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.surveyCategory.deleteMany();
    
    await prisma.linkAnalytics.deleteMany();
    await prisma.link.deleteMany();
    await prisma.digitalLinkEvent.deleteMany();
    await prisma.digitalLinkActivity.deleteMany();
    await prisma.digitalLink.deleteMany();
    await prisma.linkCategory.deleteMany();
    
    await prisma.company.deleteMany();

    // Delete user related models
    await prisma.notification.deleteMany();
    await prisma.securitySettings.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();

    // Delete plan related models last
    await prisma.plan.deleteMany();

    console.log('Existing data cleaned up');

    // Create plans first
    console.log('Creating plans...');
    const plans = [];
    for (const plan of planData) {
      const createdPlan = await prisma.plan.create({
        data: plan
      });
      plans.push(createdPlan);
    }
    console.log('Plans created');

    // Create permissions
    console.log('Creating permissions...');
    const permissions = [
      // User permissions
      { name: 'View Users', code: 'users-view', description: 'View users', module: 'users', accessLevel: AccessLevel.Read },
      { name: 'Create Users', code: 'users-create', description: 'Create users', module: 'users', accessLevel: AccessLevel.Write },
      { name: 'Edit Users', code: 'users-edit', description: 'Edit users', module: 'users', accessLevel: AccessLevel.Write },
      { name: 'Delete Users', code: 'users-delete', description: 'Delete users', module: 'users', accessLevel: AccessLevel.Admin },

      // Role permissions
      { name: 'View Roles', code: 'roles-view', description: 'View roles', module: 'roles', accessLevel: AccessLevel.Read },
      { name: 'Create Roles', code: 'roles-create', description: 'Create roles', module: 'roles', accessLevel: AccessLevel.Write },
      { name: 'Edit Roles', code: 'roles-edit', description: 'Edit roles', module: 'roles', accessLevel: AccessLevel.Write },
      { name: 'Delete Roles', code: 'roles-delete', description: 'Delete roles', module: 'roles', accessLevel: AccessLevel.Admin },

      // Company permissions
      { name: 'View Companies', code: 'companies-view', description: 'View companies', module: 'companies', accessLevel: AccessLevel.Read },
      { name: 'Create Companies', code: 'companies-create', description: 'Create companies', module: 'companies', accessLevel: AccessLevel.Write },
      { name: 'Edit Companies', code: 'companies-edit', description: 'Edit companies', module: 'companies', accessLevel: AccessLevel.Write },
      { name: 'Delete Companies', code: 'companies-delete', description: 'Delete companies', module: 'companies', accessLevel: AccessLevel.Admin },

      // Plan permissions
      { name: 'View Plans', code: 'plans-view', description: 'View plans', module: 'plans', accessLevel: AccessLevel.Read },
      { name: 'Create Plans', code: 'plans-create', description: 'Create plans', module: 'plans', accessLevel: AccessLevel.Write },
      { name: 'Edit Plans', code: 'plans-edit', description: 'Edit plans', module: 'plans', accessLevel: AccessLevel.Write },
      { name: 'Delete Plans', code: 'plans-delete', description: 'Delete plans', module: 'plans', accessLevel: AccessLevel.Admin },
      { name: 'Admin Plans', code: 'plans-admin', description: 'Full plan administration', module: 'plans', accessLevel: AccessLevel.Admin },

      // Billing permissions
      { name: 'View Billing', code: 'billing-view', description: 'View billing information', module: 'billing', accessLevel: AccessLevel.Read },
      { name: 'Manage Billing', code: 'billing-manage', description: 'Manage billing', module: 'billing', accessLevel: AccessLevel.Write },
      { name: 'Admin Billing', code: 'billing-admin', description: 'Full billing administration', module: 'billing', accessLevel: AccessLevel.Admin },

      // Settings permissions
      { name: 'View Settings', code: 'settings-view', description: 'View settings', module: 'settings', accessLevel: AccessLevel.Read },
      { name: 'Edit Settings', code: 'settings-edit', description: 'Edit settings', module: 'settings', accessLevel: AccessLevel.Write },
      { name: 'Admin Settings', code: 'settings-admin', description: 'Full settings administration', module: 'settings', accessLevel: AccessLevel.Admin }
    ];

    const createdPermissions = {};
    for (const permission of permissions) {
      const created = await prisma.permission.create({
        data: permission
      });
      createdPermissions[permission.code] = created;
    }

    // Create roles with proper hierarchy and link permissions
    const roles = [
      // Platform Level
      {
        name: 'Super Admin',
        description: 'Full platform access with all permissions',
        scope: RoleScope.System,
        isSystem: true,
        isCustom: false,
        metadata: {
          canManage: [
            'Platform Admin',
            'Company Admin',
            'Company Manager',
            'Viewer',
            'Consultant'
          ]
        },
        permissions: {
          create: Object.values(createdPermissions).map(p => ({
            permissionId: p.id,
            assignedAt: new Date()
          }))
        }
      },
      {
        name: 'Platform Admin',
        description: 'Platform administration',
        scope: RoleScope.System,
        isSystem: true,
        isCustom: false,
        metadata: {
          canManage: [
            'Company Admin',
            'Company Manager',
            'Viewer',
            'Consultant'
          ]
        },
        permissions: {
          create: [
            'users-view', 'users-create', 'users-edit', 'users-delete',
            'roles-view', 'roles-create', 'roles-edit', 'roles-delete',
            'companies-view', 'companies-create', 'companies-edit', 'companies-delete',
            'plans-view', 'plans-create', 'plans-edit', 'plans-delete', 'plans-admin',
            'billing-view', 'billing-manage', 'billing-admin',
            'settings-view', 'settings-edit'
          ].map(code => ({
            permissionId: createdPermissions[code].id,
            assignedAt: new Date()
          }))
        }
      },
      
      // Company Level
      {
        name: 'Company Admin',
        description: 'Company administration',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false,
        metadata: {
          canManage: [
            'Company Manager',
            'Viewer',
            'Consultant'
          ]
        },
        permissions: {
          create: [
            'users-view', 'users-create', 'users-edit',
            'companies-view', 'companies-edit',
            'plans-view',
            'billing-view', 'billing-manage',
            'settings-view', 'settings-edit'
          ].map(code => ({
            permissionId: createdPermissions[code].id,
            assignedAt: new Date()
          }))
        }
      },
      {
        name: 'Company Manager',
        description: 'Company management',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false,
        permissions: {
          create: [
            'users-view', 'users-create',
            'companies-view',
            'plans-view',
            'billing-view',
            'settings-view'
          ].map(code => ({
            permissionId: createdPermissions[code].id,
            assignedAt: new Date()
          }))
        }
      },
      {
        name: 'Viewer',
        description: 'Read-only access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false,
        permissions: {
          create: [
            'companies-view',
            'plans-view',
            'settings-view'
          ].map(code => ({
            permissionId: createdPermissions[code].id,
            assignedAt: new Date()
          }))
        }
      },
      {
        name: 'Consultant',
        description: 'External consultant access',
        scope: RoleScope.Company,
        isSystem: true,
        isCustom: false,
        permissions: {
          create: [
            'companies-view',
            'plans-view',
            'settings-view'
          ].map(code => ({
            permissionId: createdPermissions[code].id,
            assignedAt: new Date()
          }))
        }
      }
    ];

    console.log('Creating roles with permissions...');
    const createdRoles = {};
    for (const role of roles) {
      const created = await prisma.role.create({
        data: role,
        include: {
          permissions: true
        }
      });
      createdRoles[role.name] = created;
    }

    // Create super admin user first
    console.log('Creating super admin user...');
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@clink.com',
        password: await bcrypt.hash('superadmin123', 10),
        firstName: 'Super',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Super Admin'].id, assignedAt: new Date() }]
        }
      }
    });

    // Create test company for billing
    console.log('Creating test company...');
    const company = await prisma.company.create({
      data: {
        name: 'Clink SaaS Ltd',
        legalName: 'Clink SaaS Limited',
        registrationNumber: 'CL123456',
        vatNumber: 'GB123456789',
        status: 'Active',
        isPrimary: true,
        isMyOrg: true,
        createdById: superAdmin.id,
        billingDetails: {
          create: {
            address: '123 Tech Street',
            city: 'London',
            state: 'London',
            country: 'United Kingdom',
            postalCode: 'SW1A 1AA',
            taxId: 'GB123456789',
            currency: 'GBP',
            paymentTerms: 30
          }
        }
      }
    });

    // Update super admin with plan and billing company
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        planId: plans[3].id, // Enterprise plan
        billingCompanyId: company.id
      }
    });

    // Create other test users
    const users = [
      // Platform Level
      {
        email: 'platformadmin@clink.com',
        password: await bcrypt.hash('platformadmin123', 10),
        firstName: 'Platform',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Platform Admin'].id, assignedAt: new Date() }]
        },
        planId: plans[2].id, // Professional plan
        billingCompanyId: company.id
      },
      
      // Company Level
      {
        email: 'companyadmin@clink.com',
        password: await bcrypt.hash('companyadmin123', 10),
        firstName: 'Company',
        lastName: 'Admin',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Company Admin'].id, assignedAt: new Date() }]
        },
        planId: plans[2].id, // Professional plan
        billingCompanyId: company.id
      },
      {
        email: 'manager@clink.com',
        password: await bcrypt.hash('manager123', 10),
        firstName: 'Company',
        lastName: 'Manager',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Company Manager'].id, assignedAt: new Date() }]
        },
        planId: plans[1].id, // Starter plan
        billingCompanyId: company.id
      },
      {
        email: 'viewer@clink.com',
        password: await bcrypt.hash('viewer123', 10),
        firstName: 'Company',
        lastName: 'Viewer',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Viewer'].id, assignedAt: new Date() }]
        },
        planId: plans[0].id, // Free plan
        billingCompanyId: company.id
      },
      {
        email: 'consultant@clink.com',
        password: await bcrypt.hash('consultant123', 10),
        firstName: 'External',
        lastName: 'Consultant',
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{ roleId: createdRoles['Consultant'].id, assignedAt: new Date() }]
        },
        planId: plans[0].id, // Free plan
        billingCompanyId: company.id
      }
    ];

    console.log('Creating users...');
    const createdUsers = [superAdmin];
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData,
        include: {
          roles: true
        }
      });
      createdUsers.push(user);
    }

    // Create user-company relationships
    console.log('Creating user-company relationships...');
    for (const user of createdUsers) {
      // Get user with roles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      await prisma.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: userWithRoles.roles[0].role.name,
          assignedAt: new Date()
        }
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
