import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RegistryCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  count?: number;
  hasUpdates?: boolean;
  lastUpdated?: string;
}

@Component({
  selector: 'app-statutory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  registryCards: RegistryCard[] = [
    {
      title: 'Directors & Secretaries',
      description: 'Manage and maintain records of company directors and secretaries',
      icon: 'bi bi-person-badge',
      link: '/statutory/directors',
      count: 4,
      hasUpdates: true,
      lastUpdated: '2 days ago'
    },
    {
      title: 'Members Register',
      description: 'Track company shareholders and their holdings',
      icon: 'bi bi-people',
      link: '/statutory/shareholders',
      count: 12,
      lastUpdated: '1 week ago'
    },
    {
      title: 'Share Register',
      description: 'Monitor share allocations and transfers',
      icon: 'bi bi-journal-bookmark',
      link: '/statutory/shares',
      count: 8,
      lastUpdated: '3 days ago'
    },
    {
      title: 'Beneficial Owners',
      description: 'Record and maintain beneficial ownership information',
      icon: 'bi bi-person-check',
      link: '/statutory/beneficial-owners',
      count: 3,
      hasUpdates: true,
      lastUpdated: 'Today'
    },
    {
      title: 'Charges Register',
      description: 'Track company charges and mortgages',
      icon: 'bi bi-bank',
      link: '/statutory/charges',
      count: 2,
      lastUpdated: '1 month ago'
    },
    {
      title: 'Share Allotments',
      description: 'Manage share allotments and transfers',
      icon: 'bi bi-plus-circle',
      link: '/statutory/allotments',
      count: 15,
      lastUpdated: '2 weeks ago'
    },
    {
      title: 'General Meetings',
      description: 'Record and store minutes of general meetings',
      icon: 'bi bi-calendar-event',
      link: '/statutory/meetings',
      count: 6,
      hasUpdates: true,
      lastUpdated: 'Yesterday'
    },
    {
      title: 'Board Minutes',
      description: 'Maintain records of board meetings and resolutions',
      icon: 'bi bi-file-text',
      link: '/statutory/board-minutes',
      count: 10,
      lastUpdated: '5 days ago'
    }
  ];
}
