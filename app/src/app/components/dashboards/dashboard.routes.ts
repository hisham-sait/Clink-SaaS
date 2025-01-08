import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';
import { PlatformAdminDashboardComponent } from './platform-admin-dashboard.component';
import { CompanyAdminDashboardComponent } from './company-admin-dashboard.component';
import { CompanyManagerDashboardComponent } from './company-manager-dashboard.component';
import { AccountantDashboardComponent } from './accountant-dashboard.component';
import { ViewerDashboardComponent } from './viewer-dashboard.component';
import { ExternalAuditorDashboardComponent } from './external-auditor-dashboard.component';
import { TaxAdvisorDashboardComponent } from './tax-advisor-dashboard.component';
import { LegalAdvisorDashboardComponent } from './legal-advisor-dashboard.component';
import { ExternalConsultantDashboardComponent } from './external-consultant-dashboard.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'super-admin',
        component: SuperAdminDashboardComponent,
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: 'platform-admin',
        component: PlatformAdminDashboardComponent,
        data: { roles: ['PlatformAdmin'] }
      },
      {
        path: 'company-admin',
        component: CompanyAdminDashboardComponent,
        data: { roles: ['CompanyAdmin'] }
      },
      {
        path: 'company-manager',
        component: CompanyManagerDashboardComponent,
        data: { roles: ['CompanyManager'] }
      },
      {
        path: 'accountant',
        component: AccountantDashboardComponent,
        data: { roles: ['Accountant'] }
      },
      {
        path: 'viewer',
        component: ViewerDashboardComponent,
        data: { roles: ['Viewer'] }
      },
      {
        path: 'external-auditor',
        component: ExternalAuditorDashboardComponent,
        data: { roles: ['ExternalAuditor'] }
      },
      {
        path: 'tax-advisor',
        component: TaxAdvisorDashboardComponent,
        data: { roles: ['TaxAdvisor'] }
      },
      {
        path: 'legal-advisor',
        component: LegalAdvisorDashboardComponent,
        data: { roles: ['LegalAdvisor'] }
      },
      {
        path: 'external-consultant',
        component: ExternalConsultantDashboardComponent,
        data: { roles: ['ExternalConsultant'] }
      }
    ]
  }
];
