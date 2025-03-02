const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all automations for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const automations = await prisma.automation.findMany({
      where: { companyId },
      include: {
        deals: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

// Get a single automation
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const automation = await prisma.automation.findFirst({
      where: { id, companyId },
      include: {
        deals: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    res.json(automation);
  } catch (error) {
    console.error('Error fetching automation:', error);
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
});

// Create a new automation
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      description,
      trigger,
      conditions,
      actions,
      pipelineId,
    } = req.body;

    const automation = await prisma.automation.create({
      data: {
        name,
        description,
        trigger,
        conditions,
        actions,
        pipelineId,
        companyId,
      },
      include: {
        deals: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(201).json(automation);
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
});

// Update an automation
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const {
      name,
      description,
      trigger,
      conditions,
      actions,
      pipelineId,
      isActive,
    } = req.body;

    const automation = await prisma.automation.findFirst({
      where: { id, companyId },
    });
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: {
        name,
        description,
        trigger,
        conditions,
        actions,
        pipelineId,
        isActive,
      },
      include: {
        deals: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.json(updatedAutomation);
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
});

// Delete an automation
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const automation = await prisma.automation.findFirst({
      where: { id, companyId },
    });
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    await prisma.automation.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
});

module.exports = router;
