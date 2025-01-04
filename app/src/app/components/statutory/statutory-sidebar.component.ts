import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-statutory-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-4">
      <div class="px-4 mb-2">
        <span class="text-uppercase small fw-semibold text-secondary">STATUTORY REGISTERS</span>
      </div>
      <ul class="nav flex-column">
        <li class="nav-item" *ngFor="let item of navItems">
          <a class="nav-link d-flex align-items-center py-2 px-4 text-body-secondary" 
             [routerLink]="item.route" 
             routerLinkActive="active bg-primary-subtle text-primary fw-medium"
             [class.hover-primary]="!item.route">
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
export class StatutorySidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/statutory/dashboard'
    },
    {
      label: 'Directors & Secretaries',
      icon: 'bi-person-badge',
      route: '/statutory/directors'
    },
    {
      label: 'Members Register',
      icon: 'bi-people',
      route: '/statutory/shareholders'
    },
    {
      label: 'Share Register',
      icon: 'bi-journal-bookmark',
      route: '/statutory/shares'
    },
    {
      label: 'Beneficial Owners',
      icon: 'bi-person-check',
      route: '/statutory/beneficial-owners'
    },
    {
      label: 'Charges Register',
      icon: 'bi-bank',
      route: '/statutory/charges'
    },
    {
      label: 'Share Allotments',
      icon: 'bi-plus-circle',
      route: '/statutory/allotments'
    },
    {
      label: 'General Meetings',
      icon: 'bi-calendar-event',
      route: '/statutory/meetings'
    },
    {
      label: 'Board Minutes',
      icon: 'bi-file-text',
      route: '/statutory/board-minutes'
    }
  ];
}
