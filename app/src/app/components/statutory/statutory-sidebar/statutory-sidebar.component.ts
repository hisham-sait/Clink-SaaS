import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-statutory-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './statutory-sidebar.component.html',
  styleUrls: ['./statutory-sidebar.component.scss']
})
export class StatutorySidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/statutory/dashboard',
      icon: 'bi-speedometer2'
    },
    {
      label: 'Directors & Secretaries',
      route: '/statutory/directors',
      icon: 'bi-person-badge'
    },
    {
      label: 'Members (Shareholders)',
      route: '/statutory/shareholders',
      icon: 'bi-people'
    },
    {
      label: 'Share Register',
      route: '/statutory/shares',
      icon: 'bi-journal-bookmark'
    },
    {
      label: 'Beneficial Owners',
      route: '/statutory/beneficial-owners',
      icon: 'bi-person-check'
    },
    {
      label: 'Charges Register',
      route: '/statutory/charges',
      icon: 'bi-bank'
    },
    {
      label: 'Share Allotments',
      route: '/statutory/allotments',
      icon: 'bi-plus-circle'
    },
    {
      label: 'General Meetings',
      route: '/statutory/meetings',
      icon: 'bi-calendar-event'
    },
    {
      label: 'Board Minutes',
      route: '/statutory/board-minutes',
      icon: 'bi-file-text'
    }
  ];
}
