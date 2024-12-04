import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CrmDashboardComponent {
  metrics = [
    {
      title: 'Total Contacts',
      value: '15,842',
      trend: 'up',
      change: '+324',
      icon: 'bi bi-people'
    },
    {
      title: 'Marketing Qualified Leads',
      value: '2,453',
      trend: 'up',
      change: '+156',
      icon: 'bi bi-bullseye'
    },
    {
      title: 'Sales Qualified Leads',
      value: '1,287',
      trend: 'up',
      change: '+89',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Deals Won',
      value: '$458K',
      trend: 'up',
      change: '+12.5%',
      icon: 'bi bi-trophy'
    }
  ];

  recentActivity = [
    {
      type: 'contact',
      description: 'New contact created: John Smith from ABC Corp',
      time: '2 hours ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'deal',
      description: 'Deal won: Enterprise Package - XYZ Ltd',
      time: '4 hours ago',
      user: 'Mike Brown'
    },
    {
      type: 'email',
      description: 'Marketing campaign sent to 2,500 contacts',
      time: '5 hours ago',
      user: 'Emily Davis'
    },
    {
      type: 'ticket',
      description: 'Support ticket resolved: Technical Issue #1234',
      time: '1 day ago',
      user: 'Tom Wilson'
    }
  ];

  tasksDue = [
    {
      title: 'Follow up with potential client',
      dueDate: '2024-01-16',
      priority: 'High',
      type: 'Sales'
    },
    {
      title: 'Review marketing campaign results',
      dueDate: '2024-01-16',
      priority: 'Medium',
      type: 'Marketing'
    },
    {
      title: 'Update contact information',
      dueDate: '2024-01-17',
      priority: 'Low',
      type: 'Contact Management'
    },
    {
      title: 'Prepare quarterly report',
      dueDate: '2024-01-18',
      priority: 'High',
      type: 'Operations'
    }
  ];

  hubFeatures = [
    {
      title: 'Marketing Hub',
      description: 'Email campaigns, forms, and landing pages',
      icon: 'bi bi-megaphone',
      route: '/crm/marketing'
    },
    {
      title: 'Sales Hub',
      description: 'Deal management and sales automation',
      icon: 'bi bi-graph-up',
      route: '/crm/sales'
    },
    {
      title: 'Service Hub',
      description: 'Customer support and ticket management',
      icon: 'bi bi-headset',
      route: '/crm/service'
    },
    {
      title: 'Operations Hub',
      description: 'Data sync and workflow automation',
      icon: 'bi bi-gear',
      route: '/crm/operations'
    },
    {
      title: 'CMS Hub',
      description: 'Website and content management',
      icon: 'bi bi-pencil-square',
      route: '/crm/cms'
    }
  ];

  getActivityIcon(type: string): string {
    const icons = {
      'contact': 'bi bi-person-plus',
      'deal': 'bi bi-trophy',
      'email': 'bi bi-envelope',
      'ticket': 'bi bi-ticket'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low'
    };
    return classes[priority as keyof typeof classes] || '';
  }
}
