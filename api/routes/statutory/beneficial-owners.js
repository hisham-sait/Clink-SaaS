const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all beneficial owners for a company
router.get('/:companyId', async (req, res) => {
  try {
    const owners = await prisma.beneficialOwner.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { lastName: 'asc' }
    });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific beneficial owner
router.get('/:companyId/:id', async (req, res) => {
  try {
    const owner = await prisma.beneficialOwner.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!owner) {
      return res.status(404).json({ error: 'Beneficial owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new beneficial owner
router.post('/:companyId', async (req, res) => {
  try {
    const owner = await prisma.beneficialOwner.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        dateOfBirth: new Date(req.body.dateOfBirth),
        registrationDate: new Date(req.body.registrationDate),
        ownershipPercentage: parseFloat(req.body.ownershipPercentage)
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New beneficial owner ${owner.firstName} ${owner.lastName} added`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a beneficial owner
router.put('/:companyId/:id', async (req, res) => {
  try {
    const owner = await prisma.beneficialOwner.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
        registrationDate: new Date(req.body.registrationDate),
        ownershipPercentage: parseFloat(req.body.ownershipPercentage)
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Beneficial owner ${owner.firstName} ${owner.lastName}'s details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change beneficial owner status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const owner = await prisma.beneficialOwner.update({
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
        description: `Beneficial owner ${owner.firstName} ${owner.lastName}'s status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update nature of control
router.post('/:companyId/:id/control', async (req, res) => {
  try {
    const owner = await prisma.beneficialOwner.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        natureOfControl: req.body.natureOfControl,
        ownershipPercentage: parseFloat(req.body.ownershipPercentage)
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Nature of control updated for beneficial owner ${owner.firstName} ${owner.lastName}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
