const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all meetings for a company
router.get('/:companyId?', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      status: status || {
        in: ['Final', 'Signed'] // Default to Final and Signed if no status provided
      }
    };

    // If not super_admin/platform_admin or if companyId is provided, filter by company
    if (req.params.companyId || (!req.user.roles.includes('super_admin') && !req.user.roles.includes('platform_admin'))) {
      where.companyId = req.params.companyId || req.user.companyId;
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      include: {
        resolutions: true,
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific meeting
router.get('/:companyId/:id', async (req, res) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      include: {
        resolutions: true
      }
    });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new meeting
router.post('/:companyId', async (req, res) => {
  try {
    const { resolutions, ...meetingData } = req.body;
    
    const meeting = await prisma.meeting.create({
      data: {
        ...meetingData,
        companyId: req.params.companyId,
        meetingDate: new Date(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        quorumRequired: parseInt(req.body.quorumRequired),
        quorumPresent: parseInt(req.body.quorumPresent),
        quorumAchieved: req.body.quorumPresent >= req.body.quorumRequired,
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
        resolutions: true
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New ${meeting.meetingType} created for ${new Date(meeting.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a meeting
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { resolutions, ...meetingData } = req.body;

    // First update the meeting
    const meeting = await prisma.meeting.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...meetingData,
        meetingDate: new Date(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        quorumRequired: parseInt(req.body.quorumRequired),
        quorumPresent: parseInt(req.body.quorumPresent),
        quorumAchieved: req.body.quorumPresent >= req.body.quorumRequired
      }
    });

    // Then handle resolutions separately
    if (resolutions) {
      // Delete existing resolutions
      await prisma.resolution.deleteMany({
        where: { meetingId: meeting.id }
      });

      // Create new resolutions
      await prisma.resolution.createMany({
        data: resolutions.map(resolution => ({
          meetingId: meeting.id,
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
        description: `${meeting.meetingType} details updated for ${new Date(meeting.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    // Fetch and return updated meeting with resolutions
    const updatedMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: { resolutions: true }
    });

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update meeting status
router.post('/:companyId/:id/status', async (req, res) => {
  try {
    const meeting = await prisma.meeting.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: req.body.status
      },
      include: {
        resolutions: true
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `${meeting.meetingType} status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resolution outcome
router.post('/:companyId/:id/resolution/:resolutionId', async (req, res) => {
  try {
    const resolution = await prisma.resolution.update({
      where: { 
        id: req.params.resolutionId
      },
      data: {
        outcome: req.body.outcome
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Resolution "${resolution.title}" outcome updated to ${req.body.outcome}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(resolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
