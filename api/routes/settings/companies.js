const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let companies;

    if (userRole === 'Super Administrator') {
      // Super admin can access all companies
      companies = await prisma.company.findMany({
        include: {
          directors: true,
          shareholders: true,
          shares: true,
          beneficialOwners: true,
          charges: true,
          allotments: true,
          meetings: true,
          boardMinutes: true,
          activities: true,
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
          directors: true,
          shareholders: true,
          shares: true,
          beneficialOwners: true,
          charges: true,
          allotments: true,
          meetings: true,
          boardMinutes: true,
          activities: true,
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
router.get('/accessible', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let companies;

    if (userRole === 'Super Administrator') {
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
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const company = await prisma.company.findFirst({
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
      },
      include: {
        directors: true,
        shareholders: true,
        shares: true,
        beneficialOwners: true,
        charges: true,
        allotments: true,
        meetings: true,
        boardMinutes: true,
        activities: true,
      },
    });

    if (!company && userRole !== 'Super Administrator') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
router.post('/create', async (req, res) => {
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
        directors: true,
        shareholders: true,
        shares: true,
        beneficialOwners: true,
        charges: true,
        allotments: true,
        meetings: true,
        boardMinutes: true,
        activities: true,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

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

    if (!hasAccess && userRole !== 'Super Administrator') {
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
        directors: true,
        shareholders: true,
        shares: true,
        beneficialOwners: true,
        charges: true,
        allotments: true,
        meetings: true,
        boardMinutes: true,
        activities: true,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

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

    if (!hasAccess && userRole !== 'Super Administrator') {
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
router.post('/:id/set-primary', async (req, res) => {
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
router.post('/:id/set-my-org', async (req, res) => {
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
router.post('/:id/tags', async (req, res) => {
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
router.delete('/:id/tags/:tag', async (req, res) => {
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
router.post('/:id/archive', async (req, res) => {
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
router.post('/:id/activate', async (req, res) => {
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
router.post('/:id/logo', async (req, res) => {
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
router.get('/:id/primary-contact', async (req, res) => {
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
router.put('/:id/primary-contact', async (req, res) => {
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
