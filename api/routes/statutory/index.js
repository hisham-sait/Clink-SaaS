const express = require('express');
const router = express.Router();

// Import all statutory routes
const directorsRouter = require('./directors');
const shareholdersRouter = require('./shareholders');
const sharesRouter = require('./shares');
const beneficialOwnersRouter = require('./beneficial-owners');
const chargesRouter = require('./charges');
const allotmentsRouter = require('./allotments');
const meetingsRouter = require('./meetings');
const boardMinutesRouter = require('./board-minutes');
const activitiesRouter = require('./activities');

// Mount routes
router.use('/directors', directorsRouter);
router.use('/shareholders', shareholdersRouter);
router.use('/shares', sharesRouter);
router.use('/beneficial-owners', beneficialOwnersRouter);
router.use('/charges', chargesRouter);
router.use('/allotments', allotmentsRouter);
router.use('/meetings', meetingsRouter);
router.use('/board-minutes', boardMinutesRouter);
router.use('/activities', activitiesRouter);

// Add logging middleware
router.use((req, res, next) => {
  console.log(`[Statutory] ${req.method} ${req.originalUrl}`);
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
    console.error('[Statutory Error]: No company selected for user', {
      userId: req.user?.id,
      userRoles: req.user?.roles,
      userCompanyId: req.user?.companyId
    });
    return res.status(400).json({
      error: 'Company Required',
      message: 'Please ensure you have selected a company in your profile settings to access statutory records'
    });
  }
  next();
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('[Statutory Error]:', err);
  
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
