import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Revenue' | 'Expense';
  balance: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AccountingComponent {
  constructor(public router: Router) {}

  accountingMetrics = [
    {
      title: 'Total Assets',
      value: '$458,920',
      trend: 'up',
      change: '+8.5%',
      icon: 'bi bi-building'
    },
    {
      title: 'Total Liabilities',
      value: '$125,450',
      trend: 'down',
      change: '-3.2%',
      icon: 'bi bi-cash-stack'
    },
    {
      title: 'Revenue YTD',
      value: '$892,650',
      trend: 'up',
      change: '+15.8%',
      icon: 'bi bi-graph-up-arrow'
    },
    {
      title: 'Net Income',
      value: '$245,780',
      trend: 'up',
      change: '+12.4%',
      icon: 'bi bi-wallet2'
    }
  ];

  accountingSections = [
    {
      title: 'Chart of Accounts',
      icon: 'bi bi-journal-text',
      description: 'Manage your account categories and structure',
      link: '/books/accounting/chart-of-accounts'
    },
    {
      title: 'Journal Entries',
      icon: 'bi bi-pencil-square',
      description: 'Record and manage financial transactions',
      link: '/books/accounting/journal-entries'
    },
    {
      title: 'Financial Reports',
      icon: 'bi bi-file-earmark-spreadsheet',
      description: 'View balance sheet, income statement, and other reports',
      link: '/books/accounting/reports'
    },
    {
      title: 'Bank Reconciliation',
      icon: 'bi bi-bank',
      description: 'Match and reconcile bank transactions',
      link: '/books/accounting/reconciliation'
    }
  ];

  recentAccounts: Account[] = [
    {
      code: '1000',
      name: 'Cash and Bank',
      type: 'Asset',
      balance: 25430.00,
      lastUpdated: '2024-01-15'
    },
    {
      code: '4000',
      name: 'Sales Revenue',
      type: 'Revenue',
      balance: 150750.00,
      lastUpdated: '2024-01-14'
    },
    {
      code: '5000',
      name: 'Cost of Goods Sold',
      type: 'Expense',
      balance: 82900.00,
      lastUpdated: '2024-01-13'
    },
    {
      code: '2000',
      name: 'Accounts Payable',
      type: 'Liability',
      balance: 15680.00,
      lastUpdated: '2024-01-12'
    }
  ];

  createNewAccount(): void {
    alert('New Account Creation feature coming soon!');
  }

  viewAllAccounts(): void {
    alert('View All Accounts feature coming soon!');
  }

  createJournalEntry(): void {
    alert('Journal Entry Creation feature coming soon!');
  }

  exportReports(): void {
    alert('Reports Export feature coming soon!');
  }

  openAccountSettings(): void {
    alert('Account Settings feature coming soon!');
  }

  handleAccountAction(account: Account): void {
    alert('Account Actions feature coming soon!');
  }
}
