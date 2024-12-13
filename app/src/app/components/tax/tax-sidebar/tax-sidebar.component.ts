import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tax-sidebar',
  templateUrl: './tax-sidebar.component.html',
  styleUrls: ['./tax-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TaxSidebarComponent {
  navItems = [
    {
      path: '/tax/dashboard',
      icon: 'bi-grid',
      label: 'Dashboard'
    },
    {
      path: '/tax/vat',
      icon: 'bi-receipt',
      label: 'VAT'
    },
    {
      path: '/tax/income-tax',
      icon: 'bi-person-badge',
      label: 'Income Tax'
    },
    {
      path: '/tax/corporation-tax',
      icon: 'bi-building',
      label: 'Corporation Tax'
    },
    {
      path: '/tax/capital-gains',
      icon: 'bi-graph-up-arrow',
      label: 'Capital Gains'
    },
    {
      path: '/tax/payroll-tax',
      icon: 'bi-people',
      label: 'Payroll Tax'
    }
  ];
}
