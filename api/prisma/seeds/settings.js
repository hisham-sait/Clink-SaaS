const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSettingsData() {
  // First, delete all existing data in the correct order
  await prisma.activity.deleteMany({});
  await prisma.actionItem.deleteMany({});
  await prisma.discussion.deleteMany({});
  await prisma.resolution.deleteMany({});
  await prisma.director.deleteMany({});
  await prisma.shareholder.deleteMany({});
  await prisma.share.deleteMany({});
  await prisma.beneficialOwner.deleteMany({});
  await prisma.charge.deleteMany({});
  await prisma.allotment.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.boardMinute.deleteMany({});
  await prisma.primaryContact.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});

  // Create initial permissions
  const permissions = [
    // Users module permissions
    {
      name: 'View Users',
      code: 'users:view',
      description: 'View user list and details',
      module: 'users',
      accessLevel: 'Read'
    },
    {
      name: 'Create Users',
      code: 'users:create',
      description: 'Create new users',
      module: 'users',
      accessLevel: 'Write'
    },
    {
      name: 'Edit Users',
      code: 'users:edit',
      description: 'Edit user details',
      module: 'users',
      accessLevel: 'Write'
    },
    {
      name: 'Delete Users',
      code: 'users:delete',
      description: 'Delete users',
      module: 'users',
      accessLevel: 'Admin'
    },
    // Roles module permissions
    {
      name: 'View Roles',
      code: 'roles:view',
      description: 'View roles and permissions',
      module: 'roles',
      accessLevel: 'Read'
    },
    {
      name: 'Create Roles',
      code: 'roles:create',
      description: 'Create new roles',
      module: 'roles',
      accessLevel: 'Write'
    },
    {
      name: 'Edit Roles',
      code: 'roles:edit',
      description: 'Edit role details and permissions',
      module: 'roles',
      accessLevel: 'Write'
    },
    {
      name: 'Delete Roles',
      code: 'roles:delete',
      description: 'Delete custom roles',
      module: 'roles',
      accessLevel: 'Admin'
    },
    // Companies module permissions
    {
      name: 'View Companies',
      code: 'companies:view',
      description: 'View company list and details',
      module: 'companies',
      accessLevel: 'Read'
    },
    {
      name: 'Create Companies',
      code: 'companies:create',
      description: 'Create new companies',
      module: 'companies',
      accessLevel: 'Write'
    },
    {
      name: 'Edit Companies',
      code: 'companies:edit',
      description: 'Edit company details',
      module: 'companies',
      accessLevel: 'Write'
    },
    {
      name: 'Delete Companies',
      code: 'companies:delete',
      description: 'Delete companies',
      module: 'companies',
      accessLevel: 'Admin'
    },
    // Billing module permissions
    {
      name: 'View Billing',
      code: 'billing:view',
      description: 'View billing and subscription details',
      module: 'billing',
      accessLevel: 'Read'
    },
    {
      name: 'Manage Billing',
      code: 'billing:manage',
      description: 'Manage billing and subscriptions',
      module: 'billing',
      accessLevel: 'Write'
    },
    {
      name: 'Billing Admin',
      code: 'billing:admin',
      description: 'Full billing administration',
      module: 'billing',
      accessLevel: 'Admin'
    },
    // Settings module permissions
    {
      name: 'View Settings',
      code: 'settings:view',
      description: 'View system settings',
      module: 'settings',
      accessLevel: 'Read'
    },
    {
      name: 'Edit Settings',
      code: 'settings:edit',
      description: 'Edit system settings',
      module: 'settings',
      accessLevel: 'Write'
    },
    {
      name: 'Settings Admin',
      code: 'settings:admin',
      description: 'Full settings administration',
      module: 'settings',
      accessLevel: 'Admin'
    }
  ];

  // Create permissions
  const createdPermissions = {};
  for (const permission of permissions) {
    const created = await prisma.permission.create({
      data: permission
    });
    createdPermissions[permission.code] = created;
  }

  // Create system roles
  const roles = [
    {
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      scope: 'Global',
      status: 'Active',
      isCustom: false,
      isSystem: true,
      metadata: {
        maxUsers: null,
        allowedModules: ['*']
      },
      permissions: Object.values(createdPermissions)
    },
    {
      name: 'Administrator',
      description: 'Company-wide administrative access',
      scope: 'Company',
      status: 'Active',
      isCustom: false,
      isSystem: true,
      metadata: {
        maxUsers: null,
        allowedModules: ['users', 'roles', 'companies', 'settings']
      },
      permissions: Object.values(createdPermissions).filter(p => 
        p.accessLevel !== 'Admin' || p.module === 'settings'
      )
    },
    {
      name: 'Billing Administrator',
      description: 'Manage billing, subscriptions, and payments',
      scope: 'Company',
      status: 'Active',
      isCustom: false,
      isSystem: true,
      metadata: {
        maxUsers: null,
        allowedModules: ['billing']
      },
      permissions: Object.values(createdPermissions).filter(p => 
        p.module === 'billing' || (p.module === 'users' && p.accessLevel === 'Read')
      )
    },
    {
      name: 'User Manager',
      description: 'Manage user accounts and permissions',
      scope: 'Company',
      status: 'Active',
      isCustom: false,
      isSystem: true,
      metadata: {
        maxUsers: null,
        allowedModules: ['users']
      },
      permissions: Object.values(createdPermissions).filter(p => 
        p.module === 'users'
      )
    }
  ];

  // Create roles and assign permissions
  const createdRoles = {};
  for (const roleData of roles) {
    const { permissions: rolePermissions, ...role } = roleData;
    const createdRole = await prisma.role.create({
      data: role
    });

    // Assign permissions
    for (const permission of rolePermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: createdRole.id,
          permissionId: permission.id
        }
      });
    }

    createdRoles[role.name] = createdRole;
  }

  // Create initial users
  const users = [
    {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@bradan.com',
      status: 'Active',
      jobTitle: 'System Administrator',
      department: 'IT',
      roles: ['Super Administrator']
    },
    {
      firstName: 'Company',
      lastName: 'Admin',
      email: 'company.admin@bradan.com',
      status: 'Active',
      jobTitle: 'Company Administrator',
      department: 'Administration',
      roles: ['Administrator']
    },
    {
      firstName: 'Billing',
      lastName: 'Manager',
      email: 'billing@bradan.com',
      status: 'Active',
      jobTitle: 'Billing Manager',
      department: 'Finance',
      roles: ['Billing Administrator']
    },
    {
      firstName: 'User',
      lastName: 'Manager',
      email: 'users@bradan.com',
      status: 'Active',
      jobTitle: 'User Manager',
      department: 'HR',
      roles: ['User Manager']
    }
  ];

  // Create users and assign roles
  const createdUsers = [];
  for (const userData of users) {
    const { roles: userRoles, ...user } = userData;

    // Create new user
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        roles: {
          create: userRoles.map(roleName => ({
            role: {
              connect: { id: createdRoles[roleName].id }
            },
            assignedAt: new Date()
          }))
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    createdUsers.push(createdUser);
  }

  // Create initial companies
  const companies = [
    {
      name: 'Bradán Accountants',
      status: 'Active',
      isPrimary: true,
      isMyOrg: true,
      tags: ['Accounting', 'Professional Services']
    },
    {
      name: 'Tech Solutions Ltd',
      status: 'Active',
      isPrimary: false,
      isMyOrg: false,
      tags: ['Technology', 'Software']
    },
    {
      name: 'Green Energy Co',
      status: 'Active',
      isPrimary: false,
      isMyOrg: false,
      tags: ['Energy', 'Renewable']
    }
  ];

  // Create companies
  const createdCompanies = [];
  for (const companyData of companies) {
    // Create new company
    const createdCompany = await prisma.company.create({
      data: companyData
    });

    createdCompanies.push(createdCompany);
  }

  return {
    permissions: Object.values(createdPermissions),
    roles: Object.values(createdRoles),
    users: createdUsers,
    companies: createdCompanies
  };
}

module.exports = createSettingsData;
