const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  // Category CRUD operations
  router.get('/', async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          subcategories: true
        }
      });
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const category = await prisma.category.create({
        data: req.body
      });
      res.json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const category = await prisma.category.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await prisma.category.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Category Rules
  router.get('/rules', async (req, res) => {
    try {
      const rules = await prisma.categoryRule.findMany({
        include: {
          category: true
        }
      });
      res.json(rules);
    } catch (error) {
      console.error('Error fetching category rules:', error);
      res.status(500).json({ error: 'Failed to fetch category rules' });
    }
  });

  router.post('/rules', async (req, res) => {
    try {
      const rule = await prisma.categoryRule.create({
        data: req.body,
        include: {
          category: true
        }
      });
      res.json(rule);
    } catch (error) {
      console.error('Error creating category rule:', error);
      res.status(500).json({ error: 'Failed to create category rule' });
    }
  });

  // Transaction categorization
  router.post('/transactions/:id/categorize', async (req, res) => {
    try {
      const { categoryId } = req.body;
      await prisma.transaction.update({
        where: { id: req.params.id },
        data: { categoryId }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      res.status(500).json({ error: 'Failed to categorize transaction' });
    }
  });

  router.post('/transactions/bulk-categorize', async (req, res) => {
    try {
      const { transactionIds, categoryId } = req.body;
      await prisma.$transaction(
        transactionIds.map(id => 
          prisma.transaction.update({
            where: { id },
            data: { categoryId }
          })
        )
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error bulk categorizing transactions:', error);
      res.status(500).json({ error: 'Failed to bulk categorize transactions' });
    }
  });

  // Auto-categorization
  router.post('/transactions/:id/apply-rules', async (req, res) => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: req.params.id }
      });

      const rules = await prisma.categoryRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
        include: { category: true }
      });

      for (const rule of rules) {
        if (matchesRule(transaction, rule)) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { categoryId: rule.categoryId }
          });
          break;
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error applying rules to transaction:', error);
      res.status(500).json({ error: 'Failed to apply rules to transaction' });
    }
  });

  // Category management
  router.post('/:id/merge', async (req, res) => {
    try {
      const { sourceIds } = req.body;
      const targetId = req.params.id;

      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { categoryId: { in: sourceIds } },
          data: { categoryId: targetId }
        }),
        prisma.categoryRule.updateMany({
          where: { categoryId: { in: sourceIds } },
          data: { categoryId: targetId }
        }),
        prisma.category.deleteMany({
          where: { id: { in: sourceIds } }
        })
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error merging categories:', error);
      res.status(500).json({ error: 'Failed to merge categories' });
    }
  });

  // Helper function to match transaction against rule
  function matchesRule(transaction, rule) {
    if (rule.pattern && !new RegExp(rule.pattern, 'i').test(transaction.description)) {
      return false;
    }
    if (rule.merchantName && rule.merchantName.toLowerCase() !== transaction.merchantName?.toLowerCase()) {
      return false;
    }
    if (rule.minAmount && transaction.amount < rule.minAmount) {
      return false;
    }
    if (rule.maxAmount && transaction.amount > rule.maxAmount) {
      return false;
    }
    return true;
  }

  return router;
};
