import { Routes } from '@angular/router';
import { TAX_ROUTES } from './components/tax/tax.routes';
import { COMPLIANCE_ROUTES } from './components/compliance/compliance.routes';
import { STATUTORY_ROUTES } from './components/statutory/statutory.routes';
import { SETTINGS_ROUTES } from './components/settings/settings.routes';
import { AUTH_ROUTES } from './components/auth/auth.routes';
import { dashboardRoutes } from './components/dashboards/dashboard.routes';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect - AuthGuard will handle role-based redirection
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [],
    data: { 
      title: 'Dashboard',
      breadcrumb: 'Dashboard'
    }
  },

  // Public auth routes
  ...AUTH_ROUTES,

  // Protected routes
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      // Role-specific dashboards
      {
        path: 'dashboard',
        children: dashboardRoutes,
        data: {
          title: 'Dashboard',
          breadcrumb: 'Dashboard'
        }
      },

      // Feature routes
      ...TAX_ROUTES,
      ...COMPLIANCE_ROUTES,
      ...STATUTORY_ROUTES,
      ...SETTINGS_ROUTES,

      {
        path: 'help',
        redirectTo: '/settings',
        pathMatch: 'full',
        data: { 
          title: 'Help & Support',
          breadcrumb: 'Help'
        }
      }
    ]
  },

  { 
    path: '404', 
    loadComponent: () => import('./components/shared/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    data: { 
      title: 'Page Not Found',
      breadcrumb: '404'
    }
  },

  { 
    path: '**', 
    redirectTo: '/404',
    pathMatch: 'full'
  }
];
