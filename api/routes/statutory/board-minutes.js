const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all board minutes for a company
router.get('/:companyId', async (req, res) => {
  try {
    const boardMinutes = await prisma.boardMinute.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { meetingDate: 'desc' },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });
    res.json(boardMinutes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific board minute
router.get('/:companyId/:id', async (req, res) => {
  try {
    const boardMinute = await prisma.boardMinute.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });
    if (!boardMinute) {
      return res.status(404).json({ error: 'Board minute not found' });
    }
    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new board minute
router.post('/:companyId', async (req, res) => {
  try {
    const { discussions, resolutions, ...minuteData } = req.body;
    
    const boardMinute = await prisma.boardMinute.create({
      data: {
        ...minuteData,
        companyId: req.params.companyId,
        meetingDate: new Date(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        discussions: {
          create: discussions.map(discussion => ({
            topic: discussion.topic,
            details: discussion.details,
            decisions: discussion.decisions,
            actionItems: {
              create: discussion.actionItems?.map(item => ({
                task: item.task,
                assignee: item.assignee,
                dueDate: new Date(item.dueDate),
                status: item.status
              })) || []
            }
          }))
        },
        resolutions: {
          create: resolutions.map(resolution => ({
            title: resolution.title,
            type: resolution.type,
            description: resolution.description,
            outcome: resolution.outcome,
            proposedBy: resolution.proposedBy,
            secondedBy: resolution.secondedBy
          }))
        }
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New board minute created for ${new Date(boardMinute.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a board minute
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { discussions, resolutions, ...minuteData } = req.body;

    // First update the board minute
    const boardMinute = await prisma.boardMinute.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...minuteData,
        meetingDate: new Date(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      }
    });

    // Handle discussions and action items
    if (discussions) {
      // Delete existing discussions and their action items
      await prisma.discussion.deleteMany({
        where: { boardMinuteId: boardMinute.id }
      });

      // Create new discussions with action items
      for (const discussion of discussions) {
        await prisma.discussion.create({
          data: {
            boardMinuteId: boardMinute.id,
            topic: discussion.topic,
            details: discussion.details,
            decisions: discussion.decisions,
            actionItems: {
              create: discussion.actionItems?.map(item => ({
                task: item.task,
                assignee: item.assignee,
                dueDate: new Date(item.dueDate),
                status: item.status
              })) || []
            }
          }
        });
      }
    }

    // Handle resolutions
    if (resolutions) {
      // Delete existing resolutions
      await prisma.resolution.deleteMany({
        where: { boardMinuteId: boardMinute.id }
      });

      // Create new resolutions
      await prisma.resolution.createMany({
        data: resolutions.map(resolution => ({
          boardMinuteId: boardMinute.id,
          title: resolution.title,
          type: resolution.type,
          description: resolution.description,
          outcome: resolution.outcome,
          proposedBy: resolution.proposedBy,
          secondedBy: resolution.secondedBy
        }))
      });
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Board minute updated for ${new Date(boardMinute.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    // Fetch and return updated board minute with all relations
    const updatedBoardMinute = await prisma.boardMinute.findUnique({
      where: { id: boardMinute.id },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });

    res.json(updatedBoardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update board minute status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const boardMinute = await prisma.boardMinute.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: req.body.status
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Board minute status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update action item status
router.post('/:companyId/:id/action-item/:actionItemId', async (req, res) => {
  try {
    const actionItem = await prisma.actionItem.update({
      where: { 
        id: req.params.actionItemId
      },
      data: {
        status: req.body.status
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Action item "${actionItem.task}" status updated to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(actionItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
