const express = require('express');
const router = express.Router();

// Import all settings routes
const rolesRouter = require('./roles');
const usersRouter = require('./users');
const companiesRouter = require('./companies');
const plansRouter = require('./plans');
const billingRouter = require('./billing');

// Mount routes
router.use('/roles', rolesRouter);
router.use('/users', usersRouter);
router.use('/companies', companiesRouter);
router.use('/plans', plansRouter);
router.use('/billing', billingRouter);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  
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
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'Record not found'
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
