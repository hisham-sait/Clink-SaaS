const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get recent activities for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { entityType, limit = 5 } = req.query;

    const where = {
      companyId: req.params.companyId,
      ...(entityType ? { entityType } : {})
    };

    const activities = await prisma.activity.findMany({
      where,
      orderBy: {
        time: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

module.exports = router;
