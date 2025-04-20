const { PrismaClient } = require('@prisma/client');

// Initialize PrismaClient with logging
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

// Export the singleton instance
module.exports = prisma;
