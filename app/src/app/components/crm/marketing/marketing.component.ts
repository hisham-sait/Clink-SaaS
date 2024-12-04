import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-marketing-hub',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MarketingHubComponent {
  marketingMetrics = [
    {
      title: 'Total Contacts',
      value: '15,842',
      trend: 'up',
      change: '+324',
      icon: 'bi bi-people'
    },
    {
      title: 'Email Performance',
      value: '32.5%',
      trend: 'up',
      change: '+2.8%',
      icon: 'bi bi-envelope'
    },
    {
      title: 'Form Submissions',
      value: '856',
      trend: 'up',
      change: '+124',
      icon: 'bi bi-ui-checks'
    },
    {
      title: 'Landing Pages',
      value: '45',
      trend: 'up',
      change: '+8',
      icon: 'bi bi-window'
    }
  ];

  recentCampaigns = [
    {
      name: 'Q1 Newsletter',
      type: 'Email',
      status: 'Active',
      sent: 2500,
      opened: 1250,
      clicked: 450,
      lastUpdated: '2024-01-15'
    },
    {
      name: 'Product Launch',
      type: 'Multi-channel',
      status: 'Scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      lastUpdated: '2024-01-14'
    },
    {
      name: 'Customer Survey',
      type: 'Form',
      status: 'Completed',
      responses: 324,
      conversion: '15.2%',
      lastUpdated: '2024-01-13'
    },
    {
      name: 'Feature Announcement',
      type: 'Landing Page',
      status: 'Active',
      visits: 1250,
      conversions: 185,
      lastUpdated: '2024-01-12'
    }
  ];

  marketingTools = [
    {
      title: 'Email Marketing',
      description: 'Create and send engaging email campaigns',
      icon: 'bi bi-envelope',
      route: '/crm/marketing/email',
      stats: {
        label: 'Avg. Open Rate',
        value: '32.5%'
      }
    },
    {
      title: 'Forms',
      description: 'Build forms to capture leads',
      icon: 'bi bi-ui-checks',
      route: '/crm/marketing/forms',
      stats: {
        label: 'Submissions',
        value: '856'
      }
    },
    {
      title: 'Landing Pages',
      description: 'Create conversion-optimized pages',
      icon: 'bi bi-window',
      route: '/crm/marketing/landing-pages',
      stats: {
        label: 'Active Pages',
        value: '45'
      }
    },
    {
      title: 'Marketing Automation',
      description: 'Set up automated workflows',
      icon: 'bi bi-gear',
      route: '/crm/marketing/automation',
      stats: {
        label: 'Active Workflows',
        value: '12'
      }
    }
  ];

  recentActivity = [
    {
      type: 'email',
      description: 'Q1 Newsletter sent to 2,500 contacts',
      time: '2 hours ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'form',
      description: 'New form submission: Product Demo Request',
      time: '4 hours ago',
      user: 'System'
    },
    {
      type: 'page',
      description: 'Landing page "Product Launch" published',
      time: '1 day ago',
      user: 'Mike Brown'
    },
    {
      type: 'workflow',
      description: 'Lead nurturing workflow activated',
      time: '1 day ago',
      user: 'Emily Davis'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Active': 'active',
      'Scheduled': 'scheduled',
      'Completed': 'completed',
      'Draft': 'draft'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'email': 'bi bi-envelope',
      'form': 'bi bi-ui-checks',
      'page': 'bi bi-window',
      'workflow': 'bi bi-gear'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
