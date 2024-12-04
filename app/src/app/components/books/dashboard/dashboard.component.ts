import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent {
  cards = [
    {
      title: 'Bank Balance',
      value: '$25,430.00',
      change: '+2.5%',
      icon: 'bi bi-bank',
      trend: 'up'
    },
    {
      title: 'Outstanding Invoices',
      value: '$12,150.00',
      count: '8',
      icon: 'bi bi-file-earmark-text',
      trend: 'neutral'
    },
    {
      title: 'Bills to Pay',
      value: '$8,290.00',
      count: '5',
      icon: 'bi bi-receipt',
      trend: 'down'
    },
    {
      title: 'Cash Flow',
      value: '$4,320.00',
      change: '-1.2%',
      icon: 'bi bi-graph-up',
      trend: 'down'
    }
  ];

  recentTransactions = [
    {
      date: '2024-01-15',
      description: 'Client Payment - ABC Corp',
      type: 'credit',
      amount: 5000.00,
      status: 'completed'
    },
    {
      date: '2024-01-14',
      description: 'Office Supplies',
      type: 'debit',
      amount: 250.50,
      status: 'completed'
    },
    {
      date: '2024-01-14',
      description: 'Utility Bill Payment',
      type: 'debit',
      amount: 180.75,
      status: 'pending'
    },
    {
      date: '2024-01-13',
      description: 'Client Payment - XYZ Ltd',
      type: 'credit',
      amount: 3500.00,
      status: 'completed'
    }
  ];
}
