import { Routes } from '@angular/router';

export const COMPLIANCE_ROUTES: Routes = [
  {
    path: 'compliance',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./../../components/compliance/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Compliance Dashboard',
        data: { section: 'compliance' }
      },
      {
        path: 'regulatory',
        loadComponent: () => import('./../../components/compliance/regulatory/regulatory.component').then(m => m.RegulatoryComponent),
        title: 'Regulatory Compliance',
        data: { section: 'compliance' }
      },
      {
        path: 'filing',
        loadComponent: () => import('./../../components/compliance/filing/filing.component').then(m => m.FilingComponent),
        title: 'Compliance Filing',
        data: { section: 'compliance' }
      },
      {
        path: 'reports',
        loadComponent: () => import('./../../components/compliance/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Compliance Reports',
        data: { section: 'compliance' }
      },
      {
        path: 'requirements',
        loadComponent: () => import('./../../components/compliance/requirements/requirements.component').then(m => m.RequirementsComponent),
        title: 'Compliance Requirements',
        data: { section: 'compliance' }
      },
      {
        path: 'audits',
        loadComponent: () => import('./../../components/compliance/audits/audits.component').then(m => m.AuditsComponent),
        title: 'Compliance Audits',
        data: { section: 'compliance' }
      },
      {
        path: 'policies',
        loadComponent: () => import('./../../components/compliance/policies/policies.component').then(m => m.PoliciesComponent),
        title: 'Compliance Policies',
        data: { section: 'compliance' }
      },
      {
        path: 'esg',
        loadComponent: () => import('./../../components/compliance/esg/esg.component').then(m => m.ESGComponent),
        title: 'ESG Compliance',
        data: { section: 'compliance' }
      },
      {
        path: 'governance',
        loadComponent: () => import('./../../components/compliance/governance/governance.component').then(m => m.GovernanceComponent),
        title: 'Compliance Governance',
        data: { section: 'compliance' }
      },
      {
        path: 'tracking',
        loadComponent: () => import('./../../components/compliance/tracking/tracking.component').then(m => m.TrackingComponent),
        title: 'Compliance Tracking',
        data: { section: 'compliance' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
