const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  // Get all bank accounts
  router.get('/', async (req, res) => {
    try {
      console.log('Fetching all bank accounts');
      const accounts = await prisma.bankAccount.findMany({
        include: {
          connection: {
            select: {
              institutionName: true,
              status: true
            }
          }
        }
      });

      // Format accounts for frontend
      const formattedAccounts = accounts.map(account => ({
        id: account.id,
        name: account.name,
        number: account.providerId.slice(-4).padStart(8, '*'),
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        lastUpdated: account.lastUpdated.toISOString(),
        status: account.status,
        institution: account.connection.institutionName
      }));

      console.log('Found accounts:', formattedAccounts);
      res.json(formattedAccounts);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
  });

  // Get account metrics
  router.get('/metrics', async (req, res) => {
    try {
      const accounts = await prisma.bankAccount.findMany();
      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      });

      // Calculate metrics
      const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      const activeAccounts = accounts.filter(a => a.status === 'active').length;
      const newAccounts = accounts.filter(a => 
        new Date(a.createdAt) > new Date(new Date().setMonth(new Date().getMonth() - 1))
      ).length;
      const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

      // Compare with previous month
      const prevMonthTransactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      });

      const prevMonthPending = prevMonthTransactions.filter(t => t.status === 'pending').length;
      const pendingTrend = pendingTransactions > prevMonthPending ? 'up' : 'down';
      const pendingChange = Math.abs(pendingTransactions - prevMonthPending);

      res.json({
        totalBalance,
        balanceTrend: 'up', // This should be calculated based on historical data
        balanceChange: '+5.2%', // This should be calculated based on historical data
        activeAccounts,
        newAccounts,
        pendingTransactions,
        pendingTrend,
        pendingChange: `${pendingChange} from last month`
      });
    } catch (error) {
      console.error('Error fetching account metrics:', error);
      res.status(500).json({ error: 'Failed to fetch account metrics' });
    }
  });

  // Get a single bank account
  router.get('/:id', async (req, res) => {
    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id: req.params.id },
        include: {
          connection: {
            select: {
              institutionName: true,
              status: true
            }
          }
        }
      });

      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }

      res.json({
        id: account.id,
        name: account.name,
        number: account.providerId.slice(-4).padStart(8, '*'),
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        lastUpdated: account.lastUpdated.toISOString(),
        status: account.status,
        institution: account.connection.institutionName
      });
    } catch (error) {
      console.error('Error fetching bank account:', error);
      res.status(500).json({ error: 'Failed to fetch bank account' });
    }
  });

  // Create a new bank account
  router.post('/', async (req, res) => {
    try {
      console.log('Creating bank account with data:', req.body);
      const { name, type, balance, currency, connectionId } = req.body;

      const account = await prisma.bankAccount.create({
        data: {
          name,
          type,
          balance,
          currency,
          status: 'active',
          lastUpdated: new Date(),
          providerId: Math.random().toString(36).substring(7), // Temporary provider ID
          connectionId
        }
      });

      console.log('Bank account created:', account);
      res.status(201).json(account);
    } catch (error) {
      console.error('Error creating bank account:', error);
      res.status(500).json({ error: 'Failed to create bank account', details: error.message });
    }
  });

  // Update a bank account
  router.put('/:id', async (req, res) => {
    try {
      const { name, status } = req.body;

      const account = await prisma.bankAccount.update({
        where: { id: req.params.id },
        data: { name, status }
      });

      res.json(account);
    } catch (error) {
      console.error('Error updating bank account:', error);
      res.status(500).json({ error: 'Failed to update bank account' });
    }
  });

  // Delete a bank account
  router.delete('/:id', async (req, res) => {
    try {
      await prisma.bankAccount.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      res.status(500).json({ error: 'Failed to delete bank account' });
    }
  });

  // Import transactions
  router.post('/:id/import', async (req, res) => {
    try {
      // This would handle file upload and transaction import logic
      // For now, just return success
      res.status(200).send();
    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ error: 'Failed to import transactions' });
    }
  });

  // Export accounts
  router.get('/export', async (req, res) => {
    try {
      const accounts = await prisma.bankAccount.findMany({
        include: {
          connection: {
            select: {
              institutionName: true
            }
          }
        }
      });

      // Convert accounts to CSV format
      const csv = accounts.map(account => [
        account.name,
        account.type,
        account.balance,
        account.currency,
        account.status,
        account.connection.institutionName,
        account.lastUpdated
      ].join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=accounts.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting accounts:', error);
      res.status(500).json({ error: 'Failed to export accounts' });
    }
  });

  return router;
};
