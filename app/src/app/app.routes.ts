import { Routes } from '@angular/router';
import { BOOKS_ROUTES } from './shared/routes/books.routes';
import { CRM_ROUTES } from './shared/routes/crm.routes';
import { CARBON_ROUTES } from './shared/routes/carbon.routes';
import { TAX_ROUTES } from './shared/routes/tax.routes';
import { COMPLIANCE_ROUTES } from './shared/routes/compliance.routes';
import { STATUTORY_ROUTES } from './shared/routes/statutory.routes';

export const routes: Routes = [
  // Default redirect
  { 
    path: '', 
    redirectTo: '/books/dashboard', 
    pathMatch: 'full',
    data: { 
      title: 'Dashboard',
      breadcrumb: 'Dashboard'
    }
  },

  // Books Module Routes
  ...BOOKS_ROUTES,

  // CRM Module Routes
  ...CRM_ROUTES,

  // Carbon Module Routes
  ...CARBON_ROUTES,

  // Tax Module Routes
  ...TAX_ROUTES,

  // Compliance Module Routes
  ...COMPLIANCE_ROUTES,

  // Statutory Module Routes
  ...STATUTORY_ROUTES,

  // Settings Route (lazy loaded)
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component')
      .then(m => m.SettingsComponent),
    data: { 
      title: 'Settings',
      breadcrumb: 'Settings'
    }
  },

  // Help & Support Route
  {
    path: 'help',
    redirectTo: '/settings',
    pathMatch: 'full',
    data: { 
      title: 'Help & Support',
      breadcrumb: 'Help'
    }
  },

  // 404 Not Found Route
  { 
    path: '404', 
    loadComponent: () => import('./components/shared/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    data: { 
      title: 'Page Not Found',
      breadcrumb: '404'
    }
  },

  // Fallback route - redirects all unknown paths to 404
  { 
    path: '**', 
    redirectTo: '/404',
    pathMatch: 'full'
  }
];
