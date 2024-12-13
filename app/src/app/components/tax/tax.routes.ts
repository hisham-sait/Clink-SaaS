import { Routes } from '@angular/router';

export const TAX_ROUTES: Routes = [
  {
    path: 'tax',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tax Dashboard'
      },
      {
        path: 'vat',
        loadComponent: () => import('./vat/vat.component').then(m => m.VatComponent),
        title: 'VAT Management'
      },
      {
        path: 'income-tax',
        loadComponent: () => import('./income-tax/income-tax.component').then(m => m.IncomeTaxComponent),
        title: 'Income Tax'
      },
      {
        path: 'corporation-tax',
        loadComponent: () => import('./corporation-tax/corporation-tax.component').then(m => m.CorporationTaxComponent),
        title: 'Corporation Tax'
      },
      {
        path: 'capital-gains',
        loadComponent: () => import('./capital-gains/capital-gains.component').then(m => m.CapitalGainsComponent),
        title: 'Capital Gains Tax'
      },
      {
        path: 'payroll-tax',
        loadComponent: () => import('./payroll-tax/payroll-tax.component').then(m => m.PayrollTaxComponent),
        title: 'Payroll Tax'
      }
    ]
  }
];
