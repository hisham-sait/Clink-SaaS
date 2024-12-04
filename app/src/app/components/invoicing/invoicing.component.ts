import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoicing',
  templateUrl: './invoicing.component.html',
  styleUrls: ['./invoicing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InvoicingComponent {
  invoiceMetrics = [
    {
      title: 'Total Outstanding',
      value: '$45,280',
      trend: 'up',
      change: '+12.5%',
      icon: 'bi bi-cash'
    },
    {
      title: 'Overdue Invoices',
      value: '8',
      trend: 'down',
      change: '-2',
      icon: 'bi bi-exclamation-circle'
    },
    {
      title: 'Paid This Month',
      value: '$28,450',
      trend: 'up',
      change: '+18.3%',
      icon: 'bi bi-check-circle'
    },
    {
      title: 'Draft Invoices',
      value: '5',
      trend: 'neutral',
      icon: 'bi bi-file-earmark-text'
    }
  ];

  recentInvoices = [
    {
      number: 'INV-2024-001',
      client: 'ABC Corporation',
      amount: 5800.00,
      issued: '2024-01-15',
      due: '2024-02-14',
      status: 'Sent'
    },
    {
      number: 'INV-2024-002',
      client: 'XYZ Ltd',
      amount: 3250.00,
      issued: '2024-01-14',
      due: '2024-02-13',
      status: 'Draft'
    },
    {
      number: 'INV-2023-125',
      client: 'Global Industries',
      amount: 12500.00,
      issued: '2024-01-10',
      due: '2024-02-09',
      status: 'Overdue'
    },
    {
      number: 'INV-2023-124',
      client: 'Tech Solutions',
      amount: 4750.00,
      issued: '2024-01-08',
      due: '2024-02-07',
      status: 'Paid'
    }
  ];

  topClients = [
    {
      name: 'ABC Corporation',
      totalBilled: 45800.00,
      outstanding: 12500.00,
      lastInvoice: '2024-01-15',
      status: 'Active'
    },
    {
      name: 'XYZ Ltd',
      totalBilled: 38500.00,
      outstanding: 3250.00,
      lastInvoice: '2024-01-14',
      status: 'Active'
    },
    {
      name: 'Global Industries',
      totalBilled: 28900.00,
      outstanding: 12500.00,
      lastInvoice: '2024-01-10',
      status: 'Active'
    },
    {
      name: 'Tech Solutions',
      totalBilled: 22450.00,
      outstanding: 0.00,
      lastInvoice: '2024-01-08',
      status: 'Active'
    }
  ];

  quickActions = [
    {
      title: 'New Invoice',
      icon: 'bi bi-plus-lg',
      action: 'create'
    },
    {
      title: 'Send Reminders',
      icon: 'bi bi-bell',
      action: 'remind'
    },
    {
      title: 'Record Payment',
      icon: 'bi bi-credit-card',
      action: 'payment'
    },
    {
      title: 'Invoice Settings',
      icon: 'bi bi-gear',
      action: 'settings'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Sent': 'sent',
      'Draft': 'draft',
      'Overdue': 'overdue',
      'Paid': 'paid',
      'Active': 'active'
    };
    return classes[status as keyof typeof classes] || '';
  }
}
