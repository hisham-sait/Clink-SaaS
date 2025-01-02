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
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: {
          title: 'Statutory Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'directors',
        children: [
          {
            path: '',
            loadComponent: () => 
              import('./directors/directors.component').then(m => m.DirectorsComponent),
            data: {
              title: 'Directors & Secretaries Register',
              breadcrumb: 'Directors & Secretaries'
            }
          },
          {
            path: ':id',
            loadComponent: () => 
              import('./directors/view/view.component').then(m => m.ViewComponent),
            data: {
              title: 'Director Details',
              breadcrumb: 'Director Details'
            }
          }
        ]
      },
      {
        path: 'shareholders',
        children: [
          {
            path: '',
            loadComponent: () => 
              import('./shareholders/shareholders.component').then(m => m.ShareholdersComponent),
            data: {
              title: 'Members Register',
              breadcrumb: 'Members'
            }
          },
          {
            path: ':id',
            loadComponent: () => 
              import('./shareholders/view/view.component').then(m => m.ViewComponent),
            data: {
              title: 'Shareholder Details',
              breadcrumb: 'Shareholder Details'
            }
          }
        ]
      },
      {
        path: 'shares',
        loadComponent: () => 
          import('./shares/shares.component').then(m => m.SharesComponent),
        data: {
          title: 'Share Register',
          breadcrumb: 'Shares'
        }
      },
      {
        path: 'beneficial-owners',
        loadComponent: () => 
          import('./beneficial-owners/beneficial-owners.component').then(m => m.BeneficialOwnersComponent),
        data: {
          title: 'Beneficial Owners Register',
          breadcrumb: 'Beneficial Owners'
        }
      },
      {
        path: 'charges',
        loadComponent: () => 
          import('./charges/charges.component').then(m => m.ChargesComponent),
        data: {
          title: 'Charges Register',
          breadcrumb: 'Charges'
        }
      },
      {
        path: 'allotments',
        loadComponent: () => 
          import('./allotments/allotments.component').then(m => m.AllotmentsComponent),
        data: {
          title: 'Share Allotments Register',
          breadcrumb: 'Allotments'
        }
      },
      {
        path: 'meetings',
        loadComponent: () => 
          import('./meetings/meetings.component').then(m => m.MeetingsComponent),
        data: {
          title: 'General Meetings Minutes',
          breadcrumb: 'General Meetings'
        }
      },
      {
        path: 'board-minutes',
        loadComponent: () => 
          import('./board-minutes/board-minutes.component').then(m => m.BoardMinutesComponent),
        data: {
          title: 'Board Minutes Register',
          breadcrumb: 'Board Minutes'
        }
      }
    ],
    data: {
      title: 'Statutory',
      breadcrumb: 'Statutory'
    }
  }
];
