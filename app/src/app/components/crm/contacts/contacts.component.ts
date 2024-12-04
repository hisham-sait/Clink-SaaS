import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CrmContactsComponent {
  contactMetrics = [
    {
      title: 'Total Contacts',
      value: '15,842',
      trend: 'up',
      change: '+324',
      icon: 'bi bi-people'
    },
    {
      title: 'New This Month',
      value: '842',
      trend: 'up',
      change: '+156',
      icon: 'bi bi-person-plus'
    },
    {
      title: 'Engagement Rate',
      value: '68%',
      trend: 'up',
      change: '+5.2%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Unsubscribed',
      value: '234',
      trend: 'down',
      change: '-12',
      icon: 'bi bi-person-x'
    }
  ];

  contactLists = [
    {
      name: 'All Contacts',
      count: 15842,
      type: 'default',
      lastUpdated: '2024-01-15'
    },
    {
      name: 'Newsletter Subscribers',
      count: 12450,
      type: 'active',
      lastUpdated: '2024-01-15'
    },
    {
      name: 'Marketing Qualified Leads',
      count: 2453,
      type: 'active',
      lastUpdated: '2024-01-14'
    },
    {
      name: 'Sales Qualified Leads',
      count: 1287,
      type: 'active',
      lastUpdated: '2024-01-14'
    }
  ];

  recentContacts = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'ABC Corporation',
      status: 'Lead',
      source: 'Website Form',
      lastActivity: '2 hours ago'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      company: 'XYZ Ltd',
      status: 'Customer',
      source: 'Email Campaign',
      lastActivity: '4 hours ago'
    },
    {
      name: 'Michael Brown',
      email: 'm.brown@example.com',
      company: 'Tech Solutions',
      status: 'Opportunity',
      source: 'LinkedIn',
      lastActivity: '1 day ago'
    },
    {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      company: 'Global Industries',
      status: 'Subscriber',
      source: 'Blog Signup',
      lastActivity: '1 day ago'
    }
  ];

  contactProperties = [
    {
      group: 'About',
      properties: ['First Name', 'Last Name', 'Email', 'Phone', 'Company']
    },
    {
      group: 'Lead Information',
      properties: ['Lead Status', 'Lead Source', 'Lead Score', 'Industry']
    },
    {
      group: 'Communication',
      properties: ['Email Status', 'Last Contacted', 'Communication Preferences']
    },
    {
      group: 'Custom Properties',
      properties: ['Project Interest', 'Budget Range', 'Decision Timeline']
    }
  ];

  quickFilters = [
    {
      name: 'All Contacts',
      count: 15842,
      active: true
    },
    {
      name: 'New This Month',
      count: 842,
      active: false
    },
    {
      name: 'Uncontacted',
      count: 456,
      active: false
    },
    {
      name: 'Recently Active',
      count: 1245,
      active: false
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Lead': 'lead',
      'Customer': 'customer',
      'Opportunity': 'opportunity',
      'Subscriber': 'subscriber'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getSourceIcon(source: string): string {
    const icons = {
      'Website Form': 'bi bi-window',
      'Email Campaign': 'bi bi-envelope',
      'LinkedIn': 'bi bi-linkedin',
      'Blog Signup': 'bi bi-pencil-square'
    };
    return icons[source as keyof typeof icons] || 'bi bi-circle';
  }
}
