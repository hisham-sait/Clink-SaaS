const axios = require('axios');

class YodleeService {
  constructor() {
    this.apiUrl = process.env.YODLEE_API_URL;
    this.clientId = process.env.YODLEE_CLIENT_ID;
    this.secret = process.env.YODLEE_SECRET;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getAuthToken() {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${this.apiUrl}/auth/token`, {
        clientId: this.clientId,
        secret: this.secret
      });

      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      return this.token;
    } catch (error) {
      console.error('Error getting Yodlee auth token:', error);
      throw new Error('Failed to authenticate with Yodlee');
    }
  }

  async getFastLinkToken() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.post(
        `${this.apiUrl}/fastlink/token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        token: response.data.token,
        fastLinkUrl: process.env.YODLEE_FASTLINK_URL
      };
    } catch (error) {
      console.error('Error getting FastLink token:', error);
      throw new Error('Failed to get FastLink token');
    }
  }

  async getAccounts(providerAccountId) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.apiUrl}/accounts`,
        {
          params: { providerAccountId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.account;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error('Failed to get accounts');
    }
  }

  async getTransactions(accountId, fromDate, toDate) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.apiUrl}/transactions`,
        {
          params: {
            accountId,
            fromDate,
            toDate
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.transaction;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  async refreshAccount(providerAccountId) {
    try {
      const token = await this.getAuthToken();
      await axios.post(
        `${this.apiUrl}/refresh`,
        {
          providerAccountId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error refreshing account:', error);
      throw new Error('Failed to refresh account');
    }
  }

  async deleteAccount(providerAccountId) {
    try {
      const token = await this.getAuthToken();
      await axios.delete(
        `${this.apiUrl}/providerAccounts/${providerAccountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  }
}

module.exports = new YodleeService();
