const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBilling() {
  try {
    // Get test companies
    const primaryCompany = await prisma.company.findFirst({
      where: { isPrimary: true }
    });

    const clientCompany = await prisma.company.findFirst({
      where: { isMyOrg: false, tags: { isEmpty: false } },
      orderBy: { createdAt: 'asc' }
    });

    const partnerCompany = await prisma.company.findFirst({
      where: { isMyOrg: false, tags: { isEmpty: false }, NOT: { id: clientCompany?.id } },
      orderBy: { createdAt: 'asc' }
    });

    if (!primaryCompany || !clientCompany || !partnerCompany) {
      console.log('Required companies not found. Please run company seeds first.');
      return;
    }

    // Get test users and plans
    const users = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: {
                in: ['Super Admin', 'Platform Admin', 'Company Admin', 'Company Manager', 'Accountant']
              }
            }
          }
        }
      }
    });

    const plans = await prisma.plan.findMany();
    const planMap = plans.reduce((acc, plan) => ({ ...acc, [plan.name]: plan }), {});

    // Assign plans and billing companies to users
    const userPlanAssignments = [
      {
        role: 'Super Admin',
        plan: 'Enterprise',
        company: primaryCompany
      },
      {
        role: 'Platform Admin',
        plan: 'Enterprise',
        company: primaryCompany
      },
      {
        role: 'Company Admin',
        plan: 'Professional',
        company: clientCompany
      },
      {
        role: 'Company Manager',
        plan: 'Professional',
        company: clientCompany
      },
      {
        role: 'Accountant',
        plan: 'Starter',
        company: partnerCompany
      }
    ];

    for (const user of users) {
      const userRole = await prisma.userRole.findFirst({
        where: { userId: user.id },
        include: { role: true }
      });

      const assignment = userPlanAssignments.find(a => a.role === userRole.role.name);
      if (assignment && planMap[assignment.plan]) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            planId: planMap[assignment.plan].id,
            billingCompanyId: assignment.company.id
          }
        });

        // Create invoice for the user's plan
        const invoice = await prisma.invoice.create({
          data: {
            number: `INV-2024-01-${user.id.substring(0, 4)}`,
            companyId: assignment.company.id,
            amount: planMap[assignment.plan].price * 12, // Annual billing
            currency: 'EUR',
            status: 'Paid',
            dueDate: new Date('2024-01-31'),
            paidDate: new Date('2024-01-15'),
            createdById: user.id,
            items: {
              items: [
                {
                  description: `${assignment.plan} Plan - Annual Subscription (User: ${user.firstName} ${user.lastName})`,
                  quantity: 1,
                  unitPrice: planMap[assignment.plan].price * 12,
                  total: planMap[assignment.plan].price * 12
                }
              ],
              subtotal: planMap[assignment.plan].price * 12,
              tax: 0,
              total: planMap[assignment.plan].price * 12
            }
          }
        });

        // Create payment for the invoice
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            companyId: assignment.company.id,
            amount: invoice.amount,
            currency: invoice.currency,
            method: 'card',
            status: 'Paid',
            metadata: {
              paymentMethod: 'Visa ending in 4242',
              transactionId: `ch_${Date.now()}`
            }
          }
        });
      }
    }

    console.log('Billing data seeded successfully');
  } catch (error) {
    console.error('Error seeding billing data:', error);
    throw error;
  }
}

module.exports = {
  seedBilling
};
