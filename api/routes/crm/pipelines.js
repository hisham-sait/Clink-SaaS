const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all pipelines for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const pipelines = await prisma.pipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          include: {
            deals: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Get pipeline stages
router.get('/:companyId/:pipelineId/stages', async (req, res) => {
  try {
    const { companyId, pipelineId } = req.params;
    const stages = await prisma.pipelineStage.findMany({
      where: { 
        pipelineId,
        pipeline: { companyId }
      },
      orderBy: { order: 'asc' },
    });
    res.json(stages);
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline stages' });
  }
});

// Create a new pipeline
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, description, stages } = req.body;

    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        description,
        companyId,
        stages: {
          create: stages.map((stage, index) => ({
            name: stage.name,
            color: stage.color,
            order: index,
          })),
        },
      },
      include: {
        stages: true,
      },
    });
    res.status(201).json(pipeline);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

// Update a pipeline
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { name, description, stages } = req.body;

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, companyId },
    });
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Delete existing stages
    await prisma.pipelineStage.deleteMany({
      where: { pipelineId: id },
    });

    // Update pipeline and create new stages
    const updatedPipeline = await prisma.pipeline.update({
      where: { id },
      data: {
        name,
        description,
        stages: {
          create: stages.map((stage, index) => ({
            name: stage.name,
            color: stage.color,
            order: index,
          })),
        },
      },
      include: {
        stages: true,
      },
    });
    res.json(updatedPipeline);
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({ error: 'Failed to update pipeline' });
  }
});

// Delete a pipeline
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const pipeline = await prisma.pipeline.findFirst({
      where: { id, companyId },
    });
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Pipeline stages and deals will be deleted automatically due to cascade
    await prisma.pipeline.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

// Get pipeline automations
router.get('/:companyId/:pipelineId/automations', async (req, res) => {
  try {
    const { companyId, pipelineId } = req.params;
    const automations = await prisma.automation.findMany({
      where: { 
        pipelineId,
        pipeline: { companyId }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

module.exports = router;
