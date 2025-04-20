const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get all companies
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let companies;

    const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes('Super Administrator');
    if (isSuperAdmin) {
      // Super admin can access all companies
      companies = await prisma.company.findMany({
        include: {
          userCompanies: true,
          createdBy: true,
          roles: true,
          activities: true,
          primaryContact: true,
          billingDetails: true,
        },
      });
    } else {
      // Regular users can only access companies they created or are assigned to
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { createdById: userId },
            {
              userCompanies: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        },
        include: {
          userCompanies: true,
          createdBy: true,
          roles: true,
          activities: true,
          primaryContact: true,
          billingDetails: true,
        },
      });
    }
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get accessible companies for current user
router.get('/accessible', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let companies;

    const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes('Super Administrator');
    if (isSuperAdmin) {
      // Super admin can access all companies
      companies = await prisma.company.findMany();
    } else {
      // Regular users can only access companies they created or are assigned to
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { createdById: userId },
            {
              userCompanies: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        }
      });
    }

    res.json(companies);
  } catch (error) {
    console.error('Error fetching accessible companies:', error);
    res.status(500).json({ error: 'Failed to fetch accessible companies' });
  }
});

// Get company by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    const companyId = req.params.id;

    console.log('GET company by ID - Request params:', {
      companyId,
      userId,
      userRoles
    });

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // First, check if the company exists
    const companyExists = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!companyExists) {
      console.log(`Company with ID ${companyId} not found`);
      return res.status(404).json({ error: 'Company not found' });
    }

    // For Super Administrators, allow access to any company
    const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes('Super Administrator');
    if (isSuperAdmin) {
      console.log('User is Super Administrator, allowing access to company');
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          userCompanies: true,
          createdBy: true,
          roles: true,
          activities: true,
          primaryContact: true,
          billingDetails: true,
        },
      });
      return res.json(company);
    }

    // For regular users, check if they have access to the company
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        OR: [
          { createdById: userId },
          {
            userCompanies: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        userCompanies: true,
        createdBy: true,
        roles: true,
        activities: true,
        primaryContact: true,
        billingDetails: true,
      },
    });

    if (!company) {
      console.log(`User ${userId} does not have access to company ${companyId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ 
      error: 'Failed to fetch company',
      details: error.message
    });
  }
});

// Create company
router.post('/create', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      name,
      legalName,
      registrationNumber,
      vatNumber,
      email,
      phone,
      website,
      address,
      industry,
      size,
      type,
      fiscalYearEnd,
      currency,
      notes,
      isPrimary,
      isMyOrg,
      tags = []
    } = req.body;

    const company = await prisma.company.create({
      data: {
        name,
        legalName,
        registrationNumber,
        vatNumber,
        email,
        phone,
        website,
        address: typeof address === 'string' ? address : JSON.stringify(address),
        industry,
        size,
        type,
        fiscalYearEnd,
        currency,
        notes,
        isPrimary: isPrimary || false,
        isMyOrg: isMyOrg || false,
        tags,
        status: 'Active',
        createdById: userId,
        userCompanies: {
          create: {
            userId: userId,
            role: 'Owner'
          }
        }
      },
      include: {
        userCompanies: true,
        createdBy: true,
        roles: true,
        activities: true,
        primaryContact: true,
        billingDetails: true,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the company
    const hasAccess = await prisma.company.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { createdById: userId },
          {
            userCompanies: {
              some: {
                userId: userId
              }
            }
          }
        ]
      }
    });

    const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes('Super Administrator');
    if (!hasAccess && !isSuperAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { 
      name,
      legalName,
      registrationNumber,
      vatNumber,
      email,
      phone,
      website,
      address,
      industry,
      size,
      type,
      fiscalYearEnd,
      currency,
      notes,
      isPrimary,
      isMyOrg,
      tags,
      status
    } = req.body;

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        name,
        legalName,
        registrationNumber,
        vatNumber,
        email,
        phone,
        website,
        address: typeof address === 'string' ? address : JSON.stringify(address),
        industry,
        size,
        type,
        fiscalYearEnd,
        currency,
        notes,
        isPrimary,
        isMyOrg,
        tags,
        status
      },
      include: {
        userCompanies: true,
        createdBy: true,
        roles: true,
        activities: true,
        primaryContact: true,
        billingDetails: true,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the company
    const hasAccess = await prisma.company.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { createdById: userId },
          {
            userCompanies: {
              some: {
                userId: userId,
                role: 'Owner'
              }
            }
          }
        ]
      }
    });

    const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes('Super Administrator');
    if (!hasAccess && !isSuperAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.company.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Set primary organization
router.post('/:id/set-primary', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        isPrimary: true,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error setting primary organization:', error);
    res.status(500).json({ error: 'Failed to set primary organization' });
  }
});

// Set my organization
router.post('/:id/set-my-org', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        isMyOrg: true,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error setting my organization:', error);
    res.status(500).json({ error: 'Failed to set my organization' });
  }
});

// Add tag
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        tags: {
          push: req.body.tag,
        },
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Remove tag
router.delete('/:id/tags/:tag', auth, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
    });
    const updatedTags = company.tags.filter(tag => tag !== req.params.tag);
    const updatedCompany = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        tags: updatedTags,
      },
    });
    res.json(updatedCompany);
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Archive company
router.post('/:id/archive', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        status: 'Archived',
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error archiving company:', error);
    res.status(500).json({ error: 'Failed to archive company' });
  }
});

// Activate company
router.post('/:id/activate', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        status: 'Active',
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error activating company:', error);
    res.status(500).json({ error: 'Failed to activate company' });
  }
});

// Upload logo
router.post('/:id/logo', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        logo: req.body.logo,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Get primary contact
router.get('/:id/primary-contact', auth, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        primaryContact: true,
      },
    });
    if (!company || !company.primaryContact) {
      return res.status(404).json({ error: 'Primary contact not found' });
    }
    res.json(company.primaryContact);
  } catch (error) {
    console.error('Error fetching primary contact:', error);
    res.status(500).json({ error: 'Failed to fetch primary contact' });
  }
});

// Update primary contact
router.put('/:id/primary-contact', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        primaryContact: {
          upsert: {
            create: req.body,
            update: req.body,
          },
        },
      },
      include: {
        primaryContact: true,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error updating primary contact:', error);
    res.status(500).json({ error: 'Failed to update primary contact' });
  }
});

module.exports = router;
