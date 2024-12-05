import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'Checking' | 'Savings' | 'Credit Card';
  balance: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'Cleared' | 'Pending';
  category: string;
}

@Component({
  selector: 'app-banking',
  templateUrl: './banking.component.html',
  styleUrls: ['../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BankingComponent {
  constructor(public router: Router) {}

  bankingMetrics = [
    {
      title: 'Total Balance',
      value: '$173,680',
      trend: 'up',
      change: '+5.2%',
      icon: 'bi bi-bank'
    },
    {
      title: 'Monthly Spending',
      value: '$28,450',
      trend: 'down',
      change: '-3.8%',
      icon: 'bi bi-credit-card'
    },
    {
      title: 'Pending Transfers',
      value: '5',
      trend: 'neutral',
      change: '0',
      icon: 'bi bi-arrow-left-right'
    },
    {
      title: 'Active Accounts',
      value: '3',
      trend: 'up',
      change: '+1',
      icon: 'bi bi-wallet2'
    }
  ];

  bankingSections = [
    {
      title: 'Accounts Overview',
      icon: 'bi bi-bank',
      description: 'View and manage all your bank accounts',
      link: '/books/banking/accounts'
    },
    {
      title: 'Transactions',
      icon: 'bi bi-credit-card',
      description: 'Track and categorize your transactions',
      link: '/books/banking/transactions'
    },
    {
      title: 'Transfers',
      icon: 'bi bi-arrow-left-right',
      description: 'Transfer funds between accounts',
      link: '/books/banking/transfers'
    },
    {
      title: 'Statements',
      icon: 'bi bi-file-earmark-text',
      description: 'Download and view bank statements',
      link: '/books/banking/statements'
    },
    {
      title: 'Budgets',
      icon: 'bi bi-wallet2',
      description: 'Plan and track your financial budgets',
      link: '/books/banking/budgets'
    },
    {
      title: 'Forecasting',
      icon: 'bi bi-graph-up',
      description: 'Project and plan your financial future',
      link: '/books/banking/forecasting'
    },
    {
      title: 'Reports',
      icon: 'bi bi-file-earmark-bar-graph',
      description: 'Generate and analyze banking reports',
      link: '/books/banking/reports'
    }
  ];

  bankAccounts: BankAccount[] = [
    {
      id: '1',
      name: 'Business Checking',
      accountNumber: '1234567890',
      type: 'Checking',
      balance: 25430.00,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Business Savings',
      accountNumber: '0987654321',
      type: 'Savings',
      balance: 150750.00,
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      name: 'Corporate Credit Card',
      accountNumber: '5555666677778888',
      type: 'Credit Card',
      balance: -2500.00,
      lastUpdated: '2024-01-13'
    }
  ];

  recentTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Client Payment - ABC Corp',
      amount: 5000.00,
      type: 'credit',
      status: 'Cleared',
      category: 'Income'
    },
    {
      id: '2',
      date: '2024-01-14',
      description: 'Office Rent Payment',
      amount: 2500.00,
      type: 'debit',
      status: 'Cleared',
      category: 'Rent'
    },
    {
      id: '3',
      date: '2024-01-13',
      description: 'Utility Bills',
      amount: 750.00,
      type: 'debit',
      status: 'Pending',
      category: 'Utilities'
    },
    {
      id: '4',
      date: '2024-01-12',
      description: 'Software Subscription',
      amount: 99.00,
      type: 'debit',
      status: 'Cleared',
      category: 'Software'
    }
  ];
}
