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
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-4">
      <div class="px-4 mb-2">
        <span class="text-uppercase small fw-semibold text-secondary">COMPLIANCE</span>
      </div>
      <ul class="nav flex-column">
        <li class="nav-item" *ngFor="let item of navItems">
          <a class="nav-link d-flex align-items-center py-2 px-4 text-body-secondary" 
             [routerLink]="item.path" 
             routerLinkActive="active bg-primary-subtle text-primary fw-medium">
            <i class="bi fs-5 me-3" [class]="item.icon"></i>
            <span class="small">{{item.label}}</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .nav-link:hover {
      background-color: var(--bs-primary-bg-subtle);
      color: var(--bs-primary) !important;
    }
    .nav-link:hover i {
      color: var(--bs-primary);
    }
  `]
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
