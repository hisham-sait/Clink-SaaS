const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createStatutoryData() {
  try {
    // Get all companies created by settings seed
    const companies = await prisma.company.findMany({
      where: {
        status: 'Active'
      }
    });

    if (companies.length === 0) {
      throw new Error('No companies found. Please ensure settings seed has been run first.');
    }

    // Create statutory data for each company
    for (const company of companies) {

    // Create share classes
    const shares = await prisma.share.createMany({
      data: [
        {
          class: 'Ordinary A',
          type: 'Ordinary',
          nominalValue: 1.00,
          currency: 'EUR',
          votingRights: true,
          dividendRights: true,
          transferable: true,
          totalIssued: 10000,
          status: 'Active',
          companyId: company.id
        },
        {
          class: 'Preference',
          type: 'Preferential',
          nominalValue: 1.00,
          currency: 'EUR',
          votingRights: false,
          dividendRights: true,
          transferable: true,
          totalIssued: 5000,
          status: 'Active',
          companyId: company.id
        }
      ]
    });

    // Create directors
    const directors = await prisma.director.createMany({
      data: [
        {
          title: 'Mr',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1975-06-15'),
          nationality: 'Irish',
          address: '123 Business Park, Dublin 2, Ireland',
          appointmentDate: new Date('2020-01-01'),
          directorType: 'Executive Director',
          occupation: 'Chief Executive Officer',
          otherDirectorships: 'None',
          shareholding: '5000 Ordinary A Shares',
          status: 'Active',
          companyId: company.id
        },
        {
          title: 'Ms',
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: new Date('1980-03-22'),
          nationality: 'Irish',
          address: '456 Corporate Avenue, Dublin 4, Ireland',
          appointmentDate: new Date('2020-01-01'),
          directorType: 'Executive Director',
          occupation: 'Chief Financial Officer',
          otherDirectorships: 'Director at Finance Corp Ltd',
          shareholding: '3000 Ordinary A Shares',
          status: 'Active',
          companyId: company.id
        },
        {
          title: 'Dr',
          firstName: 'Michael',
          lastName: 'O\'Brien',
          dateOfBirth: new Date('1968-11-30'),
          nationality: 'Irish',
          address: '789 Business Centre, Dublin 18, Ireland',
          appointmentDate: new Date('2020-01-01'),
          resignationDate: new Date('2023-12-31'),
          directorType: 'Non-Executive Director',
          occupation: 'Business Consultant',
          otherDirectorships: 'Multiple Board Positions',
          shareholding: 'None',
          status: 'Resigned',
          companyId: company.id
        }
      ]
    });

    // Create shareholders
    const shareholders = await prisma.shareholder.createMany({
      data: [
        {
          title: 'Mr',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1975-06-15'),
          nationality: 'Irish',
          address: '123 Business Park, Dublin 2, Ireland',
          email: 'john.smith@example.com',
          phone: '+353 1 234 5678',
          ordinaryShares: 5000,
          preferentialShares: 0,
          dateAcquired: new Date('2020-01-01'),
          status: 'Active',
          companyId: company.id
        },
        {
          title: 'Ms',
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: new Date('1980-03-22'),
          nationality: 'Irish',
          address: '456 Corporate Avenue, Dublin 4, Ireland',
          email: 'sarah.johnson@example.com',
          phone: '+353 1 234 5679',
          ordinaryShares: 3000,
          preferentialShares: 0,
          dateAcquired: new Date('2020-01-01'),
          status: 'Active',
          companyId: company.id
        },
        {
          title: 'Mr',
          firstName: 'David',
          lastName: 'Wilson',
          dateOfBirth: new Date('1970-09-10'),
          nationality: 'British',
          address: '101 Investment Street, London, UK',
          email: 'david.wilson@example.com',
          phone: '+44 20 7123 4567',
          ordinaryShares: 2000,
          preferentialShares: 5000,
          dateAcquired: new Date('2020-01-01'),
          status: 'Active',
          companyId: company.id
        }
      ]
    });

    // Create beneficial owners
    const beneficialOwners = await prisma.beneficialOwner.createMany({
      data: [
        {
          title: 'Mr',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1975-06-15'),
          nationality: 'Irish',
          address: '123 Business Park, Dublin 2, Ireland',
          email: 'john.smith@example.com',
          phone: '+353 1 234 5678',
          natureOfControl: ['Shareholding', 'Voting Rights'],
          ownershipPercentage: 50.0,
          registrationDate: new Date('2020-01-01'),
          status: 'Active',
          companyId: company.id
        },
        {
          title: 'Mr',
          firstName: 'David',
          lastName: 'Wilson',
          dateOfBirth: new Date('1970-09-10'),
          nationality: 'British',
          address: '101 Investment Street, London, UK',
          email: 'david.wilson@example.com',
          phone: '+44 20 7123 4567',
          natureOfControl: ['Shareholding'],
          ownershipPercentage: 25.0,
          registrationDate: new Date('2020-01-01'),
          status: 'Active',
          companyId: company.id
        }
      ]
    });

    // Create charges
    for (const chargeData of [
      {
        chargeId: `CHG001_${Date.now()}`,
        chargeType: 'Fixed Charge',
        dateCreated: new Date('2020-02-15'),
        amount: 500000.00,
        currency: 'EUR',
        chargor: 'Tech Solutions Ltd',
        chargee: 'Bank of Ireland',
        description: 'Fixed charge over company property',
        propertyCharged: 'Office Building at 123 Business Park',
        registrationDate: new Date('2020-02-20'),
        status: 'Active',
        companyId: company.id
      },
      {
        chargeId: `CHG002_${Date.now()}`,
        chargeType: 'Floating Charge',
        dateCreated: new Date('2020-03-01'),
        amount: 250000.00,
        currency: 'EUR',
        chargor: 'Tech Solutions Ltd',
        chargee: 'AIB Bank',
        description: 'Floating charge over company assets',
        propertyCharged: 'All present and future assets',
        registrationDate: new Date('2020-03-05'),
        status: 'Active',
        companyId: company.id
      }
    ]) {
      await prisma.charge.create({
        data: chargeData
      });
    }

    // Create allotments
    for (const allotmentData of [
      {
        allotmentId: `ALT001_${Date.now()}`,
        allotmentDate: new Date('2020-01-01'),
        shareClass: 'Ordinary A',
        numberOfShares: 5000,
        pricePerShare: 1.00,
        currency: 'EUR',
        allottee: 'John Smith',
        paymentStatus: 'Completed',
        amountPaid: 5000.00,
        paymentDate: new Date('2020-01-01'),
        certificateNumber: `CERT001_${Date.now()}`,
        status: 'Active',
        companyId: company.id
      },
      {
        allotmentId: `ALT002_${Date.now()}`,
        allotmentDate: new Date('2020-01-01'),
        shareClass: 'Preference',
        numberOfShares: 5000,
        pricePerShare: 1.00,
        currency: 'EUR',
        allottee: 'David Wilson',
        paymentStatus: 'Completed',
        amountPaid: 5000.00,
        paymentDate: new Date('2020-01-01'),
        certificateNumber: `CERT002_${Date.now()}`,
        status: 'Active',
        companyId: company.id
      }
    ]) {
      await prisma.allotment.create({
        data: allotmentData
      });
    }

    // Create meetings
    const agm = await prisma.meeting.create({
      data: {
        meetingId: `MTG001_${Date.now()}`,
        meetingDate: new Date('2023-06-15'),
        meetingType: 'AGM',
        venue: 'Company Registered Office',
        startTime: new Date('2023-06-15T10:00:00'),
        endTime: new Date('2023-06-15T12:00:00'),
        chairperson: 'John Smith',
        attendees: ['John Smith', 'Sarah Johnson', 'David Wilson'],
        agenda: 'Annual General Meeting 2023',
        quorumRequired: 2,
        quorumPresent: 3,
        quorumAchieved: true,
        minutes: 'Minutes of the Annual General Meeting...',
        status: 'Final',
        attachments: ['AGM_2023_Presentation.pdf'],
        companyId: company.id,
        resolutions: {
          create: [
            {
              title: 'Approval of Financial Statements',
              type: 'Ordinary',
              description: 'To receive and adopt the financial statements for the year ended 31 December 2022',
              outcome: 'Passed',
              proposedBy: 'John Smith',
              secondedBy: 'Sarah Johnson'
            },
            {
              title: 'Dividend Declaration',
              type: 'Ordinary',
              description: 'To declare a final dividend of €0.10 per share',
              outcome: 'Passed',
              proposedBy: 'Sarah Johnson',
              secondedBy: 'David Wilson'
            }
          ]
        }
      }
    });

    // Create board minutes
    const boardMinute = await prisma.boardMinute.create({
      data: {
        minuteId: `BM001_${Date.now()}`,
        meetingDate: new Date('2023-07-01'),
        startTime: new Date('2023-07-01T14:00:00'),
        endTime: new Date('2023-07-01T16:00:00'),
        venue: 'Board Room, Company Office',
        chairperson: 'John Smith',
        attendees: ['John Smith', 'Sarah Johnson'],
        agenda: 'Q2 2023 Board Meeting',
        minutes: 'Minutes of the Board Meeting...',
        status: 'Final',
        attachments: ['Q2_2023_Board_Pack.pdf'],
        companyId: company.id,
        discussions: {
          create: [
            {
              topic: 'Q2 Financial Performance',
              details: 'Review of Q2 2023 financial performance',
              decisions: ['Approved Q2 financial statements', 'Authorized new marketing budget'],
              actionItems: {
                create: [
                  {
                    task: 'Prepare Q2 investor presentation',
                    assignee: 'Sarah Johnson',
                    dueDate: new Date('2023-07-15'),
                    status: 'Completed'
                  },
                  {
                    task: 'Update financial forecasts',
                    assignee: 'Sarah Johnson',
                    dueDate: new Date('2023-07-20'),
                    status: 'In_Progress'
                  }
                ]
              }
            },
            {
              topic: 'Strategic Planning',
              details: 'Discussion of 5-year strategic plan',
              decisions: ['Approved expansion into new markets', 'Approved R&D budget increase'],
              actionItems: {
                create: [
                  {
                    task: 'Prepare market entry strategy',
                    assignee: 'John Smith',
                    dueDate: new Date('2023-08-01'),
                    status: 'Pending'
                  }
                ]
              }
            }
          ]
        },
        resolutions: {
          create: [
            {
              title: 'New Market Expansion',
              type: 'Ordinary',
              description: 'Resolution to approve expansion into Asian markets',
              outcome: 'Passed',
              proposedBy: 'John Smith',
              secondedBy: 'Sarah Johnson'
            }
          ]
        }
      }
    });

    // Create some activities
    const activities = await prisma.activity.createMany({
      data: [
        {
          type: 'appointment',
          description: 'John Smith appointed as Director',
          user: 'System',
          time: new Date('2020-01-01'),
          companyId: company.id
        },
        {
          type: 'added',
          description: 'New share class Ordinary A created',
          user: 'System',
          time: new Date('2020-01-01'),
          companyId: company.id
        },
        {
          type: 'status_changed',
          description: 'AGM 2023 status changed to Final',
          user: 'System',
          time: new Date('2023-06-15'),
          companyId: company.id
        }
      ]
    });

    }

    return companies;
  } catch (error) {
    console.error('Error creating statutory data:', error);
    throw error;
  }
}

module.exports = createStatutoryData;
