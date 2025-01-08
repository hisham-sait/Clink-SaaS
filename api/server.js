const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(cors());  // Allow all origins in development
app.use(express.json());

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],  // Enable logging for debugging
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
    // Close database connections
    await prisma.$disconnect();
    
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
});

// Export app for testing
module.exports = app;
