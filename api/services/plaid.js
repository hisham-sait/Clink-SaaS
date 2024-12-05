const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

class PlaidService {
  constructor() {
    const config = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    this.client = new PlaidApi(config);
  }

  async createLinkToken() {
    try {
      const configs = {
        user: { client_user_id: 'user-' + Math.random() },
        client_name: 'Bradán Accountants',
        products: ['auth', 'transactions'],
        country_codes: ['US', 'GB', 'IE'],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL
      };

      const response = await this.client.linkTokenCreate(configs);
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw new Error('Failed to create link token');
    }
  }

  async exchangePublicToken(publicToken) {
    try {
      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken
      });

      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to exchange public token');
    }
  }

  async getAccounts(accessToken) {
    try {
      const response = await this.client.accountsGet({
        access_token: accessToken
      });

      return response.data.accounts;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error('Failed to get accounts');
    }
  }

  async getTransactions(accessToken, startDate, endDate) {
    try {
      const response = await this.client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate
      });

      return response.data.transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  async refreshTransactions(accessToken) {
    try {
      await this.client.transactionsRefresh({
        access_token: accessToken
      });
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      throw new Error('Failed to refresh transactions');
    }
  }

  async getInstitution(institutionId) {
    try {
      const response = await this.client.institutionsGetById({
        institution_id: institutionId,
        country_codes: ['US', 'GB', 'IE']
      });

      return response.data.institution;
    } catch (error) {
      console.error('Error getting institution:', error);
      throw new Error('Failed to get institution');
    }
  }

  async removeItem(accessToken) {
    try {
      await this.client.itemRemove({
        access_token: accessToken
      });
    } catch (error) {
      console.error('Error removing item:', error);
      throw new Error('Failed to remove item');
    }
  }
}

module.exports = new PlaidService();
