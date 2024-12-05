import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Budget {
  name: string;
  category: 'Operating' | 'Capital' | 'Project';
  period: string;
  allocated: number;
  spent: number;
  progress: number;
  progressColor: string;
  status: 'Active' | 'Warning' | 'Over Budget';
}

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BudgetsComponent {
  totalBudgets = 12;
  budgetsChange = '+2 this month';
  utilizationRate = 75;
  utilizationTrend = 'up';
  utilizationChange = '+5% from last month';
  budgetAlerts = 3;
  alertsTrend = 'down';
  alertsChange = '-2 from last week';

  budgets: Budget[] = [
    {
      name: 'Operating Expenses',
      category: 'Operating',
      period: 'January 2024',
      allocated: 50000.00,
      spent: 35000.00,
      progress: 70,
      progressColor: 'success',
      status: 'Active'
    },
    {
      name: 'Marketing Campaign',
      category: 'Project',
      period: 'Q1 2024',
      allocated: 25000.00,
      spent: 22500.00,
      progress: 90,
      progressColor: 'warning',
      status: 'Warning'
    },
    {
      name: 'IT Infrastructure',
      category: 'Capital',
      period: 'FY 2024',
      allocated: 100000.00,
      spent: 105000.00,
      progress: 105,
      progressColor: 'danger',
      status: 'Over Budget'
    },
    {
      name: 'Staff Training',
      category: 'Operating',
      period: 'Q1 2024',
      allocated: 15000.00,
      spent: 7500.00,
      progress: 50,
      progressColor: 'success',
      status: 'Active'
    },
    {
      name: 'Office Supplies',
      category: 'Operating',
      period: 'January 2024',
      allocated: 5000.00,
      spent: 4250.00,
      progress: 85,
      progressColor: 'warning',
      status: 'Warning'
    }
  ];

  viewBudget(budget: Budget): void {
    alert(`Viewing budget ${budget.name}... Feature coming soon!`);
  }

  editBudget(budget: Budget): void {
    alert(`Editing budget ${budget.name}... Feature coming soon!`);
  }

  deleteBudget(budget: Budget): void {
    alert(`Deleting budget ${budget.name}... Feature coming soon!`);
  }

  copyBudget(): void {
    alert('Budget copy feature coming soon!');
  }

  exportBudgets(): void {
    alert('Budget export feature coming soon!');
  }

  generateReport(): void {
    alert('Report generation feature coming soon!');
  }
}
