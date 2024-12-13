import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-sidebar',
  templateUrl: './crm-sidebar.component.html',
  styleUrls: ['./crm-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CrmSidebarComponent {
  navItems = [
    {
      path: '/crm/dashboard',
      icon: 'bi-grid',
      label: 'Dashboard'
    },
    {
      path: '/crm/contacts',
      icon: 'bi-person',
      label: 'Contacts'
    },
    {
      path: '/crm/companies',
      icon: 'bi-building',
      label: 'Companies'
    },
    {
      path: '/crm/marketing',
      icon: 'bi-megaphone',
      label: 'Marketing Hub'
    },
    {
      path: '/crm/sales',
      icon: 'bi-graph-up',
      label: 'Sales Hub'
    },
    {
      path: '/crm/service',
      icon: 'bi-headset',
      label: 'Service Hub'
    },
    {
      path: '/crm/operations',
      icon: 'bi-gear',
      label: 'Operations Hub'
    },
    {
      path: '/crm/cms',
      icon: 'bi-window',
      label: 'CMS Hub'
    }
  ];
}
