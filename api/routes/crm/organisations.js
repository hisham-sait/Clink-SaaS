const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get all organisations
router.get('/:companyId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      companyId: req.params.companyId
    };
    if (status && status !== 'All') {
      where.status = status;
    }
    const organisations = await prisma.organisation.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(organisations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single organisation
router.get('/:companyId/:id', auth, async (req, res) => {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: {
        id: req.params.id
      }
    });
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    if (organisation.companyId !== req.params.companyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(organisation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create organisation
router.post('/:companyId', auth, async (req, res) => {
  try {
    const organisation = await prisma.organisation.create({
      data: {
        ...req.body,
        companyId: req.params.companyId
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        entityType: 'organisation',
        entityId: organisation.id,
        description: `Added organisation: ${organisation.name}`,
        user: req.user.email,
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.status(201).json(organisation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update organisation
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: {
        id: req.params.id
      }
    });
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    if (organisation.companyId !== req.params.companyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedOrganisation = await prisma.organisation.update({
      where: {
        id: req.params.id
      },
      data: req.body
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        entityType: 'organisation',
        entityId: updatedOrganisation.id,
        description: `Updated organisation: ${updatedOrganisation.name}`,
        user: req.user.email,
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(updatedOrganisation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete organisation
router.delete('/:companyId/:id', auth, async (req, res) => {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: {
        id: req.params.id
      }
    });
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    if (organisation.companyId !== req.params.companyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.organisation.delete({
      where: {
        id: req.params.id
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'removed',
        entityType: 'organisation',
        entityId: req.params.id,
        description: `Removed organisation: ${organisation.name}`,
        user: req.user.email,
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json({ message: 'Organisation deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import organisations
router.post('/:companyId/import', auth, async (req, res) => {
  try {
    // Handle CSV import logic here
    res.status(201).json({ message: 'Organisations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get import template
router.get('/import/template', auth, (req, res) => {
  try {
    // Send CSV template file
    res.download('path/to/template.csv');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
