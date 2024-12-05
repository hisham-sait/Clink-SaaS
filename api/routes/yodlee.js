const express = require('express');
const router = express.Router();

module.exports = (yodleeService, prisma, { encryptToken, decryptToken }) => {
  // Initialize FastLink session
  router.post('/initialize', async (req, res) => {
    try {
      const fastlinkToken = await yodleeService.createFastLinkToken();
      res.json({ fastlinkToken });
    } catch (error) {
      console.error('Error initializing Yodlee:', error);
      res.status(500).json({ error: 'Failed to initialize Yodlee connection' });
    }
  });

  // Handle FastLink callback
  router.post('/callback', async (req, res) => {
    try {
      const { providerAccountId, providerId, providerName } = req.body;
      
      // Get access tokens from Yodlee
      const accessTokens = await yodleeService.getAccessTokens(providerAccountId);
      const encryptedTokens = encryptToken(JSON.stringify(accessTokens));

      // Create bank connection record
      const connection = await prisma.bankConnection.create({
        data: {
          institutionId: providerId,
          institutionName: providerName,
          provider: 'yodlee',
          status: 'connected',
          accessToken: encryptedTokens,
          lastSynced: new Date()
        }
      });

      res.json({ success: true, connectionId: connection.id });
    } catch (error) {
      console.error('Error handling Yodlee callback:', error);
      res.status(500).json({ error: 'Failed to complete Yodlee connection' });
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

      const accessTokens = JSON.parse(decryptToken(connection.accessToken));
      
      // Get accounts from Yodlee
      const accounts = await yodleeService.getAccounts(accessTokens);
      
      // Update or create accounts in database
      for (const account of accounts) {
        await prisma.bankAccount.upsert({
          where: {
            providerId: account.id.toString()
          },
          update: {
            balance: account.balance.amount,
            lastUpdated: new Date()
          },
          create: {
            providerId: account.id.toString(),
            name: account.accountName,
            type: account.accountType,
            subtype: account.accountSubType,
            balance: account.balance.amount,
            currency: account.balance.currency,
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
      console.error('Error syncing Yodlee accounts:', error);
      res.status(500).json({ error: 'Failed to sync accounts' });
    }
  });

  // Webhook handler
  router.post('/webhook', async (req, res) => {
    try {
      const { event } = req.body;

      // Log webhook for debugging
      console.log('Received Yodlee webhook:', event);

      // Handle different event types
      switch (event.type) {
        case 'REFRESH':
          // Handle refresh status updates
          break;
        case 'DATA_UPDATES':
          // Handle data updates
          break;
        case 'AUTO_REFRESH_UPDATES':
          // Handle auto refresh updates
          break;
        default:
          console.log('Unhandled webhook type:', event.type);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing Yodlee webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  return router;
};
