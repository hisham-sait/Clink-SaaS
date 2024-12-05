const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');

module.exports = (prisma, upload) => {
  // Reconciliation CRUD operations
  router.get('/', async (req, res) => {
    try {
      const { accountId, status, startDate, endDate } = req.query;
      const reconciliations = await prisma.reconciliation.findMany({
        where: {
          ...(accountId && { accountId }),
          ...(status && { status }),
          ...(startDate && { startDate: { gte: new Date(startDate) } }),
          ...(endDate && { endDate: { lte: new Date(endDate) } })
        },
        include: {
          account: true,
          transactions: true
        },
        orderBy: {
          startDate: 'desc'
        }
      });
      res.json(reconciliations);
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      res.status(500).json({ error: 'Failed to fetch reconciliations' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const reconciliation = await prisma.reconciliation.findUnique({
        where: { id: req.params.id },
        include: {
          account: true,
          transactions: {
            include: {
              category: true
            }
          }
        }
      });
      
      if (!reconciliation) {
        return res.status(404).json({ error: 'Reconciliation not found' });
      }

      res.json(reconciliation);
    } catch (error) {
      console.error('Error fetching reconciliation:', error);
      res.status(500).json({ error: 'Failed to fetch reconciliation' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const reconciliation = await prisma.reconciliation.create({
        data: {
          ...req.body,
          status: 'in_progress'
        },
        include: {
          account: true
        }
      });
      res.json(reconciliation);
    } catch (error) {
      console.error('Error creating reconciliation:', error);
      res.status(500).json({ error: 'Failed to create reconciliation' });
    }
  });

  // Transaction reconciliation
  router.get('/:id/transactions', async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          reconciliationId: req.params.id
        },
        include: {
          category: true,
          reconciliation: true
        },
        orderBy: {
          date: 'asc'
        }
      });
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching reconciliation transactions:', error);
      res.status(500).json({ error: 'Failed to fetch reconciliation transactions' });
    }
  });

  router.post('/:id/transactions/:transactionId/reconcile', async (req, res) => {
    try {
      await prisma.transaction.update({
        where: { id: req.params.transactionId },
        data: {
          reconciliationId: req.params.id
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error reconciling transaction:', error);
      res.status(500).json({ error: 'Failed to reconcile transaction' });
    }
  });

  router.post('/:id/transactions/:transactionId/unreconcile', async (req, res) => {
    try {
      await prisma.transaction.update({
        where: { id: req.params.transactionId },
        data: {
          reconciliationId: null
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error unreconciling transaction:', error);
      res.status(500).json({ error: 'Failed to unreconcile transaction' });
    }
  });

  router.post('/:id/transactions/bulk-reconcile', async (req, res) => {
    try {
      const { transactionIds } = req.body;
      await prisma.transaction.updateMany({
        where: {
          id: {
            in: transactionIds
          }
        },
        data: {
          reconciliationId: req.params.id
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error bulk reconciling transactions:', error);
      res.status(500).json({ error: 'Failed to bulk reconcile transactions' });
    }
  });

  // Reconciliation summary
  router.get('/:id/summary', async (req, res) => {
    try {
      const reconciliation = await prisma.reconciliation.findUnique({
        where: { id: req.params.id },
        include: {
          transactions: true,
          account: true
        }
      });

      if (!reconciliation) {
        return res.status(404).json({ error: 'Reconciliation not found' });
      }

      const summary = {
        totalTransactions: reconciliation.transactions.length,
        reconciledTransactions: reconciliation.transactions.filter(t => t.reconciliationId).length,
        unreconciledTransactions: reconciliation.transactions.filter(t => !t.reconciliationId).length,
        startBalance: reconciliation.startBalance,
        endBalance: reconciliation.endBalance,
        calculatedEndBalance: reconciliation.startBalance + reconciliation.transactions.reduce((sum, t) => 
          sum + (t.type === 'credit' ? t.amount : -t.amount), 0),
        difference: reconciliation.endBalance - (reconciliation.startBalance + 
          reconciliation.transactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)),
        lastReconciled: reconciliation.transactions
          .filter(t => t.reconciliationId)
          .sort((a, b) => b.date - a.date)[0]?.date
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching reconciliation summary:', error);
      res.status(500).json({ error: 'Failed to fetch reconciliation summary' });
    }
  });

  // Statement import
  router.post('/:id/import-statement', upload.single('statement'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results = {
        totalTransactions: 0,
        matchedTransactions: 0,
        unmatchedTransactions: 0
      };

      // Parse CSV file
      const parser = fs.createReadStream(req.file.path).pipe(csv({
        columns: true,
        skip_empty_lines: true
      }));

      for await (const record of parser) {
        results.totalTransactions++;

        // Try to match transaction
        const matchedTransaction = await findMatchingTransaction(record);
        if (matchedTransaction) {
          await prisma.transaction.update({
            where: { id: matchedTransaction.id },
            data: { reconciliationId: req.params.id }
          });
          results.matchedTransactions++;
        } else {
          results.unmatchedTransactions++;
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json(results);
    } catch (error) {
      console.error('Error importing statement:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to import statement' });
    }
  });

  // Transaction matching
  router.get('/:id/transactions/:transactionId/suggestions', async (req, res) => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: req.params.transactionId }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const suggestions = await findSimilarTransactions(transaction);
      res.json(suggestions);
    } catch (error) {
      console.error('Error finding transaction suggestions:', error);
      res.status(500).json({ error: 'Failed to find transaction suggestions' });
    }
  });

  // Auto-reconciliation
  router.post('/:id/auto-reconcile', async (req, res) => {
    try {
      const { matchCriteria, dateThreshold = 3, descriptionSimilarity = 0.8 } = req.body;

      const reconciliation = await prisma.reconciliation.findUnique({
        where: { id: req.params.id },
        include: {
          transactions: true
        }
      });

      if (!reconciliation) {
        return res.status(404).json({ error: 'Reconciliation not found' });
      }

      let matchedCount = 0;
      const totalTransactions = reconciliation.transactions.length;

      for (const transaction of reconciliation.transactions) {
        if (await autoMatchTransaction(transaction, matchCriteria, dateThreshold, descriptionSimilarity)) {
          matchedCount++;
        }
      }

      res.json({
        matchedTransactions: matchedCount,
        totalTransactions
      });
    } catch (error) {
      console.error('Error auto-reconciling:', error);
      res.status(500).json({ error: 'Failed to auto-reconcile' });
    }
  });

  // Reconciliation completion
  router.post('/:id/complete', async (req, res) => {
    try {
      const { notes } = req.body;
      const reconciliation = await prisma.reconciliation.update({
        where: { id: req.params.id },
        data: {
          status: 'completed',
          notes,
          updatedAt: new Date()
        },
        include: {
          account: true,
          transactions: true
        }
      });
      res.json(reconciliation);
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      res.status(500).json({ error: 'Failed to complete reconciliation' });
    }
  });

  // Helper functions
  async function findMatchingTransaction(record) {
    // Implement matching logic based on your CSV format and matching criteria
    return null;
  }

  async function findSimilarTransactions(transaction) {
    // Implement similarity search logic
    return [];
  }

  async function autoMatchTransaction(transaction, matchCriteria, dateThreshold, descriptionSimilarity) {
    // Implement auto-matching logic
    return false;
  }

  return router;
};
