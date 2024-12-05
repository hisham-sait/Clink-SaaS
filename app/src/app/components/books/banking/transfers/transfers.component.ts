import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transfer {
  date: string;
  fromAccount: string;
  toAccount: string;
  reference: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TransfersComponent {
  totalTransfers = 156;
  transfersChange = '+12 this month';
  transferVolume = 458920.00;
  volumeTrend = 'up';
  volumeChange = '+15.8% from last month';
  pendingTransfers = 5;
  pendingTrend = 'down';
  pendingChange = '-2 from last week';

  transfers: Transfer[] = [
    {
      date: '2024-01-15',
      fromAccount: 'Main Business Checking',
      toAccount: 'Business Savings',
      reference: 'TRF-2024-001',
      amount: 25000.00,
      status: 'Completed'
    },
    {
      date: '2024-01-14',
      fromAccount: 'Business Savings',
      toAccount: 'Payroll Account',
      reference: 'TRF-2024-002',
      amount: 15000.00,
      status: 'Pending'
    },
    {
      date: '2024-01-14',
      fromAccount: 'Main Business Checking',
      toAccount: 'Tax Reserve Account',
      reference: 'TRF-2024-003',
      amount: 10000.00,
      status: 'Completed'
    },
    {
      date: '2024-01-13',
      fromAccount: 'Business Savings',
      toAccount: 'Investment Account',
      reference: 'TRF-2024-004',
      amount: 50000.00,
      status: 'Failed'
    },
    {
      date: '2024-01-12',
      fromAccount: 'Main Business Checking',
      toAccount: 'Business Savings',
      reference: 'TRF-2024-005',
      amount: 5000.00,
      status: 'Completed'
    }
  ];

  viewTransfer(transfer: Transfer): void {
    alert(`Viewing transfer ${transfer.reference}... Feature coming soon!`);
  }

  cancelTransfer(transfer: Transfer): void {
    alert(`Canceling transfer ${transfer.reference}... Feature coming soon!`);
  }

  repeatTransfer(transfer: Transfer): void {
    alert(`Repeating transfer ${transfer.reference}... Feature coming soon!`);
  }

  scheduleTransfer(): void {
    alert('Transfer scheduling feature coming soon!');
  }

  exportTransfers(): void {
    alert('Export transfers feature coming soon!');
  }

  generateReport(): void {
    alert('Report generation feature coming soon!');
  }
}
