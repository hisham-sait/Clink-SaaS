import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carbon-sidebar',
  templateUrl: './carbon-sidebar.component.html',
  styleUrls: ['./carbon-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CarbonSidebarComponent {
  navItems = [
    {
      path: '/carbon/dashboard',
      icon: 'bi-grid',
      label: 'Dashboard'
    },
    {
      path: '/carbon/emissions',
      icon: 'bi-cloud',
      label: 'Emissions'
    },
    {
      path: '/carbon/reports',
      icon: 'bi-file-earmark-text',
      label: 'Reports'
    },
    {
      path: '/carbon/offsets',
      icon: 'bi-tree',
      label: 'Offsets'
    },
    {
      path: '/carbon/goals',
      icon: 'bi-bullseye',
      label: 'Goals'
    },
    {
      path: '/carbon/settings',
      icon: 'bi-gear',
      label: 'Settings'
    }
  ];
}
