import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-operations-hub',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class OperationsHubComponent {
  operationMetrics = [
    {
      title: 'Active Workflows',
      value: '45',
      trend: 'up',
      change: '+8',
      icon: 'bi bi-gear'
    },
    {
      title: 'Data Quality',
      value: '96%',
      trend: 'up',
      change: '+2.5%',
      icon: 'bi bi-shield-check'
    },
    {
      title: 'Synced Records',
      value: '125K',
      trend: 'up',
      change: '+15.2K',
      icon: 'bi bi-arrow-repeat'
    },
    {
      title: 'Automations Run',
      value: '2.8K',
      trend: 'up',
      change: '+450',
      icon: 'bi bi-lightning'
    }
  ];

  activeWorkflows = [
    {
      name: 'Lead Nurturing',
      type: 'Contact-based',
      status: 'Active',
      enrolled: 856,
      completed: 324,
      lastRun: '2024-01-15T10:30:00'
    },
    {
      name: 'Deal Stage Update',
      type: 'Deal-based',
      status: 'Active',
      enrolled: 124,
      completed: 98,
      lastRun: '2024-01-15T09:45:00'
    },
    {
      name: 'Data Cleanup',
      type: 'Company-based',
      status: 'Scheduled',
      enrolled: 0,
      completed: 0,
      lastRun: '2024-01-14T16:30:00'
    },
    {
      name: 'Customer Onboarding',
      type: 'Contact-based',
      status: 'Active',
      enrolled: 245,
      completed: 189,
      lastRun: '2024-01-14T14:15:00'
    }
  ];

  dataSources = [
    {
      name: 'CRM Data',
      status: 'Synced',
      records: 125000,
      lastSync: '2024-01-15T10:30:00',
      type: 'Two-way'
    },
    {
      name: 'Marketing Data',
      status: 'Synced',
      records: 85000,
      lastSync: '2024-01-15T10:30:00',
      type: 'One-way'
    },
    {
      name: 'Sales Data',
      status: 'Syncing',
      records: 45000,
      lastSync: '2024-01-15T10:15:00',
      type: 'Two-way'
    },
    {
      name: 'Support Data',
      status: 'Pending',
      records: 28000,
      lastSync: '2024-01-15T10:00:00',
      type: 'One-way'
    }
  ];

  operationTools = [
    {
      title: 'Data Sync',
      description: 'Manage data synchronization',
      icon: 'bi bi-arrow-repeat',
      route: '/crm/operations/data-sync',
      stats: {
        label: 'Synced Records',
        value: '125K'
      }
    },
    {
      title: 'Workflows',
      description: 'Automate business processes',
      icon: 'bi bi-gear',
      route: '/crm/operations/workflows',
      stats: {
        label: 'Active Workflows',
        value: '45'
      }
    },
    {
      title: 'Data Quality',
      description: 'Monitor and improve data quality',
      icon: 'bi bi-shield-check',
      route: '/crm/operations/data-quality',
      stats: {
        label: 'Data Score',
        value: '96%'
      }
    },
    {
      title: 'Integrations',
      description: 'Manage app connections',
      icon: 'bi bi-boxes',
      route: '/crm/operations/integrations',
      stats: {
        label: 'Connected Apps',
        value: '12'
      }
    }
  ];

  recentActivity = [
    {
      type: 'workflow',
      description: 'Lead Nurturing workflow completed for 45 contacts',
      time: '2 hours ago',
      user: 'System'
    },
    {
      type: 'sync',
      description: 'Data sync completed with Marketing platform',
      time: '4 hours ago',
      user: 'System'
    },
    {
      type: 'quality',
      description: 'Data quality scan completed',
      time: '1 day ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'integration',
      description: 'New app integration configured',
      time: '1 day ago',
      user: 'Mike Brown'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Active': 'active',
      'Scheduled': 'scheduled',
      'Synced': 'synced',
      'Syncing': 'syncing',
      'Pending': 'pending'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'workflow': 'bi bi-gear',
      'sync': 'bi bi-arrow-repeat',
      'quality': 'bi bi-shield-check',
      'integration': 'bi bi-boxes'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
