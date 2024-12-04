import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PayrollComponent {
  payrollMetrics = [
    {
      title: 'Total Employees',
      value: '45',
      trend: 'up',
      change: '+3',
      icon: 'bi bi-people'
    },
    {
      title: 'Monthly Payroll',
      value: '$125,750',
      trend: 'up',
      change: '+5.2%',
      icon: 'bi bi-cash-stack'
    },
    {
      title: 'Tax Deductions',
      value: '$28,430',
      trend: 'neutral',
      icon: 'bi bi-percent'
    },
    {
      title: 'Pending Approvals',
      value: '3',
      trend: 'down',
      change: '-2',
      icon: 'bi bi-clock-history'
    }
  ];

  employees = [
    {
      id: 'EMP001',
      name: 'John Smith',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 85000,
      status: 'Active',
      lastPaid: '2024-01-15'
    },
    {
      id: 'EMP002',
      name: 'Sarah Johnson',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 75000,
      status: 'Active',
      lastPaid: '2024-01-15'
    },
    {
      id: 'EMP003',
      name: 'Michael Brown',
      department: 'Finance',
      position: 'Financial Analyst',
      salary: 70000,
      status: 'On Leave',
      lastPaid: '2024-01-15'
    },
    {
      id: 'EMP004',
      name: 'Emily Davis',
      department: 'HR',
      position: 'HR Manager',
      salary: 72000,
      status: 'Active',
      lastPaid: '2024-01-15'
    }
  ];

  recentPayroll = [
    {
      type: 'salary',
      description: 'Monthly salary processed for Engineering team',
      amount: 245000,
      date: '2024-01-15',
      status: 'Completed'
    },
    {
      type: 'bonus',
      description: 'Q4 Performance Bonus',
      amount: 50000,
      date: '2024-01-10',
      status: 'Completed'
    },
    {
      type: 'tax',
      description: 'Tax deductions for December',
      amount: 28430,
      date: '2024-01-05',
      status: 'Processed'
    },
    {
      type: 'adjustment',
      description: 'Overtime payments for Marketing team',
      amount: 12500,
      date: '2024-01-03',
      status: 'Completed'
    }
  ];

  quickActions = [
    {
      title: 'Process Payroll',
      icon: 'bi bi-cash',
      action: 'process'
    },
    {
      title: 'Add Employee',
      icon: 'bi bi-person-plus',
      action: 'add'
    },
    {
      title: 'Tax Calculator',
      icon: 'bi bi-calculator',
      action: 'calculate'
    },
    {
      title: 'Generate Reports',
      icon: 'bi bi-file-earmark-text',
      action: 'report'
    }
  ];

  getActivityIcon(type: string): string {
    const icons = {
      salary: 'bi-cash',
      bonus: 'bi-star',
      tax: 'bi-percent',
      adjustment: 'bi-pencil-square'
    };
    return icons[type as keyof typeof icons] || 'bi-circle';
  }
}
