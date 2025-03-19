const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Create a new pipeline
router.post('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, description, stages } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Create the pipeline with stages in a transaction
    const pipeline = await prisma.$transaction(async (tx) => {
      // Create the pipeline
      const newPipeline = await tx.pipeline.create({
        data: {
          name,
          description,
          companyId
        }
      });

      // Create the stages
      const stagePromises = stages.map(stage => 
        tx.stage.create({
          data: {
            name: stage.name,
            color: stage.color,
            order: stage.order,
            pipelineId: newPipeline.id
          }
        })
      );

      await Promise.all(stagePromises);

      // Return the created pipeline with stages
      return tx.pipeline.findUnique({
        where: { id: newPipeline.id },
        include: {
          stages: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    res.status(201).json(pipeline);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

// Get all pipelines for a company
router.get('/', auth, async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const pipelines = await prisma.pipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              where: { status: 'Open' },
              include: {
                contact: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            contacts: {
              where: { exitedAt: null },
              include: {
                contact: {
                  select: {
                    firstName: true,
                    lastName: true,
                    estimatedValue: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data to include contacts in the deals array
    const pipelinesWithContacts = pipelines.map(pipeline => ({
      ...pipeline,
      stages: pipeline.stages.map(stage => {
        // Remove the contacts from the stage object
        const { contacts, ...stageWithoutContacts } = stage;
        
        return {
          ...stageWithoutContacts,
          deals: [
            ...stage.deals.map(deal => ({
              ...deal,
              type: 'deal'
            })),
            ...stage.contacts.map(cps => ({
              id: cps.contactId,
              name: `${cps.contact.firstName} ${cps.contact.lastName}`,
              amount: cps.contact.estimatedValue || 0,
              probability: 50,
              status: 'Open',
              contact: cps.contact,
              stage: {
                id: stage.id,
                name: stage.name
              },
              type: 'contact'
            }))
          ]
        };
      })
    }));

    res.json(pipelinesWithContacts);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Add contact to pipeline
router.post('/contacts/:contactId/pipeline', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { pipelineId, stageId, estimatedValue, notes, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Get contact to check if it's already in a pipeline
    const existingStage = await prisma.contactPipelineStage.findFirst({
      where: {
        contactId,
        exitedAt: null
      }
    });

    if (existingStage) {
      return res.status(400).json({ error: 'Contact is already in a pipeline' });
    }

    // Start a transaction to update both contact and create pipeline stage
    const pipelineStage = await prisma.$transaction(async (tx) => {
      // Update contact's estimated value if provided
      if (estimatedValue !== undefined) {
        await tx.contact.update({
          where: { id: contactId },
          data: { estimatedValue }
        });
      }

      // Create pipeline stage entry
      return await tx.contactPipelineStage.create({
        data: {
          contactId,
          pipelineId,
          stageId,
          notes,
          enteredAt: new Date()
        },
        include: {
          pipeline: true,
          stage: true,
          contact: {
            select: {
              firstName: true,
              lastName: true,
              estimatedValue: true
            }
          }
        }
      });
    });

    res.json(pipelineStage);
  } catch (error) {
    console.error('Error adding contact to pipeline:', error);
    res.status(500).json({ error: 'Failed to add contact to pipeline' });
  }
});

// Update contact's pipeline stage
router.put('/contacts/:contactId/pipeline', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { stageId, notes, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Get current pipeline stage
    const currentStage = await prisma.contactPipelineStage.findFirst({
      where: { contactId },
      orderBy: { enteredAt: 'desc' }
    });

    if (!currentStage) {
      return res.status(404).json({ error: 'Contact not in any pipeline' });
    }

    // Mark current stage as exited
    await prisma.contactPipelineStage.update({
      where: { id: currentStage.id },
      data: { exitedAt: new Date() }
    });

    // Create new stage entry
    const newStage = await prisma.contactPipelineStage.create({
      data: {
        contactId,
        pipelineId: currentStage.pipelineId,
        stageId,
        notes,
        enteredAt: new Date()
      },
      include: {
        pipeline: true,
        stage: true
      }
    });

    res.json(newStage);
  } catch (error) {
    console.error('Error updating pipeline stage:', error);
    res.status(500).json({ error: 'Failed to update pipeline stage' });
  }
});

// Remove contact from pipeline
router.delete('/contacts/:contactId/pipeline', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Mark all stages as exited
    await prisma.contactPipelineStage.updateMany({
      where: { 
        contactId,
        exitedAt: null
      },
      data: { exitedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing contact from pipeline:', error);
    res.status(500).json({ error: 'Failed to remove contact from pipeline' });
  }
});

// Get pipeline stages
router.get('/:pipelineId/stages', auth, async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const stages = await prisma.stage.findMany({
      where: { 
        pipelineId,
        pipeline: { companyId }
      },
      orderBy: { order: 'asc' }
    });

    res.json(stages);
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline stages' });
  }
});

// Create deal
router.post('/deals', auth, async (req, res) => {
  try {
    const {
      name,
      amount,
      probability,
      expectedCloseDate,
      notes,
      contactId,
      organisationId,
      stageId,
      pipelineId,
      status,
      priority,
      companyId
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const deal = await prisma.deal.create({
      data: {
        name,
        amount,
        probability,
        expectedCloseDate: new Date(expectedCloseDate),
        notes,
        contactId,
        organisationId,
        stageId,
        pipelineId,
        status,
        priority,
        companyId
      },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Move deal
router.put('/deals/:dealId/move', auth, async (req, res) => {
  try {
    const { dealId } = req.params;
    const { sourceStageId, destinationStageId, newIndex, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Update deal's stage
    await prisma.deal.update({
      where: { id: dealId },
      data: { stageId: destinationStageId }
    });

    res.status(200).send();
  } catch (error) {
    console.error('Error moving deal:', error);
    res.status(500).json({ error: 'Failed to move deal' });
  }
});

// Move contact
router.put('/contacts/:contactId/move', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { sourceStageId, destinationStageId, newIndex, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Get current pipeline stage
    const currentStage = await prisma.contactPipelineStage.findFirst({
      where: {
        contactId,
        exitedAt: null
      }
    });

    if (!currentStage) {
      return res.status(404).json({ error: 'Contact not in any pipeline' });
    }

    // Mark current stage as exited
    await prisma.contactPipelineStage.update({
      where: { id: currentStage.id },
      data: { exitedAt: new Date() }
    });

    // Create new stage entry
    const newStage = await prisma.contactPipelineStage.create({
      data: {
        contactId,
        pipelineId: currentStage.pipelineId,
        stageId: destinationStageId,
        enteredAt: new Date()
      },
      include: {
        pipeline: true,
        stage: true,
        contact: {
          select: {
            firstName: true,
            lastName: true,
            estimatedValue: true
          }
        }
      }
    });

    res.json(newStage);
  } catch (error) {
    console.error('Error moving contact:', error);
    res.status(500).json({ error: 'Failed to move contact' });
  }
});

module.exports = router;
