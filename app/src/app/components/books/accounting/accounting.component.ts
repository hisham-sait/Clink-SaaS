import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AccountingComponent {
  accountingSections = [
    {
      title: 'Chart of Accounts',
      icon: 'bi bi-journal-text',
      description: 'Manage your account categories and structure',
      link: '/accounting/chart-of-accounts'
    },
    {
      title: 'Journal Entries',
      icon: 'bi bi-pencil-square',
      description: 'Record and manage financial transactions',
      link: '/accounting/journal-entries'
    },
    {
      title: 'Financial Reports',
      icon: 'bi bi-file-earmark-spreadsheet',
      description: 'View balance sheet, income statement, and other reports',
      link: '/accounting/reports'
    },
    {
      title: 'Bank Reconciliation',
      icon: 'bi bi-bank',
      description: 'Match and reconcile bank transactions',
      link: '/accounting/reconciliation'
    }
  ];

  recentAccounts = [
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
}
