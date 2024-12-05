const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function startCategorizationWorker() {
  console.log('Starting transaction categorization worker...');
  
  setInterval(async () => {
    try {
      // Get uncategorized transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          categoryId: null
        },
        take: 100 // Process in batches
      });

      if (transactions.length === 0) {
        return;
      }

      // Get active category rules
      const rules = await prisma.categoryRule.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          priority: 'desc'
        },
        include: {
          category: true
        }
      });

      // Process each transaction
      for (const transaction of transactions) {
        for (const rule of rules) {
          if (matchesRule(transaction, rule)) {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { categoryId: rule.categoryId }
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error in categorization worker:', error);
    }
  }, 60000); // Run every minute
}

function matchesRule(transaction, rule) {
  // Check pattern match
  if (rule.pattern) {
    const regex = new RegExp(rule.pattern, 'i');
    if (!regex.test(transaction.description)) {
      return false;
    }
  }

  // Check merchant name
  if (rule.merchantName && rule.merchantName.toLowerCase() !== transaction.merchantName?.toLowerCase()) {
    return false;
  }

  // Check amount range
  const amount = Math.abs(transaction.amount);
  if (rule.minAmount && amount < rule.minAmount) {
    return false;
  }
  if (rule.maxAmount && amount > rule.maxAmount) {
    return false;
  }

  return true;
}

module.exports = {
  startCategorizationWorker
};
