const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Import sub-routers
const contactsRouter = require('./contacts');
const clientsRouter = require('./clients');
const activitiesRouter = require('./activities');
const organisationsRouter = require('./organisations');
const pipelinesRouter = require('./pipelines');
const dealsRouter = require('./deals');
const automationsRouter = require('./automations');
const formsRouter = require('./forms');
const productsRouter = require('./products');
const proposalsRouter = require('./proposals');

// Apply auth middleware to all CRM routes
router.use(auth);

// Add logging middleware
router.use((req, res, next) => {
  console.log(`[CRM] ${req.method} ${req.originalUrl}`);
  next();
});

// Company validation middleware
router.use((req, res, next) => {
  // Super admin and platform admin can access without company selection
  if (req.user?.roles.includes('super_admin') || req.user?.roles.includes('platform_admin')) {
    // If companyId is provided in URL params, use it, otherwise allow access to all companies
    req.user.companyId = req.params.companyId || null;
    return next();
  }

  // For other roles, company selection is required
  if (!req.user?.companyId) {
    console.error('[CRM Error]: No company selected for user', {
      userId: req.user?.id,
      userRoles: req.user?.roles,
      userCompanyId: req.user?.companyId
    });
    return res.status(400).json({
      error: 'Company Required',
      message: 'Please ensure you have selected a company in your profile settings to access CRM records'
    });
  }
  next();
});

// Use sub-routers
router.use('/contacts', contactsRouter);
router.use('/clients', clientsRouter);
router.use('/activities', activitiesRouter);
router.use('/organisations', organisationsRouter);
router.use('/pipelines', pipelinesRouter);
router.use('/deals', dealsRouter);
router.use('/automations', automationsRouter);
router.use('/forms', formsRouter);
router.use('/products', productsRouter);
router.use('/proposals', proposalsRouter);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('[CRM Error]:', err);
  
  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: 'A record with this identifier already exists'
        });
      case 'P2014': // Invalid ID
        return res.status(400).json({
          error: 'Invalid ID provided'
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          error: 'Referenced record does not exist'
        });
      default:
        return res.status(500).json({
          error: 'Database error occurred'
        });
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'An unexpected error occurred'
  });
});

module.exports = router;
