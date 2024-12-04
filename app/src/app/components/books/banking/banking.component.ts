import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banking',
  templateUrl: './banking.component.html',
  styleUrls: ['./banking.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BankingComponent {
  bankingMetrics = [
    {
      title: 'Connected Banks',
      value: '4',
      trend: 'up',
      change: '+1',
      icon: 'bi bi-bank'
    },
    {
      title: 'Total Balance',
      value: '$285,430',
      trend: 'up',
      change: '+8.5%',
      icon: 'bi bi-cash-stack'
    },
    {
      title: 'Pending Transactions',
      value: '28',
      trend: 'down',
      change: '-12',
      icon: 'bi bi-clock-history'
    },
    {
      title: 'Last Sync',
      value: '2 mins ago',
      trend: 'neutral',
      icon: 'bi bi-arrow-repeat'
    }
  ];

  connectedBanks = [
    {
      name: 'Bank of America',
      accountType: 'Business Checking',
      accountNumber: '****4589',
      balance: 125750.00,
      lastSync: '2024-01-15T10:30:00',
      status: 'Connected'
    },
    {
      name: 'Chase Bank',
      accountType: 'Savings',
      accountNumber: '****7823',
      balance: 85430.00,
      lastSync: '2024-01-15T10:30:00',
      status: 'Connected'
    },
    {
      name: 'Wells Fargo',
      accountType: 'Business Checking',
      accountNumber: '****9456',
      balance: 45800.00,
      lastSync: '2024-01-15T10:15:00',
      status: 'Connected'
    },
    {
      name: 'Citibank',
      accountType: 'Business Savings',
      accountNumber: '****3217',
      balance: 28450.00,
      lastSync: '2024-01-15T10:00:00',
      status: 'Connected'
    }
  ];

  recentTransactions = [
    {
      date: '2024-01-15',
      description: 'Office Supplies Payment',
      type: 'expense',
      amount: -450.75,
      status: 'Unmatched',
      account: 'Bank of America'
    },
    {
      date: '2024-01-15',
      description: 'Client Payment - ABC Corp',
      type: 'income',
      amount: 5000.00,
      status: 'Matched',
      account: 'Chase Bank'
    },
    {
      date: '2024-01-14',
      description: 'Utility Bill Payment',
      type: 'expense',
      amount: -285.50,
      status: 'Matched',
      account: 'Wells Fargo'
    },
    {
      date: '2024-01-14',
      description: 'Software Subscription',
      type: 'expense',
      amount: -99.99,
      status: 'Unmatched',
      account: 'Bank of America'
    }
  ];

  quickActions = [
    {
      title: 'Connect Bank',
      icon: 'bi bi-plus-circle',
      action: 'connect'
    },
    {
      title: 'Reconcile',
      icon: 'bi bi-check2-square',
      action: 'reconcile'
    },
    {
      title: 'Import Transactions',
      icon: 'bi bi-download',
      action: 'import'
    },
    {
      title: 'Bank Rules',
      icon: 'bi bi-gear',
      action: 'rules'
    }
  ];

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getTransactionClass(type: string): string {
    return type.toLowerCase();
  }
}
