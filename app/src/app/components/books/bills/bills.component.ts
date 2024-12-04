import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BillsComponent {
  billMetrics = [
    {
      title: 'Total Payable',
      value: '$38,450',
      trend: 'up',
      change: '+8.5%',
      icon: 'bi bi-cash'
    },
    {
      title: 'Overdue Bills',
      value: '6',
      trend: 'down',
      change: '-2',
      icon: 'bi bi-exclamation-circle'
    },
    {
      title: 'Paid This Month',
      value: '$24,850',
      trend: 'up',
      change: '+15.3%',
      icon: 'bi bi-check-circle'
    },
    {
      title: 'Purchase Orders',
      value: '8',
      trend: 'neutral',
      icon: 'bi bi-cart'
    }
  ];

  recentBills = [
    {
      number: 'BILL-2024-001',
      vendor: 'Office Supplies Co',
      amount: 2850.00,
      issued: '2024-01-15',
      due: '2024-02-14',
      status: 'Pending'
    },
    {
      number: 'BILL-2024-002',
      vendor: 'IT Services Ltd',
      amount: 4500.00,
      issued: '2024-01-14',
      due: '2024-02-13',
      status: 'Draft'
    },
    {
      number: 'BILL-2023-125',
      vendor: 'Marketing Agency',
      amount: 8500.00,
      issued: '2024-01-10',
      due: '2024-02-09',
      status: 'Overdue'
    },
    {
      number: 'BILL-2023-124',
      vendor: 'Software Solutions',
      amount: 3250.00,
      issued: '2024-01-08',
      due: '2024-02-07',
      status: 'Paid'
    }
  ];

  topVendors = [
    {
      name: 'Office Supplies Co',
      totalBilled: 28500.00,
      outstanding: 8500.00,
      lastBill: '2024-01-15',
      status: 'Active'
    },
    {
      name: 'IT Services Ltd',
      totalBilled: 45000.00,
      outstanding: 4500.00,
      lastBill: '2024-01-14',
      status: 'Active'
    },
    {
      name: 'Marketing Agency',
      totalBilled: 32500.00,
      outstanding: 8500.00,
      lastBill: '2024-01-10',
      status: 'Active'
    },
    {
      name: 'Software Solutions',
      totalBilled: 18500.00,
      outstanding: 0.00,
      lastBill: '2024-01-08',
      status: 'Active'
    }
  ];

  purchaseOrders = [
    {
      number: 'PO-2024-001',
      vendor: 'Office Supplies Co',
      amount: 3500.00,
      date: '2024-01-15',
      status: 'Open'
    },
    {
      number: 'PO-2024-002',
      vendor: 'IT Services Ltd',
      amount: 5800.00,
      date: '2024-01-14',
      status: 'Pending Approval'
    },
    {
      number: 'PO-2024-003',
      vendor: 'Marketing Agency',
      amount: 12500.00,
      date: '2024-01-12',
      status: 'Approved'
    },
    {
      number: 'PO-2024-004',
      vendor: 'Software Solutions',
      amount: 4250.00,
      date: '2024-01-10',
      status: 'Closed'
    }
  ];

  quickActions = [
    {
      title: 'New Bill',
      icon: 'bi bi-plus-lg',
      action: 'create-bill'
    },
    {
      title: 'New Purchase Order',
      icon: 'bi bi-cart-plus',
      action: 'create-po'
    },
    {
      title: 'Record Payment',
      icon: 'bi bi-credit-card',
      action: 'payment'
    },
    {
      title: 'Vendor Portal',
      icon: 'bi bi-people',
      action: 'vendors'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Pending': 'pending',
      'Draft': 'draft',
      'Overdue': 'overdue',
      'Paid': 'paid',
      'Active': 'active',
      'Open': 'open',
      'Pending Approval': 'pending',
      'Approved': 'approved',
      'Closed': 'closed'
    };
    return classes[status as keyof typeof classes] || '';
  }
}
