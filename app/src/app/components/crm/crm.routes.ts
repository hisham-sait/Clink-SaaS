import { Routes } from '@angular/router';

export const CRM_ROUTES: Routes = [
  {
    path: 'crm',
    children: [
      // CRM Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.CrmDashboardComponent),
        data: {
          title: 'CRM Dashboard',
          breadcrumb: 'Dashboard'
        }
      },

      // Contacts & Companies
      {
        path: 'contacts',
        loadComponent: () => import('./contacts/contacts.component')
          .then(m => m.CrmContactsComponent),
        data: {
          title: 'CRM Contacts',
          breadcrumb: 'Contacts'
        }
      },
      {
        path: 'companies',
        loadComponent: () => import('./companies/companies.component')
          .then(m => m.CrmCompaniesComponent),
        data: {
          title: 'CRM Companies',
          breadcrumb: 'Companies'
        }
      },

      // Marketing Hub
      {
        path: 'marketing',
        loadComponent: () => import('./marketing/marketing.component')
          .then(m => m.MarketingHubComponent),
        data: {
          title: 'Marketing Hub',
          breadcrumb: 'Marketing'
        }
      },

      // Sales Hub
      {
        path: 'sales',
        loadComponent: () => import('./sales/sales.component')
          .then(m => m.SalesHubComponent),
        data: {
          title: 'Sales Hub',
          breadcrumb: 'Sales'
        }
      },

      // Service Hub
      {
        path: 'service',
        loadComponent: () => import('./service/service.component')
          .then(m => m.ServiceHubComponent),
        data: {
          title: 'Service Hub',
          breadcrumb: 'Service'
        }
      },

      // Operations Hub
      {
        path: 'operations',
        loadComponent: () => import('./operations/operations.component')
          .then(m => m.OperationsHubComponent),
        data: {
          title: 'Operations Hub',
          breadcrumb: 'Operations'
        }
      },

      // CMS Hub
      {
        path: 'cms',
        loadComponent: () => import('./cms/cms.component')
          .then(m => m.CmsHubComponent),
        data: {
          title: 'CMS Hub',
          breadcrumb: 'CMS'
        }
      }
    ],
    data: {
      title: 'CRM',
      breadcrumb: 'CRM'
    }
  }
];
