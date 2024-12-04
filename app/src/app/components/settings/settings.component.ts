import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SettingsComponent {
  settingsSections = [
    {
      title: 'Account Settings',
      icon: 'bi bi-person',
      settings: [
        { name: 'Profile Information', description: 'Update your personal information' },
        { name: 'Password & Security', description: 'Manage your password and security settings' },
        { name: 'Email Preferences', description: 'Configure your email notifications' }
      ]
    },
    {
      title: 'Organization Settings',
      icon: 'bi bi-building',
      settings: [
        { name: 'Company Profile', description: 'Update your company information' },
        { name: 'User Management', description: 'Manage users and permissions' },
        { name: 'Billing & Subscription', description: 'View and manage billing information' }
      ]
    },
    {
      title: 'App Settings',
      icon: 'bi bi-gear',
      settings: [
        { name: 'Appearance', description: 'Customize the look and feel' },
        { name: 'Notifications', description: 'Configure app notifications' },
        { name: 'Integrations', description: 'Manage connected apps and services' }
      ]
    },
    {
      title: 'Data & Privacy',
      icon: 'bi bi-shield-check',
      settings: [
        { name: 'Data Management', description: 'Manage your data and exports' },
        { name: 'Privacy Settings', description: 'Configure privacy preferences' },
        { name: 'Activity Log', description: 'View account activity history' }
      ]
    }
  ];

  // Handle setting click
  onSettingClick(section: string, setting: string) {
    console.log(`Clicked ${setting} in ${section}`);
    // Implement setting navigation or modal opening
  }
}
