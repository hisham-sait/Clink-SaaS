import { Routes } from '@angular/router';

export const CARBON_ROUTES: Routes = [
  {
    path: 'carbon',
    children: [
      // Carbon Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.CarbonDashboardComponent),
        data: {
          title: 'Carbon Dashboard',
          breadcrumb: 'Dashboard'
        }
      },

      // Emissions Tracking
      {
        path: 'emissions',
        loadComponent: () => import('./emissions/emissions.component')
          .then(m => m.EmissionsComponent),
        data: {
          title: 'Emissions Tracking',
          breadcrumb: 'Emissions'
        }
      },

      // Carbon Reports
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component')
          .then(m => m.CarbonReportsComponent),
        data: {
          title: 'Carbon Reports',
          breadcrumb: 'Reports'
        }
      },

      // Carbon Offsets
      {
        path: 'offsets',
        loadComponent: () => import('./offsets/offsets.component')
          .then(m => m.OffsetsComponent),
        data: {
          title: 'Carbon Offsets',
          breadcrumb: 'Offsets'
        }
      },

      // Sustainability Goals
      {
        path: 'goals',
        loadComponent: () => import('./goals/goals.component')
          .then(m => m.SustainabilityGoalsComponent),
        data: {
          title: 'Sustainability Goals',
          breadcrumb: 'Goals'
        }
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component')
          .then(m => m.CarbonSettingsComponent),
        data: {
          title: 'Carbon Settings',
          breadcrumb: 'Settings'
        }
      }
    ],
    data: {
      title: 'Carbon',
      breadcrumb: 'Carbon'
    }
  }
];
