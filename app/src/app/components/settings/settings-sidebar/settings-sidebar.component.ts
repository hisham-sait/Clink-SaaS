import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings-sidebar',
  templateUrl: './settings-sidebar.component.html',
  styleUrls: ['./settings-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SettingsSidebarComponent {
  navItems = [
    {
      path: '/settings/profile',
      icon: 'bi-person',
      label: 'Profile'
    },
    {
      path: '/settings/organization',
      icon: 'bi-building',
      label: 'Organization'
    },
    {
      path: '/settings/preferences',
      icon: 'bi-sliders',
      label: 'Preferences'
    },
    {
      path: '/settings/security',
      icon: 'bi-shield-lock',
      label: 'Security'
    },
    {
      path: '/settings/integrations',
      icon: 'bi-plug',
      label: 'Integrations'
    },
    {
      path: '/settings/billing',
      icon: 'bi-credit-card',
      label: 'Billing'
    },
    {
      path: '/settings/notifications',
      icon: 'bi-bell',
      label: 'Notifications'
    }
  ];
}
