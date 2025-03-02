const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all deals for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const deals = await prisma.deal.findMany({
      where: { companyId },
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get a single deal
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const deal = await prisma.deal.findFirst({
      where: { id, companyId },
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Create a new deal
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      amount,
      probability,
      expectedCloseDate,
      notes,
      contactId,
      organisationId,
      stageId,
      pipelineId,
    } = req.body;

    const deal = await prisma.deal.create({
      data: {
        name,
        amount,
        probability,
        expectedCloseDate,
        notes,
        contactId,
        organisationId,
        stageId,
        pipelineId,
        companyId,
      },
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update a deal
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const {
      name,
      amount,
      probability,
      expectedCloseDate,
      notes,
      contactId,
      organisationId,
      stageId,
      pipelineId,
    } = req.body;

    const deal = await prisma.deal.findFirst({
      where: { id, companyId },
    });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: {
        name,
        amount,
        probability,
        expectedCloseDate,
        notes,
        contactId,
        organisationId,
        stageId,
        pipelineId,
      },
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete a deal
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const deal = await prisma.deal.findFirst({
      where: { id, companyId },
    });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await prisma.deal.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// Move a deal to a different stage
router.put('/:companyId/:id/move', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { sourceStageId, destinationStageId, newIndex } = req.body;

    const deal = await prisma.deal.findFirst({
      where: { id, companyId },
    });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Update the deal's stage
    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: {
        stageId: destinationStageId,
      },
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.json(updatedDeal);
  } catch (error) {
    console.error('Error moving deal:', error);
    res.status(500).json({ error: 'Failed to move deal' });
  }
});

module.exports = router;
