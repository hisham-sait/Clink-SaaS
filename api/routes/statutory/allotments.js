const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all allotments for a company
router.get('/:companyId', async (req, res) => {
  try {
    const allotments = await prisma.allotment.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { allotmentDate: 'desc' }
    });
    res.json(allotments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific allotment
router.get('/:companyId/:id', async (req, res) => {
  try {
    const allotment = await prisma.allotment.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!allotment) {
      return res.status(404).json({ error: 'Allotment not found' });
    }
    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new allotment
router.post('/:companyId', async (req, res) => {
  try {
    const allotment = await prisma.allotment.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        allotmentDate: new Date(req.body.allotmentDate),
        numberOfShares: parseInt(req.body.numberOfShares),
        pricePerShare: parseFloat(req.body.pricePerShare),
        amountPaid: req.body.amountPaid ? parseFloat(req.body.amountPaid) : null,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : null
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New allotment created: ${allotment.numberOfShares} ${allotment.shareClass} shares to ${allotment.allottee}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an allotment
router.put('/:companyId/:id', async (req, res) => {
  try {
    const allotment = await prisma.allotment.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        allotmentDate: new Date(req.body.allotmentDate),
        numberOfShares: parseInt(req.body.numberOfShares),
        pricePerShare: parseFloat(req.body.pricePerShare),
        amountPaid: req.body.amountPaid ? parseFloat(req.body.amountPaid) : null,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Allotment ${allotment.allotmentId} details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status
router.post('/:companyId/:id/payment', async (req, res) => {
  try {
    const allotment = await prisma.allotment.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        paymentStatus: req.body.paymentStatus,
        amountPaid: req.body.amountPaid ? parseFloat(req.body.amountPaid) : null,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Payment status updated for allotment ${allotment.allotmentId} to ${req.body.paymentStatus}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update certificate number
router.post('/:companyId/:id/certificate', async (req, res) => {
  try {
    const allotment = await prisma.allotment.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        certificateNumber: req.body.certificateNumber
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Certificate number ${req.body.certificateNumber} assigned to allotment ${allotment.allotmentId}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change allotment status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const allotment = await prisma.allotment.update({
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
        description: `Allotment ${allotment.allotmentId} status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
