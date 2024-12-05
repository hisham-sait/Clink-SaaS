import { Routes } from '@angular/router';

export const BOOKS_ROUTES: Routes = [
  {
    path: 'books',
    children: [
      // Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        data: {
          title: 'Books Dashboard',
          breadcrumb: 'Dashboard'
        }
      },

      // Financial Management
      {
        path: 'accounting',
        children: [
          {
            path: '',
            loadComponent: () => import('./accounting/accounting.component')
              .then(m => m.AccountingComponent),
            data: {
              title: 'Accounting',
              breadcrumb: 'Accounting'
            }
          },
          {
            path: 'chart-of-accounts',
            loadComponent: () => import('./accounting/chart-of-accounts/chart-of-accounts.component')
              .then(m => m.ChartOfAccountsComponent),
            data: {
              title: 'Chart of Accounts',
              breadcrumb: 'Chart of Accounts'
            }
          },
          {
            path: 'journal-entries',
            loadComponent: () => import('./accounting/journal-entries/journal-entries.component')
              .then(m => m.JournalEntriesComponent),
            data: {
              title: 'Journal Entries',
              breadcrumb: 'Journal Entries'
            }
          },
          {
            path: 'reports',
            loadComponent: () => import('./accounting/reports/reports.component')
              .then(m => m.ReportsComponent),
            data: {
              title: 'Financial Reports',
              breadcrumb: 'Reports'
            }
          },
          {
            path: 'reconciliation',
            loadComponent: () => import('./accounting/reconciliation/reconciliation.component')
              .then(m => m.ReconciliationComponent),
            data: {
              title: 'Bank Reconciliation',
              breadcrumb: 'Reconciliation'
            }
          }
        ]
      },
      {
        path: 'banking',
        children: [
          {
            path: '',
            loadComponent: () => import('./banking/banking.component')
              .then(m => m.BankingComponent),
            data: {
              title: 'Banking',
              breadcrumb: 'Banking'
            }
          },
          {
            path: 'accounts',
            loadComponent: () => import('./banking/accounts/accounts.component')
              .then(m => m.AccountsComponent),
            data: {
              title: 'Bank Accounts',
              breadcrumb: 'Accounts'
            }
          },
          {
            path: 'transactions',
            loadComponent: () => import('./banking/transactions/transactions.component')
              .then(m => m.TransactionsComponent),
            data: {
              title: 'Bank Transactions',
              breadcrumb: 'Transactions'
            }
          },
          {
            path: 'transfers',
            loadComponent: () => import('./banking/transfers/transfers.component')
              .then(m => m.TransfersComponent),
            data: {
              title: 'Bank Transfers',
              breadcrumb: 'Transfers'
            }
          },
          {
            path: 'statements',
            loadComponent: () => import('./banking/statements/statements.component')
              .then(m => m.StatementsComponent),
            data: {
              title: 'Bank Statements',
              breadcrumb: 'Statements'
            }
          },
          {
            path: 'budgets',
            loadComponent: () => import('./banking/budgets/budgets.component')
              .then(m => m.BudgetsComponent),
            data: {
              title: 'Banking Budgets',
              breadcrumb: 'Budgets'
            }
          },
          {
            path: 'forecasting',
            loadComponent: () => import('./banking/forecasting/forecasting.component')
              .then(m => m.ForecastingComponent),
            data: {
              title: 'Financial Forecasting',
              breadcrumb: 'Forecasting'
            }
          },
          {
            path: 'reports',
            loadComponent: () => import('./banking/reports/reports.component')
              .then(m => m.BankingReportsComponent),
            data: {
              title: 'Banking Reports',
              breadcrumb: 'Reports'
            }
          },
          {
            path: 'connect',
            loadComponent: () => import('./banking/connect/connect.component')
              .then(m => m.ConnectBankComponent),
            data: {
              title: 'Connect Bank',
              breadcrumb: 'Connect'
            }
          },
          {
            path: 'settings',
            loadComponent: () => import('./banking/settings/settings.component')
              .then(m => m.BankSettingsComponent),
            data: {
              title: 'Bank Settings',
              breadcrumb: 'Settings'
            }
          }
        ]
      },
      {
        path: 'invoicing',
        children: [
          {
            path: '',
            loadComponent: () => import('./invoicing/invoicing.component')
              .then(m => m.InvoicingComponent),
            data: {
              title: 'Invoicing',
              breadcrumb: 'Invoicing'
            }
          },
          {
            path: 'create',
            loadComponent: () => import('./invoicing/create/create.component')
              .then(m => m.CreateInvoiceComponent),
            data: {
              title: 'Create Invoice',
              breadcrumb: 'Create'
            }
          },
          {
            path: 'recurring',
            loadComponent: () => import('./invoicing/recurring/recurring.component')
              .then(m => m.RecurringInvoicesComponent),
            data: {
              title: 'Recurring Invoices',
              breadcrumb: 'Recurring'
            }
          },
          {
            path: 'templates',
            loadComponent: () => import('./invoicing/templates/templates.component')
              .then(m => m.InvoiceTemplatesComponent),
            data: {
              title: 'Invoice Templates',
              breadcrumb: 'Templates'
            }
          },
          {
            path: 'reports',
            loadComponent: () => import('./invoicing/reports/reports.component')
              .then(m => m.InvoiceReportsComponent),
            data: {
              title: 'Invoice Reports',
              breadcrumb: 'Reports'
            }
          },
          {
            path: 'settings',
            loadComponent: () => import('./invoicing/settings/settings.component')
              .then(m => m.InvoiceSettingsComponent),
            data: {
              title: 'Invoice Settings',
              breadcrumb: 'Settings'
            }
          }
        ]
      },

      // Revenue & Expenses
      {
        path: 'bills',
        loadComponent: () => import('./bills/bills.component')
          .then(m => m.BillsComponent),
        data: {
          title: 'Bills',
          breadcrumb: 'Bills'
        }
      },
      {
        path: 'expenses',
        loadComponent: () => import('./expenses/expenses.component')
          .then(m => m.ExpensesComponent),
        data: {
          title: 'Expenses',
          breadcrumb: 'Expenses'
        }
      },

      // Business Management
      {
        path: 'payroll',
        loadComponent: () => import('./payroll/payroll.component')
          .then(m => m.PayrollComponent),
        data: {
          title: 'Payroll',
          breadcrumb: 'Payroll'
        }
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/projects.component')
          .then(m => m.ProjectsComponent),
        data: {
          title: 'Projects',
          breadcrumb: 'Projects'
        }
      },

      // Reports & Documents
      {
        path: 'reports',
        loadComponent: () => import('./analytics/analytics.component')
          .then(m => m.AnalyticsComponent),
        data: {
          title: 'Reports & Analytics',
          breadcrumb: 'Reports'
        }
      },
      {
        path: 'files',
        loadComponent: () => import('./files/files.component')
          .then(m => m.FilesComponent),
        data: {
          title: 'Files & Documents',
          breadcrumb: 'Files'
        }
      },

      // Contacts Management
      {
        path: 'contacts',
        loadComponent: () => import('./contacts/contacts.component')
          .then(m => m.ContactsComponent),
        data: {
          title: 'Contacts',
          breadcrumb: 'Contacts'
        }
      }
    ],
    data: {
      title: 'Books',
      breadcrumb: 'Books'
    }
  }
];
