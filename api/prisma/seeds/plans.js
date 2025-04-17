const { PrismaClient, PlanStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPlans() {
  try {
    // First, delete all existing plans
    console.log('Cleaning up existing plans...');
    await prisma.plan.deleteMany();
    console.log('Existing plans cleaned up');

    // Create plans
    const plans = [
      {
        name: 'Free',
        description: 'Basic features for small businesses',
        price: 0,
        billingCycle: 'Monthly',
        features: [
          'Up to 2 users',
          'Single company',
          'Basic compliance tracking',
          'Basic document management'
        ],
        maxUsers: 2,
        maxCompanies: 1,
        isCustom: false,
        status: PlanStatus.Active
      },
      {
        name: 'Starter',
        description: 'Essential features for growing businesses',
        price: 49.99,
        billingCycle: 'Monthly',
        features: [
          'Up to 5 users',
          'Up to 3 companies',
          'Advanced compliance tracking',
          'Full document management',
          'Basic reporting',
          'Email support'
        ],
        maxUsers: 5,
        maxCompanies: 3,
        isCustom: false,
        status: PlanStatus.Active
      },
      {
        name: 'Professional',
        description: 'Advanced features for established businesses',
        price: 99.99,
        billingCycle: 'Monthly',
        features: [
          'Up to 15 users',
          'Up to 10 companies',
          'Advanced compliance tracking',
          'Full document management',
          'Advanced reporting',
          'Priority email support',
          'Audit trail',
          'Custom workflows'
        ],
        maxUsers: 15,
        maxCompanies: 10,
        isCustom: false,
        status: PlanStatus.Active
      },
      {
        name: 'Enterprise',
        description: 'Complete solution for large organizations',
        price: 199.99,
        billingCycle: 'Monthly',
        features: [
          'Unlimited users',
          'Unlimited companies',
          'Advanced compliance tracking',
          'Full document management',
          'Advanced reporting',
          'Priority support',
          'Audit trail',
          'Custom workflows',
          'API access',
          'Dedicated account manager',
          'Custom integrations',
          'Training sessions'
        ],
        maxUsers: -1, // Unlimited
        maxCompanies: -1, // Unlimited
        isCustom: false,
        status: PlanStatus.Active
      }
    ];

    console.log('Creating plans...');
    const createdPlans = [];
    for (const plan of plans) {
      const createdPlan = await prisma.plan.create({
        data: plan
      });
      createdPlans.push(createdPlan);
    }

    console.log('Plans seed completed successfully');
    return createdPlans;
  } catch (error) {
    console.error('Error seeding plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedPlans;
