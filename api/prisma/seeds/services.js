const { PrismaClient, ProductType, PlanType } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedServices() {
  try {
    console.log('Starting to seed accounting services...');

    // Get all companies to associate services with
    const companies = await prisma.company.findMany({
      where: {
        status: 'Active'
      }
    });

    if (companies.length === 0) {
      throw new Error('No companies found. Please ensure settings seed has been run first.');
    }

    // For each company, create the services
    for (const company of companies) {
      console.log(`Creating services for company: ${company.name}`);

      // Define services by category
      const servicesByCategory = {
        // 1. ACCOUNTING & BOOKKEEPING SERVICES
        "Accounting & Bookkeeping": [
          {
            name: "Monthly Bookkeeping",
            description: "Comprehensive bookkeeping services to maintain accurate financial records for your business on a monthly basis.",
            category: "Accounting & Bookkeeping",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 200,
                features: [
                  "Monthly transaction recording",
                  "Bank reconciliation",
                  "Basic financial statements",
                  "VAT return preparation",
                  "Monthly summary report"
                ],
                description: "Essential bookkeeping services for small businesses (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 350,
                features: [
                  "All Basic features",
                  "Accounts receivable management",
                  "Accounts payable management",
                  "Detailed management reports",
                  "Quarterly review meeting",
                  "Cloud accounting software"
                ],
                description: "Comprehensive bookkeeping with management reporting (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 500,
                features: [
                  "All Standard features",
                  "Dedicated accountant",
                  "Weekly updates",
                  "Cash flow forecasting",
                  "KPI tracking",
                  "Monthly strategy meeting",
                  "Tax planning recommendations"
                ],
                description: "Premium bookkeeping with strategic financial support (Monthly)"
              }
            ]
          },
          {
            name: "Annual Accounts Preparation",
            description: "Preparation of annual financial statements and accounts for your business.",
            category: "Accounting & Bookkeeping",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 500,
                features: [
                  "Sole trader accounts",
                  "Income statement",
                  "Basic tax computations",
                  "Filing with Revenue",
                  "Year-end consultation"
                ],
                description: "Annual accounts for sole traders (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 1000,
                features: [
                  "Limited company accounts",
                  "Balance sheet",
                  "Income statement",
                  "Statement of changes in equity",
                  "Director's report",
                  "Corporation tax computation",
                  "Filing with CRO and Revenue"
                ],
                description: "Annual accounts for limited companies (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 1800,
                features: [
                  "All Standard features",
                  "Comprehensive financial analysis",
                  "Ratio analysis",
                  "Trend analysis",
                  "Benchmarking against industry",
                  "Strategic recommendations",
                  "Tax planning for next year",
                  "Directors' meeting presentation"
                ],
                description: "Premium annual accounts with financial analysis (One-time)"
              }
            ]
          },
          {
            name: "Management Accounts",
            description: "Regular management accounts to help you make informed business decisions.",
            category: "Accounting & Bookkeeping",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 150,
                features: [
                  "Monthly profit & loss",
                  "Basic balance sheet",
                  "Cash position summary",
                  "Key performance indicators",
                  "Quarterly delivery"
                ],
                description: "Basic management accounts (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 250,
                features: [
                  "All Basic features",
                  "Detailed departmental analysis",
                  "Budget vs actual comparison",
                  "Cash flow statement",
                  "Monthly delivery",
                  "Commentary on results"
                ],
                description: "Comprehensive management accounts (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 400,
                features: [
                  "All Standard features",
                  "Weekly flash reports",
                  "Custom KPI dashboard",
                  "Trend analysis",
                  "Forecasting updates",
                  "Monthly review meeting",
                  "Strategic recommendations"
                ],
                description: "Premium management accounts with strategic insights (Monthly)"
              }
            ]
          },
          {
            name: "Cash Flow Forecasting",
            description: "Detailed cash flow projections to help manage your business finances and plan for the future.",
            category: "Accounting & Bookkeeping",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 300,
                features: [
                  "3-month cash flow forecast",
                  "Basic assumptions",
                  "Monthly updates",
                  "PDF report delivery",
                  "Email support"
                ],
                description: "Basic cash flow forecasting (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 500,
                features: [
                  "6-month cash flow forecast",
                  "Detailed assumptions",
                  "Scenario planning (best/worst case)",
                  "Monthly updates",
                  "Interactive dashboard",
                  "Quarterly review meeting"
                ],
                description: "Standard cash flow forecasting with scenarios (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 900,
                features: [
                  "12-month cash flow forecast",
                  "Multiple scenario planning",
                  "Sensitivity analysis",
                  "Weekly updates",
                  "Interactive dashboard",
                  "Monthly review meeting",
                  "Strategic recommendations",
                  "Financing options advice"
                ],
                description: "Premium cash flow forecasting with strategic planning (One-time)"
              }
            ]
          },
          {
            name: "Accounting System Setup & Training",
            description: "Setup and configuration of accounting software with training for your team.",
            category: "Accounting & Bookkeeping",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 500,
                features: [
                  "Basic system setup",
                  "Chart of accounts configuration",
                  "User setup",
                  "2-hour basic training session",
                  "30 days email support"
                ],
                description: "Basic accounting system setup (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 900,
                features: [
                  "All Basic features",
                  "Custom chart of accounts",
                  "Invoice templates",
                  "Integration with banking",
                  "Data migration from previous system",
                  "4-hour comprehensive training",
                  "60 days email and phone support"
                ],
                description: "Standard accounting system setup with training (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 1500,
                features: [
                  "All Standard features",
                  "Multiple user setup with permissions",
                  "Custom reporting templates",
                  "Integration with CRM and other systems",
                  "Workflow automation setup",
                  "8-hour advanced training program",
                  "90 days priority support",
                  "Follow-up training session after 30 days"
                ],
                description: "Premium accounting system setup with advanced training (One-time)"
              }
            ]
          }
        ],

        // 2. TAX SERVICES
        "Tax Services": [
          {
            name: "Personal Tax Returns",
            description: "Preparation and filing of personal income tax returns with Revenue.",
            category: "Tax Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 250,
                features: [
                  "PAYE income tax return",
                  "Tax credit review",
                  "Basic deductions",
                  "Electronic filing with Revenue",
                  "Tax calculation explanation"
                ],
                description: "Basic personal tax return for PAYE individuals (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 400,
                features: [
                  "All Basic features",
                  "Self-employment income",
                  "Rental income",
                  "Dividend income",
                  "Capital acquisitions",
                  "Tax planning recommendations",
                  "Prior year review"
                ],
                description: "Standard personal tax return for multiple income sources (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 700,
                features: [
                  "All Standard features",
                  "Complex investments",
                  "Foreign income",
                  "Capital gains",
                  "Trust income",
                  "Comprehensive tax planning",
                  "Multi-year strategy",
                  "Audit protection",
                  "Priority processing"
                ],
                description: "Premium personal tax return for complex situations (One-time)"
              }
            ]
          },
          {
            name: "Corporate Tax Compliance",
            description: "Preparation and filing of corporate tax returns and ensuring compliance with Irish tax laws.",
            category: "Tax Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 600,
                features: [
                  "Annual corporation tax return",
                  "Basic tax computations",
                  "Electronic filing with Revenue",
                  "Tax payment schedule",
                  "Basic compliance review"
                ],
                description: "Basic corporate tax compliance for small companies (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 1200,
                features: [
                  "All Basic features",
                  "Detailed tax computations",
                  "Tax depreciation schedule",
                  "Preliminary tax planning",
                  "Revenue correspondence management",
                  "Quarterly tax review",
                  "Close company surcharge review"
                ],
                description: "Standard corporate tax compliance for medium companies (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 2500,
                features: [
                  "All Standard features",
                  "Complex group structures",
                  "International tax considerations",
                  "Transfer pricing documentation",
                  "Strategic tax planning",
                  "Tax risk assessment",
                  "Tax director support",
                  "Audit defense preparation",
                  "Monthly tax advisory"
                ],
                description: "Premium corporate tax compliance for large or complex companies (One-time)"
              }
            ]
          },
          {
            name: "VAT Returns & Registration",
            description: "Preparation and filing of VAT returns and assistance with VAT registration.",
            category: "Tax Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 100,
                features: [
                  "Bi-monthly VAT return preparation",
                  "Electronic filing with Revenue",
                  "Basic VAT compliance check",
                  "Payment reminder service",
                  "Simple VAT queries"
                ],
                description: "Basic VAT return service (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 200,
                features: [
                  "All Basic features",
                  "VAT reconciliation",
                  "VAT planning advice",
                  "EU sales and purchases review",
                  "VIES return preparation",
                  "Intrastat return if required",
                  "VAT audit preparation"
                ],
                description: "Standard VAT compliance service (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 350,
                features: [
                  "All Standard features",
                  "Complex VAT scenarios",
                  "International VAT considerations",
                  "VAT grouping advice",
                  "Partial exemption calculations",
                  "VAT health check",
                  "Revenue negotiation support",
                  "Monthly VAT strategy meeting"
                ],
                description: "Premium VAT compliance and advisory service (Monthly)"
              }
            ]
          },
          {
            name: "Tax Planning & Advisory",
            description: "Strategic tax planning to minimize tax liabilities and maximize efficiency.",
            category: "Tax Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 150,
                features: [
                  "Quarterly tax review",
                  "Basic tax planning",
                  "Tax calendar reminders",
                  "Simple tax queries",
                  "Annual tax strategy meeting"
                ],
                description: "Basic tax planning service (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 300,
                features: [
                  "All Basic features",
                  "Monthly tax review",
                  "Comprehensive tax planning",
                  "Tax-efficient remuneration strategies",
                  "Business structure optimization",
                  "Quarterly strategy meetings",
                  "Unlimited tax queries"
                ],
                description: "Standard tax advisory service (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 600,
                features: [
                  "All Standard features",
                  "Dedicated tax advisor",
                  "Proactive tax planning",
                  "International tax considerations",
                  "Group structure optimization",
                  "Succession planning",
                  "Monthly strategy meetings",
                  "Direct access to tax partner",
                  "Annual tax health check"
                ],
                description: "Premium tax strategy service (Monthly)"
              }
            ]
          },
          {
            name: "Revenue Audit Assistance",
            description: "Comprehensive support during Revenue audits to ensure the best possible outcome.",
            category: "Tax Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 1000,
                features: [
                  "Initial audit notice review",
                  "Basic preparation assistance",
                  "Document organization",
                  "Limited audit attendance",
                  "Basic post-audit support"
                ],
                description: "Basic Revenue audit assistance (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 2000,
                features: [
                  "All Basic features",
                  "Comprehensive audit preparation",
                  "Pre-audit review",
                  "Full audit attendance",
                  "Response to findings",
                  "Settlement negotiation",
                  "Post-audit compliance review"
                ],
                description: "Standard Revenue audit support (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 4000,
                features: [
                  "All Standard features",
                  "Senior tax partner representation",
                  "Comprehensive risk assessment",
                  "Mock audit preparation",
                  "Strategic defense planning",
                  "Expert technical support",
                  "Appeals process management",
                  "Future audit prevention strategy",
                  "24/7 support during audit period"
                ],
                description: "Premium Revenue audit defense (One-time)"
              }
            ]
          }
        ],

        // 3. PAYROLL SERVICES
        "Payroll Services": [
          {
            name: "Payroll Processing",
            description: "Comprehensive payroll processing service ensuring accurate and timely payment of employees.",
            category: "Payroll Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 100,
                features: [
                  "Monthly payroll processing",
                  "Up to 5 employees",
                  "Payslip generation",
                  "PAYE/PRSI/USC calculations",
                  "Revenue submissions",
                  "Year-end processing",
                  "Basic reporting"
                ],
                description: "Basic payroll service for small businesses (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 200,
                features: [
                  "All Basic features",
                  "Up to 20 employees",
                  "Employee portal access",
                  "Customized payslips",
                  "Pension processing",
                  "Benefit-in-kind calculations",
                  "Detailed management reports",
                  "Payroll journal for accounts"
                ],
                description: "Standard payroll service for growing businesses (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 350,
                features: [
                  "All Standard features",
                  "Up to 50 employees",
                  "Dedicated payroll specialist",
                  "Multi-department processing",
                  "Complex benefits administration",
                  "Custom reporting package",
                  "Payroll analysis",
                  "Unlimited support",
                  "Quarterly payroll review"
                ],
                description: "Premium payroll service for larger businesses (Monthly)"
              }
            ]
          },
          {
            name: "PAYE Modernisation Compliance",
            description: "Ensuring full compliance with Revenue's PAYE Modernisation requirements.",
            category: "Payroll Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 75,
                features: [
                  "Basic PAYE Modernisation compliance",
                  "Real-time reporting setup",
                  "Monthly submissions review",
                  "Basic error correction",
                  "Simple compliance queries"
                ],
                description: "Basic PAYE Modernisation compliance (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 150,
                features: [
                  "All Basic features",
                  "Comprehensive compliance review",
                  "Payroll process optimization",
                  "Revenue correspondence management",
                  "Compliance reporting",
                  "Staff training on requirements",
                  "Quarterly compliance check"
                ],
                description: "Standard PAYE Modernisation compliance (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 250,
                features: [
                  "All Standard features",
                  "Full compliance management",
                  "System integration review",
                  "Process automation recommendations",
                  "Audit defense preparation",
                  "Monthly compliance review",
                  "Strategic compliance planning",
                  "Direct Revenue liaison"
                ],
                description: "Premium PAYE Modernisation compliance (Monthly)"
              }
            ]
          },
          {
            name: "Payroll Year-End Processing",
            description: "Comprehensive year-end payroll processing and reporting.",
            category: "Payroll Services",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 300,
                features: [
                  "Basic year-end processing",
                  "P35 preparation and submission",
                  "P60 generation",
                  "Revenue compliance check",
                  "Basic reconciliation",
                  "New tax year setup"
                ],
                description: "Basic payroll year-end service (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 600,
                features: [
                  "All Basic features",
                  "Comprehensive reconciliation",
                  "Detailed compliance review",
                  "BIK reconciliation",
                  "Pension contribution review",
                  "Year-end adjustments",
                  "Management reporting package",
                  "New tax year planning"
                ],
                description: "Standard payroll year-end service (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 1000,
                features: [
                  "All Standard features",
                  "Full payroll audit before submission",
                  "Multi-entity consolidation",
                  "Complex adjustments processing",
                  "Strategic tax planning for new year",
                  "Executive reporting package",
                  "Payroll efficiency review",
                  "Process improvement recommendations",
                  "New year implementation support"
                ],
                description: "Premium payroll year-end service (One-time)"
              }
            ]
          }
        ],

        // 4. BUSINESS ADVISORY
        "Business Advisory": [
          {
            name: "Business Planning",
            description: "Development of comprehensive business plans to guide your company's growth and secure financing.",
            category: "Business Advisory",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 800,
                features: [
                  "Basic business plan development",
                  "Executive summary",
                  "Company description",
                  "Simple market analysis",
                  "Basic financial projections",
                  "Implementation timeline"
                ],
                description: "Basic business plan (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 1500,
                features: [
                  "All Basic features",
                  "Comprehensive market analysis",
                  "Detailed competitor analysis",
                  "Marketing strategy",
                  "Operational plan",
                  "3-year financial projections",
                  "Risk assessment",
                  "Funding requirements"
                ],
                description: "Comprehensive business plan (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 3000,
                features: [
                  "All Standard features",
                  "Strategic business plan",
                  "In-depth market research",
                  "Detailed financial modeling",
                  "Scenario analysis",
                  "5-year projections",
                  "Investor presentation deck",
                  "Implementation support",
                  "Quarterly review meetings",
                  "Plan updates for 12 months"
                ],
                description: "Strategic business plan with implementation support (One-time)"
              }
            ]
          },
          {
            name: "Budgeting & Forecasting",
            description: "Development of detailed budgets and forecasts to guide business planning and performance monitoring.",
            category: "Business Advisory",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 500,
                features: [
                  "Basic annual budget",
                  "Revenue projections",
                  "Expense forecasting",
                  "Simple cash flow forecast",
                  "Monthly breakdown",
                  "Basic variance analysis"
                ],
                description: "Basic budgeting & forecasting (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 1000,
                features: [
                  "All Basic features",
                  "Comprehensive budget development",
                  "Department-level budgeting",
                  "Detailed revenue modeling",
                  "Capital expenditure planning",
                  "Scenario analysis",
                  "Quarterly forecasting updates",
                  "Variance analysis & reporting"
                ],
                description: "Comprehensive budgeting & forecasting (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 2000,
                features: [
                  "All Standard features",
                  "Strategic budgeting process",
                  "Driver-based forecasting",
                  "Rolling forecast implementation",
                  "KPI integration",
                  "Advanced scenario modeling",
                  "Monthly forecast updates",
                  "Executive dashboard development",
                  "Budget holder training",
                  "Ongoing support & refinement"
                ],
                description: "Premium budgeting & forecasting system (One-time)"
              }
            ]
          },
          {
            name: "Virtual CFO Services",
            description: "Ongoing financial leadership and strategic guidance without the cost of a full-time CFO.",
            category: "Business Advisory",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 500,
                features: [
                  "Monthly financial review",
                  "Basic financial analysis",
                  "Cash flow monitoring",
                  "Quarterly planning meeting",
                  "Financial goal setting",
                  "Email & phone support"
                ],
                description: "Basic Virtual CFO service (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 1000,
                features: [
                  "All Basic features",
                  "Bi-weekly financial review",
                  "KPI development & monitoring",
                  "Budget development & tracking",
                  "Financial strategy development",
                  "Banking relationship management",
                  "Monthly management meeting",
                  "Unlimited support"
                ],
                description: "Comprehensive Virtual CFO service (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 2000,
                features: [
                  "All Standard features",
                  "Weekly financial oversight",
                  "Strategic business planning",
                  "Financing strategy & support",
                  "Board meeting preparation & attendance",
                  "Financial team leadership",
                  "M&A support when needed",
                  "Investment analysis",
                  "Executive team advisory",
                  "Dedicated senior CFO",
                  "24/7 priority access"
                ],
                description: "Premium Virtual CFO partnership (Monthly)"
              }
            ]
          },
          {
            name: "Business Valuation",
            description: "Professional valuation of businesses for sale, acquisition, succession planning, or other purposes.",
            category: "Business Advisory",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 1000,
                features: [
                  "Basic business valuation",
                  "Single valuation method",
                  "Historical financial analysis",
                  "Industry benchmarking",
                  "Summary valuation report"
                ],
                description: "Basic business valuation (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 2500,
                features: [
                  "All Basic features",
                  "Comprehensive valuation",
                  "Multiple valuation methods",
                  "Detailed financial analysis",
                  "Adjustments for non-recurring items",
                  "Risk assessment",
                  "Detailed valuation report",
                  "Presentation of findings"
                ],
                description: "Comprehensive business valuation (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 5000,
                features: [
                  "All Standard features",
                  "Advanced business valuation",
                  "Customized valuation approach",
                  "Scenario analysis",
                  "Intangible asset valuation",
                  "Industry & market analysis",
                  "Value driver identification",
                  "Value enhancement recommendations",
                  "Expert witness support if needed",
                  "Negotiation support",
                  "Comprehensive report & presentation"
                ],
                description: "Premium business valuation & analysis (One-time)"
              }
            ]
          }
        ],

        // 5. COMPANY SECRETARIAL
        "Company Secretarial": [
          {
            name: "New Company Formation",
            description: "Complete company formation service including all necessary documentation and registration with the CRO.",
            category: "Company Secretarial",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 250,
                features: [
                  "Standard company formation",
                  "CRO filing",
                  "Certificate of incorporation",
                  "Memorandum & Articles of Association",
                  "Company seal"
                ],
                description: "Basic company formation (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 450,
                features: [
                  "All Basic features",
                  "Business name registration",
                  "VAT registration",
                  "Tax registration",
                  "Bank account introduction",
                  "Initial board minutes",
                  "Share certificates"
                ],
                description: "Standard company formation with registrations (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 750,
                features: [
                  "All Standard features",
                  "Custom company constitution",
                  "Registered office service (1 year)",
                  "Company secretary service (1 year)",
                  "Beneficial ownership registration",
                  "Director service agreements",
                  "Shareholder agreements",
                  "Post-incorporation compliance review"
                ],
                description: "Premium company formation with ongoing support (One-time)"
              }
            ]
          },
          {
            name: "Annual Return Filing",
            description: "Preparation and filing of annual returns with the Companies Registration Office (CRO).",
            category: "Company Secretarial",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 150,
                features: [
                  "Form B1 preparation",
                  "CRO filing",
                  "Filing fee handling",
                  "Confirmation statement",
                  "Deadline monitoring"
                ],
                description: "Basic annual return filing (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 250,
                features: [
                  "All Basic features",
                  "Financial statements review",
                  "Abridged accounts preparation",
                  "Director signatures coordination",
                  "Register updates",
                  "Compliance review"
                ],
                description: "Standard annual return service (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 400,
                features: [
                  "All Standard features",
                  "Full compliance review",
                  "Beneficial ownership updates",
                  "Person with significant control review",
                  "Company registers maintenance",
                  "Statutory books update",
                  "Post-filing compliance report",
                  "Next year planning"
                ],
                description: "Premium annual return & compliance service (One-time)"
              }
            ]
          },
          {
            name: "Company Secretarial Compliance",
            description: "Ongoing company secretarial services to ensure compliance with Irish company law.",
            category: "Company Secretarial",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 75,
                features: [
                  "Statutory register maintenance",
                  "Annual compliance calendar",
                  "Filing deadline monitoring",
                  "Basic compliance advice",
                  "Officer changes processing"
                ],
                description: "Basic company secretarial service (Monthly)"
              },
              {
                type: PlanType.STANDARD,
                price: 150,
                features: [
                  "All Basic features",
                  "Board meeting minutes",
                  "Resolution preparation",
                  "Share transfers processing",
                  "Registered office service",
                  "CRO correspondence handling",
                  "Quarterly compliance review"
                ],
                description: "Standard company secretarial service (Monthly)"
              },
              {
                type: PlanType.PREMIUM,
                price: 300,
                features: [
                  "All Standard features",
                  "Dedicated company secretary",
                  "Board meeting attendance",
                  "AGM preparation & attendance",
                  "Full compliance monitoring",
                  "Corporate governance advice",
                  "Director training",
                  "Complex transactions support",
                  "Monthly compliance report"
                ],
                description: "Premium company secretarial service (Monthly)"
              }
            ]
          }
        ],

        // 6. AUDIT & ASSURANCE
        "Audit & Assurance": [
          {
            name: "Statutory Audit",
            description: "Independent audit of financial statements in compliance with Irish statutory requirements.",
            category: "Audit & Assurance",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 3000,
                features: [
                  "Statutory audit for small companies",
                  "Audit planning",
                  "Fieldwork",
                  "Audit report",
                  "Management letter",
                  "Basic recommendations"
                ],
                description: "Basic statutory audit for small companies (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 5000,
                features: [
                  "All Basic features",
                  "Statutory audit for medium companies",
                  "Detailed testing procedures",
                  "Comprehensive internal control review",
                  "Detailed management letter",
                  "Post-audit meeting",
                  "Implementation support for recommendations"
                ],
                description: "Standard statutory audit for medium companies (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 8000,
                features: [
                  "All Standard features",
                  "Statutory audit for large companies",
                  "Complex group structures",
                  "International considerations",
                  "Advanced audit techniques",
                  "Fraud risk assessment",
                  "Detailed recommendations",
                  "Year-round support",
                  "Quarterly check-ins"
                ],
                description: "Premium statutory audit for large companies (One-time)"
              }
            ]
          },
          {
            name: "Internal Audit",
            description: "Independent assessment of internal controls, risk management, and governance processes.",
            category: "Audit & Assurance",
            tiers: [
              {
                type: PlanType.BASIC,
                price: 2000,
                features: [
                  "Basic internal control review",
                  "Risk assessment",
                  "Compliance testing",
                  "Findings report",
                  "Recommendations"
                ],
                description: "Basic internal audit (One-time)"
              },
              {
                type: PlanType.STANDARD,
                price: 4000,
                features: [
                  "All Basic features",
                  "Comprehensive control review",
                  "Detailed risk assessment",
                  "Process improvement recommendations",
                  "Management presentation",
                  "Implementation support",
                  "Follow-up review"
                ],
                description: "Standard internal audit (One-time)"
              },
              {
                type: PlanType.PREMIUM,
                price: 7000,
                features: [
                  "All Standard features",
                  "Full internal audit program",
                  "Multiple department review",
                  "Fraud prevention assessment",
                  "Governance review",
                  "Best practice benchmarking",
                  "Detailed action plan",
                  "Quarterly follow-up",
                  "Audit committee reporting"
                ],
                description: "Premium internal audit program (One-time)"
              }
            ]
          }
        ]
      };

      // Create services for each category
      for (const [category, services] of Object.entries(servicesByCategory)) {
        console.log(`Creating ${services.length} services for category: ${category}`);
        
        for (const service of services) {
          // Create the service
          const createdService = await prisma.product.create({
            data: {
              name: service.name,
              description: service.description,
              type: ProductType.SERVICE,
              category: service.category || category,
              status: 'Active',
              companyId: company.id
            }
          });

          // Create tiers for the service
          for (const tier of service.tiers) {
            await prisma.productTier.create({
              data: {
                productId: createdService.id,
                type: tier.type,
                price: tier.price,
                features: tier.features,
                description: tier.description
              }
            });
          }
        }
      }

      console.log(`Successfully created services for company: ${company.name}`);
    }

    console.log('Services seed completed successfully');
    return true;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedServices;
