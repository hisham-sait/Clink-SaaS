const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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
      status = 'Active',
      companyId // Added companyId parameter
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find a company to associate with if not provided
    let userCompanyId = companyId;
    if (!userCompanyId) {
      // Try to find the first available company
      const companies = await prisma.company.findMany({
        take: 1,
        select: { id: true }
      });
      
      if (companies.length > 0) {
        userCompanyId = companies[0].id;
      }
    }

    // Create the user with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Store hashed password
        firstName,
        lastName,
        title,
        department,
        jobTitle,
        status,
        billingCompanyId: userCompanyId, // Set billing company
        roles: {
          create: roles.map(role => ({
            role: {
              connect: { id: role.id }
            },
            assignedAt: new Date()
          }))
        },
        // Associate user with company if company ID is available
        ...(userCompanyId ? {
          userCompanies: {
            create: [{
              companyId: userCompanyId,
              role: 'Company Admin' // Default role
            }]
          }
        } : {})
      },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        userCompanies: true
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
    const { email, roleId, department, jobTitle, companyId } = req.body;

    // Find a company to associate with if not provided
    let userCompanyId = companyId;
    if (!userCompanyId) {
      // Try to find the first available company
      const companies = await prisma.company.findMany({
        take: 1,
        select: { id: true }
      });
      
      if (companies.length > 0) {
        userCompanyId = companies[0].id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        firstName: '', // Required field, set empty for now
        lastName: '', // Required field, set empty for now
        status: 'Pending',
        department,
        jobTitle,
        billingCompanyId: userCompanyId, // Set billing company
        roles: {
          create: [{
            role: {
              connect: { id: roleId }
            },
            assignedAt: new Date()
          }]
        },
        // Associate user with company if company ID is available
        ...(userCompanyId ? {
          userCompanies: {
            create: [{
              companyId: userCompanyId,
              role: 'Company Admin' // Default role
            }]
          }
        } : {})
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
      status,
      password, // Added password parameter for updates
      companyId // Added companyId parameter
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

    // Prepare update data
    const updateData = {
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
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update billing company if provided
    if (companyId) {
      updateData.billingCompanyId = companyId;
      
      // Check if user is already associated with this company
      const existingUserCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: req.params.id,
            companyId
          }
        }
      });
      
      // If not associated, create the association
      if (!existingUserCompany) {
        await prisma.userCompany.create({
          data: {
            userId: req.params.id,
            companyId,
            role: 'Company Admin' // Default role
          }
        });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
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

    // Delete user company associations
    await prisma.userCompany.deleteMany({
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
