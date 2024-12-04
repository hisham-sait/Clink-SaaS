import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AnalyticsComponent {
  reportMetrics = [
    {
      title: 'Revenue',
      value: '$458,290',
      trend: 'up',
      change: '+15.2%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Expenses',
      value: '$125,430',
      trend: 'down',
      change: '-8.5%',
      icon: 'bi bi-graph-down'
    },
    {
      title: 'Profit Margin',
      value: '32.5%',
      trend: 'up',
      change: '+2.8%',
      icon: 'bi bi-pie-chart'
    },
    {
      title: 'Cash Flow',
      value: '$85,760',
      trend: 'up',
      change: '+12.3%',
      icon: 'bi bi-cash-stack'
    }
  ];

  availableReports = [
    {
      title: 'Financial Reports',
      reports: [
        {
          name: 'Balance Sheet',
          description: 'View assets, liabilities, and equity',
          icon: 'bi bi-file-earmark-spreadsheet',
          lastGenerated: '2024-01-15'
        },
        {
          name: 'Profit & Loss',
          description: 'Income and expense statement',
          icon: 'bi bi-file-earmark-bar-graph',
          lastGenerated: '2024-01-15'
        },
        {
          name: 'Cash Flow Statement',
          description: 'Track money movement',
          icon: 'bi bi-file-earmark-arrow-up',
          lastGenerated: '2024-01-14'
        }
      ]
    },
    {
      title: 'Tax Reports',
      reports: [
        {
          name: 'Tax Summary',
          description: 'Overview of tax obligations',
          icon: 'bi bi-file-earmark-text',
          lastGenerated: '2024-01-13'
        },
        {
          name: 'GST Report',
          description: 'Goods and services tax details',
          icon: 'bi bi-file-earmark-ruled',
          lastGenerated: '2024-01-12'
        }
      ]
    },
    {
      title: 'Business Reports',
      reports: [
        {
          name: 'Aged Receivables',
          description: 'Track outstanding payments',
          icon: 'bi bi-file-earmark-medical',
          lastGenerated: '2024-01-15'
        },
        {
          name: 'Budget Variance',
          description: 'Compare actual vs budget',
          icon: 'bi bi-file-earmark-diff',
          lastGenerated: '2024-01-14'
        }
      ]
    }
  ];

  recentActivities = [
    {
      type: 'report',
      description: 'Generated Balance Sheet report',
      user: 'John Smith',
      time: '2 hours ago'
    },
    {
      type: 'export',
      description: 'Exported Q4 Financial Summary',
      user: 'Sarah Johnson',
      time: '4 hours ago'
    },
    {
      type: 'schedule',
      description: 'Scheduled Monthly P&L Report',
      user: 'Mike Brown',
      time: '1 day ago'
    },
    {
      type: 'share',
      description: 'Shared Tax Summary with Accountant',
      user: 'Emily Davis',
      time: '1 day ago'
    }
  ];

  getActivityIcon(type: string): string {
    const icons = {
      report: 'bi-file-earmark-text',
      export: 'bi-download',
      schedule: 'bi-calendar-event',
      share: 'bi-share'
    };
    return icons[type as keyof typeof icons] || 'bi-circle';
  }
}
