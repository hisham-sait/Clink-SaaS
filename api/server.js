const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./middleware/auth');
const { importQueue } = require('./services/queue');

dotenv.config();

const app = express();
app.use(cors());  // Allow all origins in development
app.use(express.json());

// Configure body parser limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure uploads directory
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads/imports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Remove express-fileupload as we're using multer for file uploads

// Configure Prisma with better error logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

// Add Prisma logging events
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

prisma.$on('warn', (e) => {
  console.warn('Prisma Warning:', e);
});

prisma.$on('info', (e) => {
  console.info('Prisma Info:', e);
});

prisma.$on('query', (e) => {
  console.log('Prisma Query:', e);
});

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

// Public auth routes (no auth middleware)
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/statutory', auth, require('./routes/statutory'));
app.use('/api/settings', auth, require('./routes/settings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
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
          error: 'Database error occurred',
          details: process.env.NODE_ENV === 'development' ? err : undefined
        });
    }
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

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
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Features enabled:');
  console.log('- Authentication:');
  console.log('  • Login');
  console.log('  • Registration');
  console.log('  • Password reset');
  console.log('- Statutory compliance management:');
  console.log('  • Directors and officers');
  console.log('  • Shareholders and shares');
  console.log('  • Beneficial owners');
  console.log('  • Charges and securities');
  console.log('  • Share allotments');
  console.log('  • Meetings and resolutions');
  console.log('  • Board minutes');
  console.log('- Settings management:');
  console.log('  • User management');
  console.log('  • Role management');
  console.log('  • Company management');
  console.log('  • Security settings');
  console.log('  • Preferences');
  console.log('  • Integrations');
  console.log('  • Billing');
  console.log('  • Notifications');
  console.log('- Import/Export:');
  console.log('  • Queue processor initialized');
});

// Export app for testing
module.exports = app;
