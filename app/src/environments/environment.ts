export const environment = {
  production: false,
  apiUrl: '/api',
  plaid: {
    env: 'sandbox',
    products: ['auth', 'transactions'],
    countryCodes: ['US', 'GB', 'IE'],
    language: 'en'
  },
  yodlee: {
    env: 'sandbox',
    fastlinkUrl: 'https://fl4.sandbox.yodlee.com/authenticate/restserver'
  }
};
