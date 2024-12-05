const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stringSimilarity = require('string-similarity');

async function startReconciliationWorker() {
  console.log('Starting reconciliation worker...');
  
  setInterval(async () => {
    try {
      // Get in-progress reconciliations
      const reconciliations = await prisma.reconciliation.findMany({
        where: {
          status: 'in_progress'
        },
        include: {
          account: true,
          transactions: {
            where: {
              reconciliationId: null
            }
          }
        }
      });

      for (const reconciliation of reconciliations) {
        await processReconciliation(reconciliation);
      }
    } catch (error) {
      console.error('Error in reconciliation worker:', error);
    }
  }, 300000); // Run every 5 minutes
}

async function processReconciliation(reconciliation) {
  try {
    // Get unreconciled transactions for the account within the date range
    const bankTransactions = await prisma.transaction.findMany({
      where: {
        accountId: reconciliation.accountId,
        date: {
          gte: reconciliation.startDate,
          lte: reconciliation.endDate
        },
        reconciliationId: null
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get statement transactions
    const statementTransactions = reconciliation.transactions;

    // Find potential matches
    const matches = findPotentialMatches(bankTransactions, statementTransactions);

    // Auto-reconcile high confidence matches
    await autoReconcileMatches(reconciliation.id, matches);

    // Update reconciliation status
    await updateReconciliationStatus(reconciliation);
  } catch (error) {
    console.error('Error processing reconciliation:', error);
  }
}

function findPotentialMatches(bankTransactions, statementTransactions) {
  const matches = [];

  for (const bankTx of bankTransactions) {
    const potentialMatches = statementTransactions
      .map(statementTx => {
        const score = calculateMatchScore(bankTx, statementTx);
        return { bankTx, statementTx, score };
      })
      .filter(match => match.score > 0.5) // Minimum confidence threshold
      .sort((a, b) => b.score - a.score);

    if (potentialMatches.length > 0) {
      matches.push(potentialMatches[0]);
    }
  }

  return matches;
}

function calculateMatchScore(bankTx, statementTx) {
  let score = 0;

  // Exact amount match (highest weight)
  if (Math.abs(bankTx.amount - statementTx.amount) < 0.01) {
    score += 0.5;
  }

  // Date proximity (within 3 days)
  const dateDiff = Math.abs(bankTx.date - statementTx.date) / (1000 * 60 * 60 * 24);
  if (dateDiff <= 3) {
    score += 0.3 * (1 - dateDiff / 3);
  }

  // Description similarity
  const descriptionSimilarity = stringSimilarity.compareTwoStrings(
    bankTx.description.toLowerCase(),
    statementTx.description.toLowerCase()
  );
  score += 0.2 * descriptionSimilarity;

  return score;
}

async function autoReconcileMatches(reconciliationId, matches) {
  const highConfidenceMatches = matches.filter(match => match.score > 0.9);

  for (const match of highConfidenceMatches) {
    await prisma.transaction.update({
      where: { id: match.bankTx.id },
      data: { reconciliationId }
    });
  }
}

async function updateReconciliationStatus(reconciliation) {
  const unreconciledCount = await prisma.transaction.count({
    where: {
      accountId: reconciliation.accountId,
      date: {
        gte: reconciliation.startDate,
        lte: reconciliation.endDate
      },
      reconciliationId: null
    }
  });

  const reconciledTransactions = await prisma.transaction.findMany({
    where: {
      reconciliationId: reconciliation.id
    }
  });

  const totalReconciled = reconciledTransactions.reduce((sum, tx) => 
    sum + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);

  const difference = Math.abs(
    reconciliation.endBalance - (reconciliation.startBalance + totalReconciled)
  );

  const status = unreconciledCount === 0
    ? (difference < 0.01 ? 'completed' : 'discrepancy')
    : 'in_progress';

  await prisma.reconciliation.update({
    where: { id: reconciliation.id },
    data: { status }
  });
}

// Helper function to find similar transactions for suggestions
async function findSimilarTransactions(transaction, options = {}) {
  const {
    dateThreshold = 3,
    amountThreshold = 0.01,
    descriptionThreshold = 0.7,
    limit = 5
  } = options;

  const startDate = new Date(transaction.date);
  startDate.setDate(startDate.getDate() - dateThreshold);
  
  const endDate = new Date(transaction.date);
  endDate.setDate(endDate.getDate() + dateThreshold);

  const similarTransactions = await prisma.transaction.findMany({
    where: {
      accountId: transaction.accountId,
      date: {
        gte: startDate,
        lte: endDate
      },
      id: {
        not: transaction.id
      }
    }
  });

  return similarTransactions
    .map(tx => {
      const amountMatch = Math.abs(tx.amount - transaction.amount) < amountThreshold;
      const descriptionSimilarity = stringSimilarity.compareTwoStrings(
        tx.description.toLowerCase(),
        transaction.description.toLowerCase()
      );
      
      return {
        transaction: tx,
        similarity: (
          (amountMatch ? 0.6 : 0) +
          (descriptionSimilarity > descriptionThreshold ? 0.4 * descriptionSimilarity : 0)
        )
      };
    })
    .filter(result => result.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(result => result.transaction);
}

module.exports = {
  startReconciliationWorker,
  findSimilarTransactions
};
