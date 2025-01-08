const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all activities for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { entityType, entityId, type, startDate, endDate, limit = 10, offset = 0 } = req.query;
    
    const where = {
      companyId: req.params.companyId,
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(type && { type }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { time: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.activity.count({ where })
    ]);

    res.json({ activities, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new activity
router.post('/:companyId', async (req, res) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        time: new Date(req.body.time)
      }
    });
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get activities for a specific entity
router.get('/:companyId/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 10, offset = 0 } = req.query;
    
    const where = {
      companyId: req.params.companyId,
      entityType: req.params.entityType,
      entityId: req.params.entityId,
      ...(type && { type }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { time: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.activity.count({ where })
    ]);

    res.json({ activities, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities by type
router.get('/:companyId/type/:type', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, offset = 0 } = req.query;
    
    const where = {
      companyId: req.params.companyId,
      type: req.params.type,
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { time: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.activity.count({ where })
    ]);

    res.json({ activities, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity statistics
router.get('/:companyId/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      companyId: req.params.companyId,
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const activities = await prisma.activity.findMany({
      where,
      select: {
        type: true,
        entityType: true,
        user: true,
        time: true
      }
    });

    const totalActivities = activities.length;

    // Group activities by type
    const activityByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    // Group activities by entity
    const activityByEntity = activities.reduce((acc, activity) => {
      acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
      return acc;
    }, {});

    // Group activities by user
    const activityByUser = activities.reduce((acc, activity) => {
      acc[activity.user] = (acc[activity.user] || 0) + 1;
      return acc;
    }, {});

    // Group activities by month
    const activityByMonth = activities.reduce((acc, activity) => {
      const month = activity.time.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalActivities,
      activityByType,
      activityByEntity,
      activityByUser,
      activityByMonth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
