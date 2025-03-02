const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all proposals for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const proposals = await prisma.proposal.findMany({
      where: { companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get a single proposal
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// Create a new proposal
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { products, ...proposalData } = req.body;

    const proposal = await prisma.proposal.create({
      data: {
        ...proposalData,
        companyId,
        products: {
          create: products.map(product => ({
            productId: product.productId,
            planType: product.planType,
            quantity: product.quantity,
            price: product.price,
            features: product.features,
          })),
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update a proposal
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { products, ...proposalData } = req.body;

    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Delete existing products
    await prisma.proposalProduct.deleteMany({
      where: { proposalId: id },
    });

    // Update proposal and create new products
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...proposalData,
        products: {
          create: products.map(product => ({
            productId: product.productId,
            planType: product.planType,
            quantity: product.quantity,
            price: product.price,
            features: product.features,
          })),
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    res.json(updatedProposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// Delete a proposal
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Delete proposal (products will be deleted automatically due to cascade)
    await prisma.proposal.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

module.exports = router;
