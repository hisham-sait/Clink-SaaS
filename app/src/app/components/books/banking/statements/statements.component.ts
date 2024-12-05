import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Statement {
  account: string;
  period: string;
  openingBalance: number;
  closingBalance: number;
  format: 'PDF' | 'CSV' | 'Excel';
  status: 'Reconciled' | 'Pending' | 'Unreconciled';
}

@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StatementsComponent {
  totalStatements = 156;
  statementsChange = '+12 this month';
  reconciledCount = 148;
  reconciledTrend = 'up';
  reconciledChange = '+15 from last month';
  pendingReview = 8;
  pendingTrend = 'down';
  pendingChange = '-3 from last week';

  statements: Statement[] = [
    {
      account: 'Main Business Checking',
      period: 'January 2024',
      openingBalance: 25430.00,
      closingBalance: 35750.00,
      format: 'PDF',
      status: 'Pending'
    },
    {
      account: 'Business Savings',
      period: 'January 2024',
      openingBalance: 150000.00,
      closingBalance: 175000.00,
      format: 'CSV',
      status: 'Reconciled'
    },
    {
      account: 'Corporate Credit Card',
      period: 'January 2024',
      openingBalance: -1500.00,
      closingBalance: -2500.00,
      format: 'PDF',
      status: 'Unreconciled'
    },
    {
      account: 'Main Business Checking',
      period: 'December 2023',
      openingBalance: 18750.00,
      closingBalance: 25430.00,
      format: 'Excel',
      status: 'Reconciled'
    },
    {
      account: 'Business Savings',
      period: 'December 2023',
      openingBalance: 125000.00,
      closingBalance: 150000.00,
      format: 'PDF',
      status: 'Reconciled'
    }
  ];

  viewStatement(statement: Statement): void {
    alert(`Viewing statement for ${statement.account} - ${statement.period}... Feature coming soon!`);
  }

  downloadStatement(statement: Statement): void {
    alert(`Downloading ${statement.format} statement for ${statement.account} - ${statement.period}... Feature coming soon!`);
  }

  reconcileStatement(statement: Statement): void {
    alert(`Reconciling statement for ${statement.account} - ${statement.period}... Feature coming soon!`);
  }

  importStatements(): void {
    alert('Statement import feature coming soon!');
  }

  exportStatements(): void {
    alert('Statement export feature coming soon!');
  }

  generateReport(): void {
    alert('Report generation feature coming soon!');
  }
}
