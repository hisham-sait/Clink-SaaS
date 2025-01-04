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

// Mount routes
router.use('/directors', directorsRouter);
router.use('/shareholders', shareholdersRouter);
router.use('/shares', sharesRouter);
router.use('/beneficial-owners', beneficialOwnersRouter);
router.use('/charges', chargesRouter);
router.use('/allotments', allotmentsRouter);
router.use('/meetings', meetingsRouter);
router.use('/board-minutes', boardMinutesRouter);

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
