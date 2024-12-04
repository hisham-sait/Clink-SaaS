import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CrmCompaniesComponent {
  companyMetrics = [
    {
      title: 'Total Companies',
      value: '2,845',
      trend: 'up',
      change: '+124',
      icon: 'bi bi-building'
    },
    {
      title: 'New This Month',
      value: '156',
      trend: 'up',
      change: '+32',
      icon: 'bi bi-building-add'
    },
    {
      title: 'Active Deals',
      value: '$1.2M',
      trend: 'up',
      change: '+15.2%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Avg. Deal Size',
      value: '$45K',
      trend: 'up',
      change: '+8.5%',
      icon: 'bi bi-cash-stack'
    }
  ];

  recentCompanies = [
    {
      name: 'ABC Corporation',
      industry: 'Technology',
      location: 'New York, USA',
      employees: '500-1000',
      revenue: '$50M-100M',
      status: 'Customer',
      contacts: 24,
      lastActivity: '2 hours ago'
    },
    {
      name: 'XYZ Ltd',
      industry: 'Manufacturing',
      location: 'Chicago, USA',
      employees: '1000+',
      revenue: '$100M+',
      status: 'Prospect',
      contacts: 12,
      lastActivity: '4 hours ago'
    },
    {
      name: 'Global Industries',
      industry: 'Retail',
      location: 'London, UK',
      employees: '100-500',
      revenue: '$10M-50M',
      status: 'Lead',
      contacts: 8,
      lastActivity: '1 day ago'
    },
    {
      name: 'Tech Solutions',
      industry: 'Software',
      location: 'San Francisco, USA',
      employees: '50-100',
      revenue: '$1M-10M',
      status: 'Customer',
      contacts: 15,
      lastActivity: '1 day ago'
    }
  ];

  companyProperties = [
    {
      group: 'About',
      properties: ['Name', 'Industry', 'Location', 'Phone', 'Website']
    },
    {
      group: 'Details',
      properties: ['Employee Count', 'Annual Revenue', 'Type', 'Founded Year']
    },
    {
      group: 'Relationships',
      properties: ['Parent Company', 'Subsidiaries', 'Partners']
    },
    {
      group: 'Custom Properties',
      properties: ['Technology Stack', 'Decision Makers', 'Budget Range']
    }
  ];

  quickFilters = [
    {
      name: 'All Companies',
      count: 2845,
      active: true
    },
    {
      name: 'Customers',
      count: 1245,
      active: false
    },
    {
      name: 'Prospects',
      count: 856,
      active: false
    },
    {
      name: 'Partners',
      count: 124,
      active: false
    }
  ];

  industries = [
    {
      name: 'Technology',
      count: 845,
      revenue: '$125M'
    },
    {
      name: 'Manufacturing',
      count: 456,
      revenue: '$89M'
    },
    {
      name: 'Retail',
      count: 324,
      revenue: '$67M'
    },
    {
      name: 'Healthcare',
      count: 234,
      revenue: '$45M'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Customer': 'customer',
      'Prospect': 'prospect',
      'Lead': 'lead',
      'Partner': 'partner'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getIndustryIcon(industry: string): string {
    const icons = {
      'Technology': 'bi bi-cpu',
      'Manufacturing': 'bi bi-tools',
      'Retail': 'bi bi-shop',
      'Software': 'bi bi-code-square',
      'Healthcare': 'bi bi-heart-pulse'
    };
    return icons[industry as keyof typeof icons] || 'bi bi-building';
  }
}
