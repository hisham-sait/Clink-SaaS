const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get recent activity for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if the ProductActivity model exists in the schema
    // If not, return an empty array to avoid breaking the frontend
    if (!prisma.productActivity) {
      console.log('ProductActivity model not found in schema');
      return res.json([]);
    }
    
    // Fetch recent activity
    const activities = await prisma.productActivity.findMany({
      where: { companyId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // Format the response
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.itemType,
      action: activity.action,
      itemName: activity.itemName,
      itemId: activity.itemId,
      timestamp: activity.timestamp,
      user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'
    }));
    
    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create a new activity record
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      userId, 
      action, 
      itemType, 
      itemId, 
      itemName, 
      details 
    } = req.body;
    
    // Check if the ProductActivity model exists in the schema
    if (!prisma.productActivity) {
      console.log('ProductActivity model not found in schema');
      return res.status(200).json({ message: 'Activity logging not available' });
    }
    
    // Create activity record
    const activity = await prisma.productActivity.create({
      data: {
        companyId,
        userId,
        action,
        itemType,
        itemId,
        itemName,
        details: details || {},
        timestamp: new Date()
      }
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    // Don't return an error to the client, as activity logging should not block operations
    res.status(200).json({ message: 'Operation completed, but activity logging failed' });
  }
});

module.exports = router;
