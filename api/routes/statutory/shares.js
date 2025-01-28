const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all shares for a company
router.get('/:companyId?', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      status: status || 'Active' // Default to Active if no status provided
    };

    // If not super_admin/platform_admin or if companyId is provided, filter by company
    if (req.params.companyId || (!req.user.roles.includes('super_admin') && !req.user.roles.includes('platform_admin'))) {
      where.companyId = req.params.companyId || req.user.companyId;
    }

    const shares = await prisma.share.findMany({
      where,
      orderBy: { class: 'asc' },
      include: {
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific share class
router.get('/:companyId/:id', async (req, res) => {
  try {
    const share = await prisma.share.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!share) {
      return res.status(404).json({ error: 'Share class not found' });
    }
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new share class
router.post('/:companyId', async (req, res) => {
  try {
    const share = await prisma.share.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        nominalValue: parseFloat(req.body.nominalValue),
        totalIssued: parseInt(req.body.totalIssued),
        votingRights: Boolean(req.body.votingRights),
        dividendRights: Boolean(req.body.dividendRights),
        transferable: Boolean(req.body.transferable)
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New share class '${share.class}' created`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a share class
router.put('/:companyId/:id', async (req, res) => {
  try {
    const share = await prisma.share.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        nominalValue: parseFloat(req.body.nominalValue),
        totalIssued: parseInt(req.body.totalIssued),
        votingRights: Boolean(req.body.votingRights),
        dividendRights: Boolean(req.body.dividendRights),
        transferable: Boolean(req.body.transferable)
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Share class '${share.class}' details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change share class status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const share = await prisma.share.update({
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
        description: `Share class '${share.class}' status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update total issued shares
router.post('/:companyId/:id/issue', async (req, res) => {
  try {
    const share = await prisma.share.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        totalIssued: parseInt(req.body.totalIssued)
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Total issued shares for '${share.class}' updated to ${req.body.totalIssued}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
