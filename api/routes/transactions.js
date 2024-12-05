const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  // Get all transactions with pagination and filtering
  router.get('/', async (req, res) => {
    try {
      console.log('Fetching transactions with filters:', req.query);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter conditions
      const where = {};

      if (req.query.startDate) {
        where.date = {
          ...where.date,
          gte: new Date(req.query.startDate)
        };
      }

      if (req.query.endDate) {
        where.date = {
          ...where.date,
          lte: new Date(req.query.endDate)
        };
      }

      if (req.query.accountId) {
        where.accountId = req.query.accountId;
      }

      if (req.query.categoryId) {
        where.categoryId = req.query.categoryId;
      }

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.minAmount) {
        where.amount = {
          ...where.amount,
          gte: parseFloat(req.query.minAmount)
        };
      }

      if (req.query.maxAmount) {
        where.amount = {
          ...where.amount,
          lte: parseFloat(req.query.maxAmount)
        };
      }

      // Get total count for pagination
      const total = await prisma.transaction.count({ where });

      // Get transactions with pagination and filters
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              name: true,
              type: true
            }
          },
          category: {
            select: {
              name: true,
              type: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      });

      // Format transactions for frontend
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.date.toISOString(),
        description: transaction.description,
        reference: transaction.providerId,
        account: transaction.account.name,
        category: transaction.category?.type || 'Uncategorized',
        amount: transaction.amount,
        status: transaction.status,
        merchantName: transaction.merchantName,
        notes: transaction.notes,
        tags: transaction.tags
      }));

      console.log('Found transactions:', formattedTransactions);
      res.json({
        transactions: formattedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get transaction metrics
  router.get('/metrics', async (req, res) => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

      // Current month transactions
      const currentTransactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: lastMonth
          }
        }
      });

      // Previous month transactions for comparison
      const previousTransactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      });

      // Calculate metrics
      const totalInflow = currentTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalOutflow = currentTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const prevInflow = previousTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const prevOutflow = previousTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const inflowChange = prevInflow ? ((totalInflow - prevInflow) / prevInflow) * 100 : 0;
      const outflowChange = prevOutflow ? ((totalOutflow - prevOutflow) / prevOutflow) * 100 : 0;

      const pendingTransactions = currentTransactions.filter(t => t.status === 'pending').length;
      const prevPendingTransactions = previousTransactions.filter(t => t.status === 'pending').length;
      const pendingChange = pendingTransactions - prevPendingTransactions;

      res.json({
        totalInflow,
        inflowChange: `${inflowChange > 0 ? '+' : ''}${inflowChange.toFixed(1)}% from last month`,
        totalOutflow,
        outflowChange: `${outflowChange > 0 ? '+' : ''}${outflowChange.toFixed(1)}% from last month`,
        pendingTransactions,
        pendingTrend: pendingChange >= 0 ? 'up' : 'down',
        pendingChange: `${Math.abs(pendingChange)} from last month`
      });
    } catch (error) {
      console.error('Error fetching transaction metrics:', error);
      res.status(500).json({ error: 'Failed to fetch transaction metrics' });
    }
  });

  // Get a single transaction
  router.get('/:id', async (req, res) => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: req.params.id },
        include: {
          account: {
            select: {
              name: true,
              type: true
            }
          },
          category: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({
        id: transaction.id,
        date: transaction.date.toISOString(),
        description: transaction.description,
        reference: transaction.providerId,
        account: transaction.account.name,
        category: transaction.category?.type || 'Uncategorized',
        amount: transaction.amount,
        status: transaction.status,
        merchantName: transaction.merchantName,
        notes: transaction.notes,
        tags: transaction.tags
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  });

  // Create a new transaction
  router.post('/', async (req, res) => {
    try {
      console.log('Creating transaction with data:', req.body);
      const { accountId, amount, date, description, categoryId, status, merchantName, notes, tags } = req.body;

      // Get the bank account to get its connection ID
      const account = await prisma.bankAccount.findUnique({
        where: { id: accountId },
        select: { connectionId: true }
      });

      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }

      const transaction = await prisma.transaction.create({
        data: {
          providerId: Math.random().toString(36).substring(7), // Temporary provider ID
          amount,
          date: new Date(date),
          description,
          status,
          merchantName,
          notes,
          tags: tags || [],
          type: amount > 0 ? 'credit' : 'debit',
          currency: 'USD', // Default currency
          account: {
            connect: { id: accountId }
          },
          connection: {
            connect: { id: account.connectionId }
          },
          ...(categoryId && {
            category: {
              connect: { id: categoryId }
            }
          })
        },
        include: {
          account: {
            select: {
              name: true,
              type: true
            }
          },
          category: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });

      console.log('Transaction created:', transaction);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
  });

  // Update a transaction
  router.put('/:id', async (req, res) => {
    try {
      const { categoryId, status, notes, tags } = req.body;

      const transaction = await prisma.transaction.update({
        where: { id: req.params.id },
        data: {
          ...(categoryId && {
            category: {
              connect: { id: categoryId }
            }
          }),
          status,
          notes,
          tags: tags || []
        },
        include: {
          account: {
            select: {
              name: true,
              type: true
            }
          },
          category: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });

      res.json(transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  });

  // Delete a transaction
  router.delete('/:id', async (req, res) => {
    try {
      await prisma.transaction.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });

  // Import transactions
  router.post('/import', async (req, res) => {
    try {
      const { accountId, transactions } = req.body;

      // Get the bank account to get its connection ID
      const account = await prisma.bankAccount.findUnique({
        where: { id: accountId },
        select: { connectionId: true }
      });

      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }

      // Create transactions in bulk
      const createdTransactions = await prisma.transaction.createMany({
        data: transactions.map(t => ({
          accountId,
          connectionId: account.connectionId,
          providerId: Math.random().toString(36).substring(7), // Temporary provider ID
          amount: t.amount,
          date: new Date(t.date),
          description: t.description,
          status: t.status || 'pending',
          merchantName: t.merchantName,
          type: t.amount > 0 ? 'credit' : 'debit',
          currency: 'USD', // Default currency
          tags: t.tags || []
        }))
      });

      res.status(201).json({ 
        message: `Successfully imported ${createdTransactions.count} transactions` 
      });
    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ error: 'Failed to import transactions' });
    }
  });

  // Export transactions
  router.get('/export', async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          account: {
            select: {
              name: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // CSV header
      const header = [
        'Date',
        'Description',
        'Account',
        'Category',
        'Amount',
        'Status',
        'Merchant Name',
        'Notes',
        'Tags'
      ].join(',');

      // Convert transactions to CSV format
      const rows = transactions.map(t => [
        t.date.toISOString(),
        t.description,
        t.account.name,
        t.category?.name || 'Uncategorized',
        t.amount,
        t.status,
        t.merchantName || '',
        t.notes || '',
        t.tags?.join(';') || ''
      ].join(','));

      // Combine header and rows
      const csv = [header, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      res.status(500).json({ error: 'Failed to export transactions' });
    }
  });

  return router;
};
