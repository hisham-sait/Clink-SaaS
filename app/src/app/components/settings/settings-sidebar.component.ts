import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavItem } from './settings.types';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule],
  template: `
    <div class="py-4">
      <div class="px-4 mb-2">
        <span class="text-uppercase small fw-semibold text-secondary">Settings</span>
      </div>
      <ul class="nav flex-column">
        <li class="nav-item" *ngFor="let item of navItems">
          <a class="nav-link d-flex align-items-center py-2 px-4 text-body-secondary" 
             [routerLink]="[item.path]" 
             routerLinkActive="active bg-primary-subtle text-primary fw-medium"
             [routerLinkActiveOptions]="{ exact: item.path === '/settings/dashboard' }">
            <i class="bi fs-5 me-3" [class]="item.icon"></i>
            <span class="small">{{item.title}}</span>
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

    @media (max-width: 768px) {
      .nav-link {
        padding: 0.625rem 1.25rem;
      }
      .bi {
        font-size: 1rem;
        margin-right: 0.875rem;
      }
      span {
        font-size: 0.875rem;
      }
    }
  `]
})
export class SettingsSidebarComponent {
  navItems: NavItem[] = [
    {
      path: '/settings/dashboard',
      title: 'Dashboard',
      icon: 'bi-grid',
      description: 'Overview of your account and application settings'
    },
    {
      path: '/settings/profile',
      title: 'Profile',
      icon: 'bi-person',
      description: 'Manage your personal information and preferences'
    },
    {
      path: '/settings/organization',
      title: 'Organization',
      icon: 'bi-building',
      description: 'Configure your organization details'
    },
    {
      path: '/settings/security',
      title: 'Security',
      icon: 'bi-shield-lock',
      description: 'Manage your password and security settings'
    },
    {
      path: '/settings/preferences',
      title: 'Preferences',
      icon: 'bi-gear',
      description: 'Customize your application experience'
    },
    {
      path: '/settings/integrations',
      title: 'Integrations',
      icon: 'bi-plug',
      description: 'Manage your app integrations'
    },
    {
      path: '/settings/billing',
      title: 'Billing',
      icon: 'bi-credit-card',
      description: 'Manage your subscription and payments'
    },
    {
      path: '/settings/notifications',
      title: 'Notifications',
      icon: 'bi-bell',
      description: 'Configure your notification preferences'
    }
  ];
}
