const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedUsers = users.map(user => ({
      ...user,
      roles: user.roles.map(ur => ur.role)
    }));

    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };
    
    res.json(transformedUser);
  } catch (error) {
    next(error);
  }
});

// Create new user
router.post('/create', async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      title,
      department,
      jobTitle,
      roles,
      status = 'Active'
    } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        password, // In a real app, this should be hashed
        firstName,
        lastName,
        title,
        department,
        jobTitle,
        status,
        roles: {
          create: roles.map(role => ({
            role: {
              connect: { id: role.id }
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

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    next(error);
  }
});

// Invite user
router.post('/invite', async (req, res, next) => {
  try {
    const { email, roleId, department, jobTitle } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        firstName: '', // Required field, set empty for now
        lastName: '', // Required field, set empty for now
        status: 'Pending',
        department,
        jobTitle,
        roles: {
          create: [{
            role: {
              connect: { id: roleId }
            },
            assignedAt: new Date()
          }]
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

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };

    // In a real app, send invitation email here

    res.status(201).json(transformedUser);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      title,
      department,
      jobTitle,
      roles,
      status
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete existing roles
    await prisma.userRole.deleteMany({
      where: { userId: req.params.id }
    });

    // Update user
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email,
        firstName,
        lastName,
        title,
        department,
        jobTitle,
        status,
        roles: {
          create: roles.map(role => ({
            role: {
              connect: { id: role.id }
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

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };

    res.json(transformedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user roles first
    await prisma.userRole.deleteMany({
      where: { userId: req.params.id }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Resend invite
router.post('/:id/resend-invite', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'Pending') {
      return res.status(400).json({ error: 'User is not in pending state' });
    }

    // In a real app, resend invitation email here

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Suspend user
router.post('/:id/suspend', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'Suspended' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };

    res.json(transformedUser);
  } catch (error) {
    next(error);
  }
});

// Activate user
router.post('/:id/activate', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'Active' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Transform the response to match the expected format
    const transformedUser = {
      ...user,
      roles: user.roles.map(ur => ur.role)
    };

    res.json(transformedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
