import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ContactsComponent {
  contactMetrics = [
    {
      title: 'Total Contacts',
      value: '248',
      trend: 'up',
      change: '+12',
      icon: 'bi bi-people'
    },
    {
      title: 'Active Customers',
      value: '156',
      trend: 'up',
      change: '+8',
      icon: 'bi bi-person-check'
    },
    {
      title: 'Active Vendors',
      value: '92',
      trend: 'up',
      change: '+4',
      icon: 'bi bi-shop'
    },
    {
      title: 'Recent Activity',
      value: '15',
      trend: 'neutral',
      icon: 'bi bi-clock-history'
    }
  ];

  recentContacts = [
    {
      name: 'ABC Corporation',
      type: 'Customer',
      email: 'contact@abccorp.com',
      phone: '+1 (555) 123-4567',
      balance: 12500.00,
      status: 'Active',
      lastTransaction: '2024-01-15'
    },
    {
      name: 'Office Supplies Co',
      type: 'Vendor',
      email: 'sales@officesupplies.com',
      phone: '+1 (555) 234-5678',
      balance: -4500.00,
      status: 'Active',
      lastTransaction: '2024-01-14'
    },
    {
      name: 'Global Industries',
      type: 'Customer',
      email: 'info@globalind.com',
      phone: '+1 (555) 345-6789',
      balance: 8500.00,
      status: 'Active',
      lastTransaction: '2024-01-13'
    },
    {
      name: 'Tech Solutions Ltd',
      type: 'Both',
      email: 'support@techsolutions.com',
      phone: '+1 (555) 456-7890',
      balance: 2500.00,
      status: 'Active',
      lastTransaction: '2024-01-12'
    }
  ];

  contactGroups = [
    {
      name: 'Key Customers',
      count: 25,
      totalRevenue: 450000,
      icon: 'bi bi-star'
    },
    {
      name: 'Preferred Vendors',
      count: 18,
      totalSpent: 285000,
      icon: 'bi bi-award'
    },
    {
      name: 'International',
      count: 45,
      mixed: true,
      icon: 'bi bi-globe'
    },
    {
      name: 'Local Business',
      count: 65,
      mixed: true,
      icon: 'bi bi-geo-alt'
    }
  ];

  recentActivity = [
    {
      type: 'new',
      description: 'Added new customer ABC Corporation',
      user: 'John Smith',
      time: '2 hours ago'
    },
    {
      type: 'update',
      description: 'Updated vendor payment details',
      user: 'Sarah Johnson',
      time: '4 hours ago'
    },
    {
      type: 'note',
      description: 'Added note to Global Industries',
      user: 'Mike Brown',
      time: '1 day ago'
    },
    {
      type: 'email',
      description: 'Sent invoice reminder to Tech Solutions',
      user: 'Emily Davis',
      time: '1 day ago'
    }
  ];

  quickActions = [
    {
      title: 'Add Contact',
      icon: 'bi bi-person-plus',
      action: 'add'
    },
    {
      title: 'Import Contacts',
      icon: 'bi bi-upload',
      action: 'import'
    },
    {
      title: 'Export List',
      icon: 'bi bi-download',
      action: 'export'
    },
    {
      title: 'Manage Groups',
      icon: 'bi bi-people',
      action: 'groups'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Active': 'active',
      'Inactive': 'inactive',
      'Pending': 'pending'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getTypeClass(type: string): string {
    const classes = {
      'Customer': 'customer',
      'Vendor': 'vendor',
      'Both': 'both'
    };
    return classes[type as keyof typeof classes] || '';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'new': 'bi bi-plus-circle',
      'update': 'bi bi-pencil',
      'note': 'bi bi-chat-dots',
      'email': 'bi bi-envelope'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
