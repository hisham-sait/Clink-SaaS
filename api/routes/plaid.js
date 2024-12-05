const express = require('express');
const router = express.Router();

module.exports = (plaidService, prisma, { encryptToken, decryptToken }) => {
  // Initialize connection
  router.post('/initialize', async (req, res) => {
    try {
      const linkToken = await plaidService.createLinkToken();
      res.json({ linkToken });
    } catch (error) {
      console.error('Error initializing Plaid:', error);
      res.status(500).json({ error: 'Failed to initialize Plaid connection' });
    }
  });

  // Exchange public token
  router.post('/exchange-token', async (req, res) => {
    try {
      const { publicToken, institutionId, institutionName } = req.body;
      
      // Exchange public token for access token
      const accessToken = await plaidService.exchangePublicToken(publicToken);
      const encryptedToken = encryptToken(accessToken);

      // Create bank connection record
      const connection = await prisma.bankConnection.create({
        data: {
          institutionId,
          institutionName,
          provider: 'plaid',
          status: 'connected',
          accessToken: encryptedToken,
          lastSynced: new Date()
        }
      });

      res.json({ success: true, connectionId: connection.id });
    } catch (error) {
      console.error('Error exchanging Plaid token:', error);
      res.status(500).json({ error: 'Failed to complete Plaid connection' });
    }
  });

  // Sync accounts
  router.post('/sync/:connectionId', async (req, res) => {
    try {
      const { connectionId } = req.params;
      
      const connection = await prisma.bankConnection.findUnique({
        where: { id: connectionId }
      });

      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      const accessToken = decryptToken(connection.accessToken);
      
      // Get accounts from Plaid
      const accounts = await plaidService.getAccounts(accessToken);
      
      // Update or create accounts in database
      for (const account of accounts) {
        await prisma.bankAccount.upsert({
          where: {
            providerId: account.account_id
          },
          update: {
            balance: account.balances.current,
            lastUpdated: new Date()
          },
          create: {
            providerId: account.account_id,
            name: account.name,
            type: account.type,
            subtype: account.subtype,
            balance: account.balances.current,
            currency: account.balances.iso_currency_code,
            status: 'active',
            lastUpdated: new Date(),
            connectionId: connection.id
          }
        });
      }

      // Update connection last synced time
      await prisma.bankConnection.update({
        where: { id: connectionId },
        data: { lastSynced: new Date() }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error syncing Plaid accounts:', error);
      res.status(500).json({ error: 'Failed to sync accounts' });
    }
  });

  // Webhook handler
  router.post('/webhook', async (req, res) => {
    try {
      const { webhook_type, webhook_code, item_id } = req.body;

      // Log webhook for debugging
      console.log('Received Plaid webhook:', {
        type: webhook_type,
        code: webhook_code,
        itemId: item_id
      });

      // Handle different webhook types
      switch (webhook_type) {
        case 'TRANSACTIONS':
          // Handle transaction updates
          break;
        case 'HOLDINGS':
          // Handle investment holdings updates
          break;
        case 'INVESTMENTS_TRANSACTIONS':
          // Handle investment transactions
          break;
        case 'INCOME':
          // Handle income updates
          break;
        case 'AUTH':
          // Handle auth updates
          break;
        case 'ASSETS':
          // Handle asset report updates
          break;
        case 'LIABILITIES':
          // Handle liabilities updates
          break;
        case 'PAYMENT_INITIATION':
          // Handle payment updates
          break;
        default:
          console.log('Unhandled webhook type:', webhook_type);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing Plaid webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  return router;
};
