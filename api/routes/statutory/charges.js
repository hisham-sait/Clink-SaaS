const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all charges for a company
router.get('/:companyId', async (req, res) => {
  try {
    const charges = await prisma.charge.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { dateCreated: 'desc' }
    });
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific charge
router.get('/:companyId/:id', async (req, res) => {
  try {
    const charge = await prisma.charge.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!charge) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new charge
router.post('/:companyId', async (req, res) => {
  try {
    const charge = await prisma.charge.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        dateCreated: new Date(req.body.dateCreated),
        registrationDate: new Date(req.body.registrationDate),
        amount: parseFloat(req.body.amount),
        status: 'Active'
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New charge created: ${charge.chargeType} - ${charge.chargeId}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a charge
router.put('/:companyId/:id', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        dateCreated: new Date(req.body.dateCreated),
        registrationDate: new Date(req.body.registrationDate),
        amount: parseFloat(req.body.amount),
        satisfactionDate: req.body.satisfactionDate ? new Date(req.body.satisfactionDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Charge ${charge.chargeId} details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Satisfy a charge
router.post('/:companyId/:id/satisfy', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: 'Satisfied',
        satisfactionDate: new Date(req.body.satisfactionDate || new Date())
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Charge ${charge.chargeId} marked as satisfied`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Release a charge
router.post('/:companyId/:id/release', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: 'Released',
        satisfactionDate: new Date(req.body.satisfactionDate || new Date())
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Charge ${charge.chargeId} released`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
