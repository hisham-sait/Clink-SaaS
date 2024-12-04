import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-hub',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ServiceHubComponent {
  serviceMetrics = [
    {
      title: 'Open Tickets',
      value: '124',
      trend: 'down',
      change: '-15',
      icon: 'bi bi-ticket'
    },
    {
      title: 'Avg. Response Time',
      value: '2.5h',
      trend: 'up',
      change: '-30m',
      icon: 'bi bi-clock'
    },
    {
      title: 'Customer Satisfaction',
      value: '94%',
      trend: 'up',
      change: '+2.5%',
      icon: 'bi bi-emoji-smile'
    },
    {
      title: 'Knowledge Base',
      value: '285',
      trend: 'up',
      change: '+12',
      icon: 'bi bi-book'
    }
  ];

  recentTickets = [
    {
      id: 'TKT-001',
      subject: 'Integration Issue with API',
      customer: 'ABC Corporation',
      priority: 'High',
      status: 'Open',
      assignee: 'John Smith',
      created: '2024-01-15T10:30:00'
    },
    {
      id: 'TKT-002',
      subject: 'Account Access Problem',
      customer: 'XYZ Ltd',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'Sarah Johnson',
      created: '2024-01-15T09:15:00'
    },
    {
      id: 'TKT-003',
      subject: 'Feature Request: Export Data',
      customer: 'Tech Solutions',
      priority: 'Low',
      status: 'Pending',
      assignee: 'Mike Brown',
      created: '2024-01-14T16:45:00'
    },
    {
      id: 'TKT-004',
      subject: 'Billing Inquiry',
      customer: 'Global Industries',
      priority: 'Medium',
      status: 'Open',
      assignee: 'Emily Davis',
      created: '2024-01-14T14:20:00'
    }
  ];

  serviceTools = [
    {
      title: 'Ticket Management',
      description: 'Handle customer support tickets',
      icon: 'bi bi-ticket',
      route: '/crm/service/tickets',
      stats: {
        label: 'Open Tickets',
        value: '124'
      }
    },
    {
      title: 'Knowledge Base',
      description: 'Create and manage help articles',
      icon: 'bi bi-book',
      route: '/crm/service/knowledge-base',
      stats: {
        label: 'Articles',
        value: '285'
      }
    },
    {
      title: 'Customer Feedback',
      description: 'Collect and analyze feedback',
      icon: 'bi bi-chat-dots',
      route: '/crm/service/feedback',
      stats: {
        label: 'Satisfaction',
        value: '94%'
      }
    },
    {
      title: 'Live Chat',
      description: 'Real-time customer support',
      icon: 'bi bi-chat',
      route: '/crm/service/chat',
      stats: {
        label: 'Active Chats',
        value: '8'
      }
    }
  ];

  recentActivity = [
    {
      type: 'ticket',
      description: 'New ticket created: Integration Issue with API',
      time: '2 hours ago',
      user: 'John Smith'
    },
    {
      type: 'article',
      description: 'Knowledge base article updated: API Documentation',
      time: '4 hours ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'feedback',
      description: 'Customer satisfaction survey received',
      time: '1 day ago',
      user: 'System'
    },
    {
      type: 'chat',
      description: 'Live chat session completed with Tech Solutions',
      time: '1 day ago',
      user: 'Mike Brown'
    }
  ];

  getPriorityClass(priority: string): string {
    const classes = {
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low'
    };
    return classes[priority as keyof typeof classes] || '';
  }

  getStatusClass(status: string): string {
    const classes = {
      'Open': 'open',
      'In Progress': 'in-progress',
      'Pending': 'pending',
      'Resolved': 'resolved'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'ticket': 'bi bi-ticket',
      'article': 'bi bi-book',
      'feedback': 'bi bi-chat-dots',
      'chat': 'bi bi-chat'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
