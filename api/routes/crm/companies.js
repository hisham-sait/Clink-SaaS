const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get all companies for a company
router.get('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;

    const where = {
      companyId,
      ...(status && status !== 'All' ? { status } : {})
    };

    const companies = await prisma.crmCompany.findMany({ where });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Create a new company
router.post('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await prisma.crmCompany.create({
      data: {
        ...req.body,
        companyId
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'added',
        entityType: 'company',
        entityId: company.id,
        description: `Added new company: ${company.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update a company
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const company = await prisma.crmCompany.update({
      where: { id },
      data: req.body
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'updated',
        entityType: 'company',
        entityId: company.id,
        description: `Updated company: ${company.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete a company
router.delete('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const company = await prisma.crmCompany.delete({
      where: { id }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'removed',
        entityType: 'company',
        entityId: id,
        description: `Deleted company: ${company.name}`,
        user: req.user.email,
        companyId
      }
    });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Export companies
router.get('/:companyId/export/:type', auth, async (req, res) => {
  try {
    const { companyId, type } = req.params;
    const companies = await prisma.crmCompany.findMany({
      where: { companyId }
    });

    // TODO: Implement export logic based on type (pdf/excel)
    res.json(companies);
  } catch (error) {
    console.error('Error exporting companies:', error);
    res.status(500).json({ error: 'Failed to export companies' });
  }
});

// Import companies template
router.get('/import/template', auth, (req, res) => {
  // TODO: Implement template download
  res.json({ message: 'Template download endpoint' });
});

// Import companies
router.post('/:companyId/import', auth, async (req, res) => {
  try {
    // TODO: Implement import logic
    res.json({ message: 'Import successful' });
  } catch (error) {
    console.error('Error importing companies:', error);
    res.status(500).json({ error: 'Failed to import companies' });
  }
});

module.exports = router;
