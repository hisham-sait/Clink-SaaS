const express = require('express');
const router = express.Router();

module.exports = (prisma, { encryptToken, decryptToken }) => {
  // Get all bank connections
  router.get('/', async (req, res) => {
    try {
      const connections = await prisma.bankConnection.findMany({
        include: {
          accounts: true
        }
      });

      res.json(connections.map(conn => ({
        ...conn,
        accessToken: undefined // Remove sensitive data
      })));
    } catch (error) {
      console.error('Error fetching bank connections:', error);
      res.status(500).json({ error: 'Failed to fetch bank connections' });
    }
  });

  // Create a new bank connection
  router.post('/', async (req, res) => {
    try {
      console.log('Creating bank connection with data:', req.body);
      const { institutionId, institutionName, provider, status, userId, accessToken } = req.body;

      const connection = await prisma.bankConnection.create({
        data: {
          institutionId,
          institutionName,
          provider,
          status,
          userId,
          accessToken: accessToken ? encryptToken(accessToken) : null,
          lastSynced: new Date()
        }
      });

      console.log('Bank connection created:', connection);
      res.status(201).json({
        ...connection,
        accessToken: undefined // Remove sensitive data
      });
    } catch (error) {
      console.error('Error creating bank connection:', error);
      res.status(500).json({ error: 'Failed to create bank connection', details: error.message });
    }
  });

  // Get a single bank connection
  router.get('/:id', async (req, res) => {
    try {
      const connection = await prisma.bankConnection.findUnique({
        where: { id: req.params.id },
        include: {
          accounts: true
        }
      });

      if (!connection) {
        return res.status(404).json({ error: 'Bank connection not found' });
      }

      res.json({
        ...connection,
        accessToken: undefined // Remove sensitive data
      });
    } catch (error) {
      console.error('Error fetching bank connection:', error);
      res.status(500).json({ error: 'Failed to fetch bank connection' });
    }
  });

  // Update bank connection
  router.put('/:id', async (req, res) => {
    try {
      const { status } = req.body;

      const connection = await prisma.bankConnection.update({
        where: { id: req.params.id },
        data: { status }
      });

      res.json({
        ...connection,
        accessToken: undefined // Remove sensitive data
      });
    } catch (error) {
      console.error('Error updating bank connection:', error);
      res.status(500).json({ error: 'Failed to update bank connection' });
    }
  });

  // Delete bank connection
  router.delete('/:id', async (req, res) => {
    try {
      await prisma.bankConnection.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting bank connection:', error);
      res.status(500).json({ error: 'Failed to delete bank connection' });
    }
  });

  // Refresh connection
  router.post('/:id/refresh', async (req, res) => {
    try {
      const connection = await prisma.bankConnection.findUnique({
        where: { id: req.params.id }
      });

      if (!connection) {
        return res.status(404).json({ error: 'Bank connection not found' });
      }

      // Update last synced time
      await prisma.bankConnection.update({
        where: { id: req.params.id },
        data: { lastSynced: new Date() }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error refreshing bank connection:', error);
      res.status(500).json({ error: 'Failed to refresh bank connection' });
    }
  });

  return router;
};
