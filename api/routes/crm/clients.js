const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get all clients for a company
router.get('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;

    const where = {
      companyId,
      ...(status && status !== 'All' ? { status } : {})
    };

    const clients = await prisma.client.findMany({ where });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Create a new client
router.post('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const client = await prisma.client.create({
      data: {
        ...req.body,
        companyId
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'added',
        entityType: 'client',
        entityId: client.id,
        description: `Added new client: ${client.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update a client
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const client = await prisma.client.update({
      where: { id },
      data: req.body
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'updated',
        entityType: 'client',
        entityId: client.id,
        description: `Updated client: ${client.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete a client
router.delete('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const client = await prisma.client.delete({
      where: { id }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'removed',
        entityType: 'client',
        entityId: id,
        description: `Deleted client: ${client.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Export clients
router.get('/:companyId/export/:type', auth, async (req, res) => {
  try {
    const { companyId, type } = req.params;
    const clients = await prisma.client.findMany({
      where: { companyId }
    });

    // TODO: Implement export logic based on type (pdf/excel)
    res.json(clients);
  } catch (error) {
    console.error('Error exporting clients:', error);
    res.status(500).json({ error: 'Failed to export clients' });
  }
});

// Import clients template
router.get('/import/template', auth, (req, res) => {
  // TODO: Implement template download
  res.json({ message: 'Template download endpoint' });
});

// Import clients
router.post('/:companyId/import', auth, async (req, res) => {
  try {
    // TODO: Implement import logic
    res.json({ message: 'Import successful' });
  } catch (error) {
    console.error('Error importing clients:', error);
    res.status(500).json({ error: 'Failed to import clients' });
  }
});

module.exports = router;
