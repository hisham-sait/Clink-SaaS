const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all permissions
router.get('/permissions', async (req, res, next) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
});

// Get all roles
router.get('/', async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.user),
      userCount: role.users.length
    }));

    res.json(transformedRoles);
  } catch (error) {
    next(error);
  }
});

// Get role by ID
router.get('/:id', async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Transform the response to match the expected format
    const transformedRole = {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.user),
      userCount: role.users.length
    };
    
    res.json(transformedRole);
  } catch (error) {
    next(error);
  }
});

// Create new role
router.post('/create', async (req, res, next) => {
  try {
    const {
      name,
      description,
      scope,
      permissions,
      status = 'Active',
      isCustom = true,
      isSystem = false,
      metadata
    } = req.body;

    const role = await prisma.role.create({
      data: {
        name,
        description,
        scope,
        status,
        isCustom,
        isSystem,
        metadata,
        permissions: {
          create: permissions.map(p => ({
            permission: {
              connect: { id: p.id }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedRole = {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.user),
      userCount: role.users.length
    };

    res.status(201).json(transformedRole);
  } catch (error) {
    next(error);
  }
});

// Update role
router.put('/:id', async (req, res, next) => {
  try {
    const {
      name,
      description,
      scope,
      permissions,
      status,
      isCustom,
      metadata
    } = req.body;

    // Check if role exists and is not a system role
    const existingRole = await prisma.role.findUnique({
      where: { id: req.params.id }
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (existingRole.isSystem) {
      return res.status(403).json({ error: 'System roles cannot be modified' });
    }

    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: req.params.id }
    });

    // Update role
    const role = await prisma.role.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        scope,
        status,
        isCustom,
        metadata,
        permissions: {
          create: permissions.map(p => ({
            permission: {
              connect: { id: p.id }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedRole = {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.user),
      userCount: role.users.length
    };

    res.json(transformedRole);
  } catch (error) {
    next(error);
  }
});

// Delete role
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if role exists and is not a system role
    const role = await prisma.role.findUnique({
      where: { id: req.params.id }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ error: 'System roles cannot be deleted' });
    }

    // Check if role is assigned to any users
    const usersWithRole = await prisma.userRole.count({
      where: { roleId: req.params.id }
    });

    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users' 
      });
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: req.params.id }
    });

    // Delete the role
    await prisma.role.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get role usage statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const roleId = req.params.id;

    // Get total users count
    const totalUsers = await prisma.userRole.count({
      where: { roleId }
    });

    // Get active users count
    const activeUsers = await prisma.userRole.count({
      where: {
        roleId,
        user: {
          status: 'Active'
        }
      }
    });

    // Get last assigned date
    const lastAssignment = await prisma.userRole.findFirst({
      where: { roleId },
      orderBy: {
        assignedAt: 'desc'
      },
      select: {
        assignedAt: true
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      lastAssigned: lastAssignment?.assignedAt
    });
  } catch (error) {
    next(error);
  }
});

// Assign role to user
router.post('/assign', async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;

    await prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedAt: new Date()
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Remove role from user
router.delete('/assign/:userId/:roleId', async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Validate role permissions
router.post('/:id/validate', async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const roleId = req.params.id;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const rolePermissions = role.permissions.map(rp => rp.permission.code);
    const hasAllPermissions = permissions.every(p => rolePermissions.includes(p));

    res.json(hasAllPermissions);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
