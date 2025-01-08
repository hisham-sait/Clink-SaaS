const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all directors for a company
router.get('/:companyId', async (req, res) => {
  try {
    const directors = await prisma.director.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { lastName: 'asc' }
    });
    res.json(directors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific director
router.get('/:companyId/:id', async (req, res) => {
  try {
    const director = await prisma.director.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }
    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new director
router.post('/:companyId', async (req, res) => {
  try {
    const { company, ...directorData } = req.body;
    const director = await prisma.director.create({
      data: {
        ...directorData,
        companyId: req.params.companyId,
        dateOfBirth: new Date(req.body.dateOfBirth),
        appointmentDate: new Date(req.body.appointmentDate),
        resignationDate: req.body.resignationDate ? new Date(req.body.resignationDate) : null
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'appointment',
        description: `${director.firstName} ${director.lastName} appointed as ${director.directorType}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a director
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { company, id, ...directorData } = req.body;
    const director = await prisma.director.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...directorData,
        dateOfBirth: new Date(directorData.dateOfBirth),
        appointmentDate: new Date(directorData.appointmentDate),
        resignationDate: directorData.resignationDate ? new Date(directorData.resignationDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'update',
        description: `Director ${director.firstName} ${director.lastName}'s details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resign a director
router.post('/:companyId/:id/resign', async (req, res) => {
  try {
    const director = await prisma.director.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: 'Resigned',
        resignationDate: new Date(req.body.resignationDate || new Date())
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'resignation',
        description: `${director.firstName} ${director.lastName} resigned from position of ${director.directorType}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
