const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSettingsData() {
  try {
    console.log('Creating settings data...');
    
    // First, delete all existing data in the correct order
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.billingDetails.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.userPreference.deleteMany({});
    await prisma.securitySettings.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.primaryContact.deleteMany({});
    await prisma.userCompany.deleteMany({});
    await prisma.company.deleteMany({});

    // Get users from auth seed
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'superadmin@clink.com' }
    });

    const platformAdmin = await prisma.user.findUnique({
      where: { email: 'platformadmin@clink.com' }
    });

    if (!superAdmin || !platformAdmin) {
      throw new Error('Required users not found. Please ensure auth seed has been run first.');
    }

    // Create initial companies
    const companies = [
      {
        name: 'Clink SaaS',
        legalName: 'Clink SaaS Limited',
        registrationNumber: 'CL123456',
        vatNumber: 'VAT123456',
        status: 'Active',
        isPrimary: true,
        isMyOrg: true,
        tags: ['SaaS', 'Technology'],
        createdById: superAdmin.id,
        userCompanies: {
          create: [{
            userId: superAdmin.id,
            role: 'Super Admin'
          }]
        },
        billingDetails: {
          create: {
            address: '123 Tech Park',
            city: 'Dublin',
            state: 'Dublin',
            country: 'Ireland',
            postalCode: 'D01 AB12',
            taxId: 'TAX123456',
            currency: 'EUR',
            paymentTerms: 30,
            paymentMethods: {
              create: [
                {
                  type: 'card',
                  provider: 'stripe',
                  lastFour: '4242',
                  expiryDate: new Date('2025-12-31'),
                  isDefault: true,
                  status: 'Active'
                }
              ]
            }
          }
        }
      },
      {
        name: 'Tech Solutions Ltd',
        legalName: 'Tech Solutions Limited',
        registrationNumber: 'TS789012',
        vatNumber: 'VAT789012',
        status: 'Active',
        isPrimary: false,
        isMyOrg: false,
        tags: ['Technology', 'Software'],
        createdById: superAdmin.id,
        userCompanies: {
          create: [{
            userId: superAdmin.id,
            role: 'Super Admin'
          }]
        },
        billingDetails: {
          create: {
            address: '456 Tech Hub',
            city: 'Dublin',
            state: 'Dublin',
            country: 'Ireland',
            postalCode: 'D02 CD34',
            taxId: 'TAX789012',
            currency: 'EUR',
            paymentTerms: 30,
            paymentMethods: {
              create: [
                {
                  type: 'bank',
                  provider: 'stripe',
                  lastFour: '1234',
                  isDefault: true,
                  status: 'Active'
                }
              ]
            }
          }
        }
      },
      {
        name: 'Green Energy Co',
        legalName: 'Green Energy Company Limited',
        registrationNumber: 'GE345678',
        vatNumber: 'VAT345678',
        status: 'Active',
        isPrimary: false,
        isMyOrg: false,
        tags: ['Energy', 'Renewable'],
        createdById: superAdmin.id,
        userCompanies: {
          create: [{
            userId: superAdmin.id,
            role: 'Super Admin'
          }]
        },
        billingDetails: {
          create: {
            address: '789 Green Park',
            city: 'Cork',
            state: 'Cork',
            country: 'Ireland',
            postalCode: 'T12 EF56',
            taxId: 'TAX345678',
            currency: 'EUR',
            paymentTerms: 30,
            paymentMethods: {
              create: [
                {
                  type: 'card',
                  provider: 'stripe',
                  lastFour: '9876',
                  expiryDate: new Date('2024-12-31'),
                  isDefault: true,
                  status: 'Active'
                }
              ]
            }
          }
        }
      }
    ];

    // Create companies
    console.log('Creating companies...');
    const createdCompanies = [];
    for (const companyData of companies) {
      const createdCompany = await prisma.company.create({
        data: companyData,
        include: {
          userCompanies: true,
          billingDetails: {
            include: {
              paymentMethods: true
            }
          }
        }
      });
      createdCompanies.push(createdCompany);
    }

    // Create sample invoices
    console.log('Creating invoices...');
    const invoices = [];
    for (const company of createdCompanies) {
      if (!company.isMyOrg) { // Only create invoices for client companies
        const invoice = await prisma.invoice.create({
          data: {
            number: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            companyId: company.id,
            amount: 1000.00,
            currency: company.billingDetails.currency,
            status: 'Pending',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            items: {
              "items": [
                {
                  "description": "Professional Services",
                  "quantity": 1,
                  "unitPrice": 1000.00,
                  "total": 1000.00
                }
              ],
              "subtotal": 1000.00,
              "tax": 230.00,
              "total": 1230.00
            },
            createdById: platformAdmin.id
          }
        });
        invoices.push(invoice);
      }
    }

    // Create user preferences and security settings
    console.log('Creating user preferences and security settings...');
    await prisma.userPreference.create({
      data: {
        userId: superAdmin.id,
        theme: 'Light',
        language: 'English',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        timezone: 'Europe/Dublin',
        emailDigest: true,
        pushNotifications: true
      }
    });

    await prisma.securitySettings.create({
      data: {
        userId: superAdmin.id,
        twoFactorEnabled: true,
        twoFactorMethod: 'app',
        passwordLastChanged: new Date(),
        lastSecurityAudit: new Date()
      }
    });

    // Create sample notifications
    console.log('Creating notifications...');
    await prisma.notification.create({
      data: {
        userId: superAdmin.id,
        type: 'system',
        title: 'Welcome to Clink SaaS',
        message: 'Welcome to Clink SaaS platform. Get started by exploring the dashboard.',
        read: false
      }
    });

    console.log('Settings data created successfully');
    return {
      companies: createdCompanies,
      invoices: invoices
    };

  } catch (error) {
    console.error('Error creating settings data:', error);
    throw error;
  }
}

module.exports = createSettingsData;
