import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: 'Credit' | 'Debit';
  status: 'Pending' | 'Matched' | 'Unmatched';
}

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ReconciliationComponent {
  bankBalance = 25430.00;
  lastUpdated = '2024-01-15';
  unreconciledCount = 8;
  unreconciledTrend = 'down';
  unreconciledChange = '-3 from last week';
  reconciledThisMonth = 45;
  reconciledChange = 12;

  unreconciledTransactions: Transaction[] = [
    {
      date: '2024-01-15',
      description: 'Client Payment - ABC Corp',
      reference: 'TRX-001',
      amount: 5000.00,
      type: 'Credit',
      status: 'Pending'
    },
    {
      date: '2024-01-14',
      description: 'Office Supplies Purchase',
      reference: 'TRX-002',
      amount: -250.00,
      type: 'Debit',
      status: 'Unmatched'
    },
    {
      date: '2024-01-14',
      description: 'Utility Payment',
      reference: 'TRX-003',
      amount: -450.00,
      type: 'Debit',
      status: 'Matched'
    },
    {
      date: '2024-01-13',
      description: 'Client Payment - XYZ Ltd',
      reference: 'TRX-004',
      amount: 3500.00,
      type: 'Credit',
      status: 'Pending'
    },
    {
      date: '2024-01-12',
      description: 'Internet Service Bill',
      reference: 'TRX-005',
      amount: -89.99,
      type: 'Debit',
      status: 'Unmatched'
    }
  ];

  reconcileTransaction(transaction: Transaction): void {
    alert(`Reconciling transaction ${transaction.reference}... Feature coming soon!`);
  }

  viewTransaction(transaction: Transaction): void {
    alert(`Viewing transaction ${transaction.reference}... Feature coming soon!`);
  }
}
