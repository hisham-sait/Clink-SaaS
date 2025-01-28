const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all shareholders for a company
router.get('/:companyId?', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      companyId: req.params.companyId || req.user.companyId
    };

    // Only add status filter if it's not an empty string (which means show all)
    if (status !== '') {
      where.status = status || 'Active'; // Default to Active if status is undefined/null
    }

    const shareholders = await prisma.shareholder.findMany({
      where,
      orderBy: { lastName: 'asc' },
      include: {
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(shareholders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific shareholder
router.get('/:companyId/:id', async (req, res) => {
  try {
    const shareholder = await prisma.shareholder.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!shareholder) {
      return res.status(404).json({ error: 'Shareholder not found' });
    }
    res.json(shareholder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new shareholder
router.post('/:companyId', async (req, res) => {
  try {
    const shareholder = await prisma.shareholder.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        dateOfBirth: new Date(req.body.dateOfBirth),
        dateAcquired: new Date(req.body.dateAcquired)
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New shareholder ${shareholder.firstName} ${shareholder.lastName} added`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(shareholder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a shareholder
router.put('/:companyId/:id', async (req, res) => {
  try {
    const shareholder = await prisma.shareholder.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
        dateAcquired: new Date(req.body.dateAcquired)
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Shareholder ${shareholder.firstName} ${shareholder.lastName}'s details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(shareholder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change shareholder status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const shareholder = await prisma.shareholder.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: req.body.status
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Shareholder ${shareholder.firstName} ${shareholder.lastName}'s status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(shareholder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
