const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./middleware/auth');
const { importQueue } = require('./services/queue');
const fs = require('fs');
const path = require('path');
const prisma = require('./services/prisma');

dotenv.config();

const app = express();
app.use(cors());  // Allow all origins in development
app.use(express.json());

// Configure EJS template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure body parser limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure uploads directory
const uploadsDir = path.join(__dirname, 'uploads/imports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize queue processor
importQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

importQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

importQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

// Public routes (no auth middleware)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/engage/public', require('./routes/engage/public'));

// Protected routes
app.use('/api/settings', auth, require('./routes/settings'));
app.use('/api/crm', auth, require('./routes/crm'));
app.use('/api/products', auth, require('./routes/products'));
app.use('/api/links', auth, require('./routes/links'));
app.use('/api/engage', auth, require('./routes/engage'));

// Public resolver routes (no auth middleware)
app.use('/r', require('./routes/links/resolver'));
// Add direct shortlink resolver route
app.use('/', require('./routes/links/resolver'));
// Form and Survey resolvers
app.use('/r', require('./routes/engage/resolver'));
// Add direct form and survey resolver routes
app.use('/', require('./routes/engage/resolver'));

// Import response utilities
const { errorHandler } = require('./utils/responseUtils');

// Custom Prisma error handler middleware
app.use((err, req, res, next) => {
  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'A record with this identifier already exists'
        });
      case 'P2014': // Invalid ID
        return res.status(400).json({
          success: false,
          error: 'Invalid ID provided'
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: 'Referenced record does not exist'
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      default:
        // Pass to the standard error handler
        next(err);
        return;
    }
  }
  
  // Pass non-Prisma errors to the standard error handler
  next(err);
});

// Standard error handling middleware
app.use(errorHandler);

// Cleanup on shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    // Close database connections and queue
    await Promise.all([
      prisma.$disconnect(),
      importQueue.close()
    ]);
    
    // Clean up any temporary files
    const uploadsDir = 'uploads/';
    if (require('fs').existsSync(uploadsDir)) {
      require('fs').readdirSync(uploadsDir).forEach(file => {
        require('fs').unlinkSync(uploadsDir + file);
      });
    }
    
    console.log('Cleanup completed. Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('Unhandled Rejection');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Clink SaaS API server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Features enabled:');
  console.log('- Multi-tenant Architecture:');
  console.log('  • Tenant isolation');
  console.log('  • Company management');
  console.log('- Authentication & Authorization:');
  console.log('  • JWT-based authentication');
  console.log('  • Role-based access control');
  console.log('  • User management');
  console.log('- CRM Management:');
  console.log('  • Contact management');
  console.log('  • Deal tracking');
  console.log('  • Pipeline management');
  console.log('  • Activity tracking');
  console.log('- Product Management:');
  console.log('  • Product catalog');
  console.log('  • Categories & families');
  console.log('  • Attributes & variants');
  console.log('  • Media management');
  console.log('  • Import/Export capabilities');
  console.log('- Settings Management:');
  console.log('  • User settings');
  console.log('  • Company settings');
  console.log('  • Role management');
  console.log('  • Billing & subscription');
  console.log('- Data Management:');
  console.log('  • Import/Export capabilities');
  console.log('  • Background job processing');
});

// Export app for testing
module.exports = app;
