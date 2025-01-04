import { Routes } from '@angular/router';

export const STATUTORY_ROUTES: Routes = [
  {
    path: 'statutory',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./dashboard.component').then(m => m.DashboardComponent),
        data: {
          title: 'Statutory Dashboard',
          breadcrumb: 'Dashboard',
          description: 'Overview of company statutory records and registers'
        }
      },
      {
        path: 'directors',
        loadComponent: () => 
          import('./directors/directors.component').then(m => m.DirectorsComponent),
        data: {
          title: 'Directors & Secretaries Register',
          breadcrumb: 'Directors & Secretaries',
          description: 'Manage and maintain records of company directors and secretaries'
        }
      },
      {
        path: 'shareholders',
        loadComponent: () => 
          import('./shareholders/shareholders.component').then(m => m.ShareholdersComponent),
        data: {
          title: 'Members Register',
          breadcrumb: 'Members',
          description: 'Track company shareholders and their holdings'
        }
      },
      {
        path: 'shares',
        loadComponent: () => 
          import('./shares/shares.component').then(m => m.SharesComponent),
        data: {
          title: 'Share Register',
          breadcrumb: 'Shares',
          description: 'Monitor share allocations and transfers'
        }
      },
      {
        path: 'beneficial-owners',
        loadComponent: () => 
          import('./beneficial-owners/beneficial-owners.component').then(m => m.BeneficialOwnersComponent),
        data: {
          title: 'Beneficial Owners Register',
          breadcrumb: 'Beneficial Owners',
          description: 'Record and maintain beneficial ownership information'
        }
      },
      {
        path: 'charges',
        loadComponent: () => 
          import('./charges/charges.component').then(m => m.ChargesComponent),
        data: {
          title: 'Charges Register',
          breadcrumb: 'Charges',
          description: 'Track company charges and mortgages'
        }
      },
      {
        path: 'allotments',
        loadComponent: () => 
          import('./allotments/allotments.component').then(m => m.AllotmentsComponent),
        data: {
          title: 'Share Allotments Register',
          breadcrumb: 'Allotments',
          description: 'Manage share allotments and transfers'
        }
      },
      {
        path: 'meetings',
        loadComponent: () => 
          import('./meetings/meetings.component').then(m => m.MeetingsComponent),
        data: {
          title: 'General Meetings Minutes',
          breadcrumb: 'General Meetings',
          description: 'Record and store minutes of general meetings'
        }
      },
      {
        path: 'board-minutes',
        loadComponent: () => 
          import('./board-minutes/board-minutes.component').then(m => m.BoardMinutesComponent),
        data: {
          title: 'Board Minutes Register',
          breadcrumb: 'Board Minutes',
          description: 'Maintain records of board meetings and resolutions'
        }
      }
    ],
    data: {
      title: 'Statutory',
      breadcrumb: 'Statutory',
      description: 'Manage company statutory records and registers'
    }
  }
];
