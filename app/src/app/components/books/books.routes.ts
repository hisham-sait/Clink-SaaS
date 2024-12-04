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
        loadComponent: () => import('./accounting/accounting.component')
          .then(m => m.AccountingComponent),
        data: {
          title: 'Accounting',
          breadcrumb: 'Accounting'
        }
      },
      {
        path: 'banking',
        loadComponent: () => import('./banking/banking.component')
          .then(m => m.BankingComponent),
        data: {
          title: 'Banking',
          breadcrumb: 'Banking'
        }
      },

      // Revenue & Expenses
      {
        path: 'invoicing',
        loadComponent: () => import('./invoicing/invoicing.component')
          .then(m => m.InvoicingComponent),
        data: {
          title: 'Invoicing',
          breadcrumb: 'Invoicing'
        }
      },
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
