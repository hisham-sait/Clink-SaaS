const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Encryption helpers
const encryptToken = (token) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(token, 'utf8', 'hex') + cipher.final('hex');
};

const decryptToken = (encrypted) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

// Import services
const plaidService = require('./services/plaid');
const yodleeService = require('./services/yodlee');

// Import route handlers
app.use('/api/banking/plaid', require('./routes/plaid')(plaidService, prisma, { encryptToken, decryptToken }));
app.use('/api/banking/yodlee', require('./routes/yodlee')(yodleeService, prisma, { encryptToken, decryptToken }));
app.use('/api/banking/connections', require('./routes/bank-connections')(prisma, { encryptToken, decryptToken }));
app.use('/api/banking/accounts', require('./routes/bank-accounts')(prisma));
app.use('/api/banking/transactions', require('./routes/transactions')(prisma));
app.use('/api/banking/categories', require('./routes/categories')(prisma));
app.use('/api/banking/alerts', require('./routes/balance-alerts')(prisma));
app.use('/api/banking/reconciliation', require('./routes/reconciliation')(prisma, upload));

// Statutory routes
app.use('/api/statutory', require('./routes/statutory'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start background workers
const { startCategorizationWorker } = require('./workers/categorization');
const { startBalanceAlertWorker } = require('./workers/balance-alerts');
const { startReconciliationWorker } = require('./workers/reconciliation');

// Start workers with error handling and retry
function startWorkerWithRetry(worker, name, retryDelay = 60000) {
  try {
    worker();
    console.log(`${name} worker started successfully`);
  } catch (error) {
    console.error(`Error starting ${name} worker:`, error);
    console.log(`Retrying ${name} worker in ${retryDelay / 1000} seconds...`);
    setTimeout(() => startWorkerWithRetry(worker, name), retryDelay);
  }
}

startWorkerWithRetry(startCategorizationWorker, 'Transaction Categorization');
startWorkerWithRetry(startBalanceAlertWorker, 'Balance Alert');
startWorkerWithRetry(startReconciliationWorker, 'Reconciliation');

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
  console.log('- Bank integration (Plaid & Yodlee)');
  console.log('- Transaction categorization');
  console.log('- Balance alerts');
  console.log('- Bank reconciliation');
  console.log('- Bank accounts management');
  console.log('- Statutory compliance management:');
  console.log('  • Directors and officers');
  console.log('  • Shareholders and shares');
  console.log('  • Beneficial owners');
  console.log('  • Charges and securities');
  console.log('  • Share allotments');
  console.log('  • Meetings and resolutions');
  console.log('  • Board minutes');
});

// Export app for testing
module.exports = app;
