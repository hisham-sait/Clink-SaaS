const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create bank connection
  const connection = await prisma.bankConnection.create({
    data: {
      institutionId: 'ins_123',
      institutionName: 'Bank of Ireland',
      provider: 'plaid',
      status: 'connected',
      accessToken: 'mock_token',
      itemId: 'item_123',
      lastSynced: new Date(),
      userId: 'user_123',
      metadata: {}
    }
  });

  // Create bank account
  const account = await prisma.bankAccount.create({
    data: {
      providerId: 'acc_123',
      name: 'Business Current Account',
      type: 'checking',
      balance: 25000.00,
      currency: 'EUR',
      lastUpdated: new Date(),
      status: 'active',
      connectionId: connection.id
    }
  });

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Income', type: 'income', color: '#38a169', icon: 'bi-arrow-down-circle' },
      { name: 'Expenses', type: 'expense', color: '#e53e3e', icon: 'bi-arrow-up-circle' },
      { name: 'Transfer', type: 'transfer', color: '#4299e1', icon: 'bi-arrow-left-right' }
    ]
  });

  // Get created categories
  const [incomeCategory, expenseCategory, transferCategory] = await prisma.category.findMany();

  // Create mock transactions
  const transactions = [
    {
      providerId: 'tx_1',
      amount: 5000.00,
      date: new Date('2024-01-15'),
      description: 'Client Payment - ABC Corp',
      type: 'credit',
      status: 'cleared',
      merchantName: 'ABC Corporation',
      categoryId: incomeCategory.id
    },
    {
      providerId: 'tx_2',
      amount: -1200.00,
      date: new Date('2024-01-16'),
      description: 'Office Rent',
      type: 'debit',
      status: 'cleared',
      merchantName: 'Property Management Ltd',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_3',
      amount: -450.00,
      date: new Date('2024-01-17'),
      description: 'Utilities Payment',
      type: 'debit',
      status: 'cleared',
      merchantName: 'Electric Ireland',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_4',
      amount: 3500.00,
      date: new Date('2024-01-18'),
      description: 'Consulting Services - XYZ Ltd',
      type: 'credit',
      status: 'cleared',
      merchantName: 'XYZ Limited',
      categoryId: incomeCategory.id
    },
    {
      providerId: 'tx_5',
      amount: -800.00,
      date: new Date('2024-01-19'),
      description: 'Software Licenses',
      type: 'debit',
      status: 'cleared',
      merchantName: 'Software Co',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_6',
      amount: -2500.00,
      date: new Date('2024-01-20'),
      description: 'Marketing Campaign',
      type: 'debit',
      status: 'pending',
      merchantName: 'Digital Marketing Agency',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_7',
      amount: 7500.00,
      date: new Date('2024-01-21'),
      description: 'Project Payment - DEF Industries',
      type: 'credit',
      status: 'cleared',
      merchantName: 'DEF Industries',
      categoryId: incomeCategory.id
    },
    {
      providerId: 'tx_8',
      amount: -1500.00,
      date: new Date('2024-01-22'),
      description: 'Equipment Purchase',
      type: 'debit',
      status: 'cleared',
      merchantName: 'Office Supplies Ltd',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_9',
      amount: -300.00,
      date: new Date('2024-01-23'),
      description: 'Internet Service',
      type: 'debit',
      status: 'pending',
      merchantName: 'ISP Provider',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_10',
      amount: 4500.00,
      date: new Date('2024-01-24'),
      description: 'Client Retainer - GHI Solutions',
      type: 'credit',
      status: 'cleared',
      merchantName: 'GHI Solutions',
      categoryId: incomeCategory.id
    },
    {
      providerId: 'tx_11',
      amount: -750.00,
      date: new Date('2024-01-25'),
      description: 'Insurance Premium',
      type: 'debit',
      status: 'cleared',
      merchantName: 'Insurance Co',
      categoryId: expenseCategory.id
    },
    {
      providerId: 'tx_12',
      amount: 2000.00,
      date: new Date(),
      description: 'Transfer from Savings',
      type: 'credit',
      status: 'pending',
      merchantName: 'Internal Transfer',
      categoryId: transferCategory.id
    }
  ];

  // Add common fields and create transactions
  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        accountId: account.id,
        connectionId: connection.id,
        currency: 'EUR',
        tags: [],
        metadata: {}
      }
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error creating seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
