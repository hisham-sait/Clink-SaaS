const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Role-based access middleware
const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user is Super Admin first
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: true
      }
    });

    const isSuperAdmin = userRoles.some(ur => ur.role.name === 'Super Admin');
    if (isSuperAdmin) {
      return next();
    }

    // Check specific permission for other roles
    const hasPermission = await prisma.userRole.findFirst({
      where: { 
        userId: user.id,
        role: {
          permissions: {
            some: {
              permission: {
                code: requiredPermission
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all plans
router.get('/', auth, checkPermission('plans-view'), async (req, res) => {
  try {
    // Get all plans with user counts
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    // Map plans to include user count in a cleaner format
    const plansWithCounts = plans.map(plan => ({
      ...plan,
      userCount: plan._count.users
    }));

    // Filter features based on user role if needed
    const userRoles = await prisma.userRole.findMany({
      where: { userId: req.user.id },
      include: {
        role: true
      }
    });

    const isSuperAdmin = userRoles.some(ur => ur.role.name === 'Super Admin');
    const isPlatformAdmin = userRoles.some(ur => ur.role.name === 'Platform Admin');

    // If not admin, filter features based on role permissions
    if (!isSuperAdmin && !isPlatformAdmin) {
      plansWithCounts.forEach(plan => {
        plan.features = plan.features.filter(feature => {
          // Add logic to filter features based on role permissions
          return true; // Default to showing all features
        });
      });
    }

    res.json(plansWithCounts);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get plan by ID
router.get('/:id', auth, checkPermission('plans-view'), async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            billingCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Filter features based on user role if needed
    const userRoles = await prisma.userRole.findMany({
      where: { userId: req.user.id },
      include: {
        role: true
      }
    });

    const isSuperAdmin = userRoles.some(ur => ur.role.name === 'Super Admin');
    const isPlatformAdmin = userRoles.some(ur => ur.role.name === 'Platform Admin');

    if (!isSuperAdmin && !isPlatformAdmin) {
      plan.features = plan.features.filter(feature => {
        // Add logic to filter features based on role permissions
        return true; // Default to showing all features
      });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// Create new plan (Admin only)
router.post('/', auth, checkPermission('plans-admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      billingCycle,
      features,
      maxUsers,
      maxCompanies,
      status,
      isCustom,
      metadata
    } = req.body;

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price,
        billingCycle,
        features,
        maxUsers,
        maxCompanies,
        status,
        isCustom,
        metadata
      }
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Update plan (Admin only)
router.put('/:id', auth, checkPermission('plans-admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      billingCycle,
      features,
      maxUsers,
      maxCompanies,
      status,
      isCustom,
      metadata
    } = req.body;

    const plan = await prisma.plan.update({
      where: {
        id: req.params.id
      },
      data: {
        name,
        description,
        price,
        billingCycle,
        features,
        maxUsers,
        maxCompanies,
        status,
        isCustom,
        metadata
      }
    });

    res.json(plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete plan (Admin only)
router.delete('/:id', auth, checkPermission('plans-admin'), async (req, res) => {
  try {
    await prisma.plan.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Validate plan selection
router.post('/validate', auth, async (req, res) => {
  try {
    const { planId, billingCompanyId } = req.body;

    // Verify plan exists and is active
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!plan) {
      return res.json({ 
        valid: false, 
        message: 'Plan not found' 
      });
    }

    if (plan.status !== 'Active') {
      return res.json({ 
        valid: false, 
        message: 'This plan is no longer available' 
      });
    }

    // Verify billing company exists and user has access to it
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: req.user.id,
        companyId: billingCompanyId
      },
      include: {
        company: {
          select: {
            billingDetails: true
          }
        }
      }
    });

    if (!userCompany) {
      return res.json({ 
        valid: false, 
        message: 'Invalid billing company selection' 
      });
    }

    if (!userCompany.company.billingDetails) {
      return res.json({ 
        valid: false, 
        message: 'Selected company has no billing details configured' 
      });
    }

    // Check user limits if not unlimited
    if (plan.maxUsers !== -1 && plan._count.users >= plan.maxUsers) {
      return res.json({ 
        valid: false, 
        message: 'This plan has reached its maximum number of users' 
      });
    }

    // All validations passed
    res.json({ 
      valid: true,
      message: 'Plan can be selected'
    });
  } catch (error) {
    console.error('Error validating plan selection:', error);
    res.status(500).json({ error: 'Failed to validate plan selection' });
  }
});

// Select plan for user
router.post('/select', auth, async (req, res) => {
  try {
    const { planId, billingCompanyId } = req.body;

    // Verify plan exists and is active
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (plan.status !== 'Active') {
      return res.status(400).json({ error: 'This plan is no longer available' });
    }

    // Verify billing company exists and user has access to it
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: req.user.id,
        companyId: billingCompanyId
      },
      include: {
        company: {
          select: {
            billingDetails: true
          }
        }
      }
    });

    if (!userCompany) {
      return res.status(403).json({ error: 'Invalid billing company selection' });
    }

    if (!userCompany.company.billingDetails) {
      return res.status(400).json({ error: 'Selected company has no billing details configured' });
    }

    // Check user limits if not unlimited
    if (plan.maxUsers !== -1 && plan._count.users >= plan.maxUsers) {
      return res.status(400).json({ error: 'This plan has reached its maximum number of users' });
    }

    // Update user's plan and billing company
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        planId,
        billingCompanyId
      },
      include: {
        plan: true,
        billingCompany: {
          select: {
            id: true,
            name: true,
            billingDetails: true
          }
        }
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error selecting plan:', error);
    res.status(500).json({ error: 'Failed to select plan' });
  }
});

// Get user's current plan
router.get('/user/current', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        plan: true,
        billingCompany: {
          select: {
            id: true,
            name: true,
            billingDetails: true
          }
        }
      }
    });

    if (!user.plan) {
      return res.status(404).json({ error: 'No plan selected' });
    }

    res.json({
      plan: user.plan,
      billingCompany: user.billingCompany
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({ error: 'Failed to fetch user plan' });
  }
});

// Get available billing companies for user
router.get('/billing-companies', auth, async (req, res) => {
  try {
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: req.user.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            billingDetails: true
          }
        }
      }
    });

    const billingCompanies = userCompanies
      .map(uc => uc.company)
      .filter(company => company.billingDetails); // Only include companies with billing details

    res.json(billingCompanies);
  } catch (error) {
    console.error('Error fetching billing companies:', error);
    res.status(500).json({ error: 'Failed to fetch billing companies' });
  }
});

module.exports = router;
