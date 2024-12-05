export const environment = {
  production: true,
  apiUrl: '/api',
  plaid: {
    env: 'production',
    products: ['auth', 'transactions'],
    countryCodes: ['US', 'GB', 'IE'],
    language: 'en'
  },
  yodlee: {
    env: 'production',
    fastlinkUrl: 'https://node.yodlee.com/authenticate/restserver'
  }
};
