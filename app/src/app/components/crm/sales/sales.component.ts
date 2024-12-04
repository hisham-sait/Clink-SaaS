import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sales-hub',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SalesHubComponent {
  salesMetrics = [
    {
      title: 'Total Revenue',
      value: '$458,290',
      trend: 'up',
      change: '+15.2%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Active Deals',
      value: '124',
      trend: 'up',
      change: '+8',
      icon: 'bi bi-briefcase'
    },
    {
      title: 'Win Rate',
      value: '68%',
      trend: 'up',
      change: '+5.2%',
      icon: 'bi bi-trophy'
    },
    {
      title: 'Avg. Deal Size',
      value: '$45K',
      trend: 'up',
      change: '+12.5%',
      icon: 'bi bi-cash-stack'
    }
  ];

  dealPipeline = [
    {
      stage: 'Qualification',
      deals: [
        {
          name: 'Enterprise Package - ABC Corp',
          value: 75000,
          company: 'ABC Corporation',
          owner: 'John Smith',
          lastActivity: '2 hours ago'
        },
        {
          name: 'Software License - XYZ Ltd',
          value: 45000,
          company: 'XYZ Ltd',
          owner: 'Sarah Johnson',
          lastActivity: '4 hours ago'
        }
      ]
    },
    {
      stage: 'Meeting Scheduled',
      deals: [
        {
          name: 'Annual Subscription - Tech Solutions',
          value: 28000,
          company: 'Tech Solutions',
          owner: 'Mike Brown',
          lastActivity: '1 day ago'
        }
      ]
    },
    {
      stage: 'Proposal Sent',
      deals: [
        {
          name: 'Custom Integration - Global Industries',
          value: 125000,
          company: 'Global Industries',
          owner: 'Emily Davis',
          lastActivity: '2 days ago'
        }
      ]
    },
    {
      stage: 'Negotiation',
      deals: [
        {
          name: 'Premium Package - Retail Corp',
          value: 85000,
          company: 'Retail Corp',
          owner: 'John Smith',
          lastActivity: '3 days ago'
        }
      ]
    }
  ];

  salesTools = [
    {
      title: 'Deal Management',
      description: 'Track and manage your sales pipeline',
      icon: 'bi bi-briefcase',
      route: '/crm/sales/deals',
      stats: {
        label: 'Active Deals',
        value: '124'
      }
    },
    {
      title: 'Tasks & Activities',
      description: 'Manage follow-ups and activities',
      icon: 'bi bi-check2-square',
      route: '/crm/sales/tasks',
      stats: {
        label: 'Open Tasks',
        value: '45'
      }
    },
    {
      title: 'Sales Forecasting',
      description: 'Predict future sales and revenue',
      icon: 'bi bi-graph-up',
      route: '/crm/sales/forecasting',
      stats: {
        label: 'Q1 Forecast',
        value: '$1.2M'
      }
    },
    {
      title: 'Quotes & Proposals',
      description: 'Create and manage sales documents',
      icon: 'bi bi-file-earmark-text',
      route: '/crm/sales/quotes',
      stats: {
        label: 'Active Quotes',
        value: '18'
      }
    }
  ];

  recentActivity = [
    {
      type: 'deal',
      description: 'Deal won: Enterprise Package - ABC Corp ($75,000)',
      time: '2 hours ago',
      user: 'John Smith'
    },
    {
      type: 'task',
      description: 'Follow-up call scheduled with XYZ Ltd',
      time: '4 hours ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'quote',
      description: 'Proposal sent to Global Industries',
      time: '1 day ago',
      user: 'Emily Davis'
    },
    {
      type: 'meeting',
      description: 'Discovery call completed with Tech Solutions',
      time: '1 day ago',
      user: 'Mike Brown'
    }
  ];

  getActivityIcon(type: string): string {
    const icons = {
      'deal': 'bi bi-briefcase',
      'task': 'bi bi-check2-square',
      'quote': 'bi bi-file-earmark-text',
      'meeting': 'bi bi-calendar-event'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
