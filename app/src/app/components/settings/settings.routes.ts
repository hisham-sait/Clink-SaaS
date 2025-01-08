import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'settings',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => 
          import('../../components/settings/dashboard.component').then(m => m.SettingsDashboardComponent),
        data: {
          title: 'Settings Dashboard',
          breadcrumb: 'Dashboard',
          description: 'Overview of your account and application settings'
        }
      },
      {
        path: 'profile',
        loadComponent: () => 
          import('../../components/settings/profile/profile.component').then(m => m.SettingsProfileComponent),
        data: {
          title: 'Profile Settings',
          breadcrumb: 'Profile',
          description: 'Manage your personal information and preferences'
        }
      },
      {
        path: 'companies',
        loadComponent: () => 
          import('../../components/settings/companies/companies.component').then(m => m.CompaniesComponent),
        data: {
          title: 'Companies',
          breadcrumb: 'Companies',
          description: 'Manage companies and their relationships'
        }
      },
      {
        path: 'users',
        loadComponent: () => 
          import('../../components/settings/users/users.component').then(m => m.UsersComponent),
        data: {
          title: 'User Management',
          breadcrumb: 'Users',
          description: 'Manage users and their access permissions'
        }
      },
      {
        path: 'roles',
        loadComponent: () => 
          import('../../components/settings/roles/roles.component').then(m => m.RolesComponent),
        data: {
          title: 'Role Management',
          breadcrumb: 'Roles',
          description: 'Manage roles and their permissions'
        }
      },
      {
        path: 'security',
        loadComponent: () => 
          import('../../components/settings/security/security.component').then(m => m.SettingsSecurityComponent),
        data: {
          title: 'Security Settings',
          breadcrumb: 'Security',
          description: 'Manage your password and security settings'
        }
      },
      {
        path: 'preferences',
        loadComponent: () => 
          import('../../components/settings/preferences/preferences.component').then(m => m.SettingsPreferencesComponent),
        data: {
          title: 'Preferences',
          breadcrumb: 'Preferences',
          description: 'Customize your application experience'
        }
      },
      {
        path: 'integrations',
        loadComponent: () => 
          import('../../components/settings/integrations/integrations.component').then(m => m.SettingsIntegrationsComponent),
        data: {
          title: 'Integrations',
          breadcrumb: 'Integrations',
          description: 'Manage your app integrations'
        }
      },
      {
        path: 'billing',
        loadComponent: () => 
          import('../../components/settings/billing/billing.component').then(m => m.SettingsBillingComponent),
        data: {
          title: 'Billing & Subscription',
          breadcrumb: 'Billing',
          description: 'Manage your subscription and payments'
        }
      },
      {
        path: 'notifications',
        loadComponent: () => 
          import('../../components/settings/notifications/notifications.component').then(m => m.SettingsNotificationsComponent),
        data: {
          title: 'Notification Settings',
          breadcrumb: 'Notifications',
          description: 'Configure your notification preferences'
        }
      }
    ],
    data: {
      title: 'Settings',
      breadcrumb: 'Settings',
      description: 'Manage your account and application settings'
    }
  }
];
