import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RecurringInvoice {
  id: string;
  name: string;
  client: string;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  amount: number;
  nextDate: string;
  status: 'Active' | 'Paused' | 'Ended';
}

@Component({
  selector: 'app-recurring-invoices',
  templateUrl: './recurring.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RecurringInvoicesComponent {
  recurringInvoices: RecurringInvoice[] = [
    {
      id: '1',
      name: 'Monthly Hosting Service',
      client: 'ABC Corporation',
      frequency: 'Monthly',
      amount: 299.00,
      nextDate: '2024-02-01',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Quarterly Maintenance',
      client: 'XYZ Ltd',
      frequency: 'Quarterly',
      amount: 1500.00,
      nextDate: '2024-04-01',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Annual License Fee',
      client: 'Tech Solutions Inc',
      frequency: 'Yearly',
      amount: 5000.00,
      nextDate: '2024-01-01',
      status: 'Paused'
    },
    {
      id: '4',
      name: 'Monthly Support Package',
      client: 'Global Industries',
      frequency: 'Monthly',
      amount: 499.00,
      nextDate: '2024-02-01',
      status: 'Active'
    }
  ];

  get activeSchedules(): number {
    return this.recurringInvoices.filter(inv => inv.status === 'Active').length;
  }

  get totalMonthlyRevenue(): number {
    return this.recurringInvoices
      .filter(inv => inv.status === 'Active' && inv.frequency === 'Monthly')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  get dueThisMonth(): number {
    const currentMonth = new Date().getMonth();
    return this.recurringInvoices
      .filter(inv => {
        const dueDate = new Date(inv.nextDate);
        return inv.status === 'Active' && dueDate.getMonth() === currentMonth;
      })
      .length;
  }

  get dueThisMonthAmount(): number {
    const currentMonth = new Date().getMonth();
    return this.recurringInvoices
      .filter(inv => {
        const dueDate = new Date(inv.nextDate);
        return inv.status === 'Active' && dueDate.getMonth() === currentMonth;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  get nextDueDate(): Date | null {
    const activeInvoices = this.recurringInvoices
      .filter(inv => inv.status === 'Active')
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
    
    return activeInvoices.length > 0 ? new Date(activeInvoices[0].nextDate) : null;
  }

  get nextDueAmount(): number {
    if (!this.nextDueDate) return 0;
    
    const nextDate = this.nextDueDate.toISOString().split('T')[0];
    return this.recurringInvoices
      .filter(inv => inv.status === 'Active' && inv.nextDate === nextDate)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  pauseSchedule(invoice: RecurringInvoice): void {
    alert(`Pausing schedule for ${invoice.name}... Feature coming soon!`);
  }

  resumeSchedule(invoice: RecurringInvoice): void {
    alert(`Resuming schedule for ${invoice.name}... Feature coming soon!`);
  }

  endSchedule(invoice: RecurringInvoice): void {
    alert(`Ending schedule for ${invoice.name}... Feature coming soon!`);
  }
}
