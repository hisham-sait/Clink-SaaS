import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-compliance-sidebar',
  templateUrl: './compliance-sidebar.component.html',
  styleUrls: ['./compliance-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ComplianceSidebarComponent {
  navItems: NavItem[] = [
    {
      path: '/compliance/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard'
    },
    {
      path: '/compliance/regulatory',
      icon: 'bi-shield-check',
      label: 'Regulatory'
    },
    {
      path: '/compliance/requirements',
      icon: 'bi-list-check',
      label: 'Requirements'
    },
    {
      path: '/compliance/filing',
      icon: 'bi-file-earmark-text',
      label: 'Filing'
    },
    {
      path: '/compliance/audits',
      icon: 'bi-search',
      label: 'Audits'
    },
    {
      path: '/compliance/policies',
      icon: 'bi-journal-text',
      label: 'Policies'
    },
    {
      path: '/compliance/esg',
      icon: 'bi bi-tree',
      label: 'ESG'
    },
    {
      path: '/compliance/governance',
      icon: 'bi-diagram-3',
      label: 'Governance'
    },
    {
      path: '/compliance/tracking',
      icon: 'bi-graph-up',
      label: 'Tracking'
    },
    {
      path: '/compliance/reports',
      icon: 'bi-file-earmark-bar-graph',
      label: 'Reports'
    }
  ];
}
