import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ExpensesComponent {
  expenseMetrics = [
    {
      title: 'Total Expenses',
      value: '$45,280',
      trend: 'up',
      change: '+12.5%',
      icon: 'bi bi-receipt'
    },
    {
      title: 'Pending Approval',
      value: '$8,450',
      trend: 'down',
      change: '-15%',
      icon: 'bi bi-clock'
    },
    {
      title: 'Reimbursements',
      value: '$12,680',
      trend: 'up',
      change: '+5.2%',
      icon: 'bi bi-cash-stack'
    },
    {
      title: 'Open Claims',
      value: '15',
      trend: 'neutral',
      icon: 'bi bi-file-earmark-text'
    }
  ];

  recentExpenses = [
    {
      id: 'EXP001',
      description: 'Business Travel - Conference',
      category: 'Travel',
      amount: 2500,
      date: '2024-01-15',
      status: 'Pending',
      submittedBy: 'John Smith'
    },
    {
      id: 'EXP002',
      description: 'Office Supplies',
      category: 'Supplies',
      amount: 450,
      date: '2024-01-14',
      status: 'Approved',
      submittedBy: 'Sarah Johnson'
    },
    {
      id: 'EXP003',
      description: 'Client Meeting Lunch',
      category: 'Meals',
      amount: 180,
      date: '2024-01-14',
      status: 'Reimbursed',
      submittedBy: 'Michael Brown'
    },
    {
      id: 'EXP004',
      description: 'Software Subscription',
      category: 'Software',
      amount: 750,
      date: '2024-01-13',
      status: 'Approved',
      submittedBy: 'Emily Davis'
    }
  ];

  expenseCategories = [
    {
      name: 'Travel',
      count: 45,
      amount: 15800,
      icon: 'bi bi-airplane'
    },
    {
      name: 'Office Supplies',
      count: 28,
      amount: 4500,
      icon: 'bi bi-pencil'
    },
    {
      name: 'Software',
      count: 15,
      amount: 8900,
      icon: 'bi bi-laptop'
    },
    {
      name: 'Meals',
      count: 32,
      amount: 3200,
      icon: 'bi bi-cup-hot'
    }
  ];

  quickActions = [
    {
      title: 'Add Expense',
      icon: 'bi bi-plus-lg',
      action: 'add'
    },
    {
      title: 'Scan Receipt',
      icon: 'bi bi-camera',
      action: 'scan'
    },
    {
      title: 'Create Report',
      icon: 'bi bi-file-earmark-text',
      action: 'report'
    },
    {
      title: 'Review Claims',
      icon: 'bi bi-check2-square',
      action: 'review'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Pending': 'pending',
      'Approved': 'approved',
      'Reimbursed': 'reimbursed',
      'Rejected': 'rejected'
    };
    return classes[status as keyof typeof classes] || '';
  }
}
