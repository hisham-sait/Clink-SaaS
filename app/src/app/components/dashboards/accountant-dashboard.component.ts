import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accountant-dashboard',
  template: `
    <main class="position-relative min-vh-100 ms-7 bg-body">
      <div class="container-fluid py-4">
        <div class="row g-4">
          <!-- Financial Overview -->
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 class="card-title mb-1">Financial Overview</h5>
                    <p class="text-muted mb-0">Current Financial Year</p>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-outline-primary btn-sm">
                      <i class="bi bi-download me-2"></i>Export
                    </button>
                    <button class="btn btn-primary btn-sm">
                      <i class="bi bi-plus-lg me-2"></i>New Entry
                    </button>
                  </div>
                </div>
                <div class="row g-4">
                  <div class="col-md-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary bg-opacity-10 p-3 rounded">
                        <i class="bi bi-cash-stack fs-4 text-primary"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">Revenue</h6>
                        <h4 class="mb-0">€{{ revenue.toLocaleString() }}</h4>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-success bg-opacity-10 p-3 rounded">
                        <i class="bi bi-graph-up fs-4 text-success"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">Profit</h6>
                        <h4 class="mb-0">€{{ profit.toLocaleString() }}</h4>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-warning bg-opacity-10 p-3 rounded">
                        <i class="bi bi-receipt fs-4 text-warning"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">Expenses</h6>
                        <h4 class="mb-0">€{{ expenses.toLocaleString() }}</h4>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-info bg-opacity-10 p-3 rounded">
                        <i class="bi bi-wallet2 fs-4 text-info"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">Balance</h6>
                        <h4 class="mb-0">€{{ balance.toLocaleString() }}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Tasks -->
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h5 class="card-title mb-0">Pending Tasks</h5>
                  <button class="btn btn-sm btn-outline-primary">View All</button>
                </div>
                <div class="list-group list-group-flush">
                  <div class="list-group-item border-0 px-0" *ngFor="let task of pendingTasks">
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <div [class]="'bg-' + task.type + ' bg-opacity-10 p-2 rounded'">
                          <i [class]="'bi ' + task.icon + ' text-' + task.type"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-0">{{ task.title }}</h6>
                          <small class="text-muted">Due: {{ task.dueDate }}</small>
                        </div>
                      </div>
                      <button class="btn btn-sm" [class]="'btn-outline-' + task.type">
                        {{ task.action }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h5 class="card-title mb-0">Recent Transactions</h5>
                  <button class="btn btn-sm btn-outline-primary">View All</button>
                </div>
                <div class="list-group list-group-flush">
                  <div class="list-group-item border-0 px-0" *ngFor="let transaction of recentTransactions">
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <div [class]="'bg-' + transaction.type + ' bg-opacity-10 p-2 rounded'">
                          <i [class]="'bi ' + transaction.icon + ' text-' + transaction.type"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-0">{{ transaction.description }}</h6>
                          <small class="text-muted">{{ transaction.date }}</small>
                        </div>
                      </div>
                      <span [class]="'text-' + transaction.type">
                        {{ transaction.amount > 0 ? '+' : '' }}€{{ transaction.amount.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports -->
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-4">Available Reports</h5>
                <div class="row g-4">
                  <div class="col-md-3" *ngFor="let report of availableReports">
                    <div class="card border">
                      <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                          <div [class]="'bg-' + report.type + ' bg-opacity-10 p-3 rounded'">
                            <i [class]="'bi ' + report.icon + ' fs-4 text-' + report.type"></i>
                          </div>
                          <div class="ms-3">
                            <h6 class="mb-1">{{ report.title }}</h6>
                            <small class="text-muted">{{ report.period }}</small>
                          </div>
                        </div>
                        <button class="btn btn-sm w-100" [class]="'btn-outline-' + report.type">
                          Generate Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ms-7 {
      margin-left: 48px;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class AccountantDashboardComponent {
  // Mock data
  revenue = 1250000;
  profit = 450000;
  expenses = 800000;
  balance = 650000;

  pendingTasks = [
    {
      title: 'Monthly Financial Report',
      dueDate: 'Tomorrow',
      type: 'danger',
      icon: 'bi-file-earmark-text',
      action: 'Complete Now'
    },
    {
      title: 'Tax Return Preparation',
      dueDate: 'Next Week',
      type: 'warning',
      icon: 'bi-calculator',
      action: 'Review'
    },
    {
      title: 'Expense Reconciliation',
      dueDate: 'Today',
      type: 'success',
      icon: 'bi-receipt',
      action: 'Process'
    },
    {
      title: 'Budget Planning',
      dueDate: 'Friday',
      type: 'info',
      icon: 'bi-graph-up',
      action: 'Start'
    }
  ];

  recentTransactions = [
    {
      description: 'Client Payment - Tech Solutions',
      date: 'Today, 10:30 AM',
      amount: 25000,
      type: 'success',
      icon: 'bi-arrow-down'
    },
    {
      description: 'Office Supplies',
      date: 'Yesterday',
      amount: -1500,
      type: 'danger',
      icon: 'bi-arrow-up'
    },
    {
      description: 'Consulting Revenue',
      date: '2 days ago',
      amount: 15000,
      type: 'success',
      icon: 'bi-arrow-down'
    },
    {
      description: 'Software Subscription',
      date: '3 days ago',
      amount: -2000,
      type: 'danger',
      icon: 'bi-arrow-up'
    }
  ];

  availableReports = [
    {
      title: 'Financial Statement',
      period: 'Q1 2024',
      type: 'primary',
      icon: 'bi-file-earmark-text'
    },
    {
      title: 'Balance Sheet',
      period: 'March 2024',
      type: 'success',
      icon: 'bi-file-spreadsheet'
    },
    {
      title: 'Cash Flow',
      period: 'YTD 2024',
      type: 'info',
      icon: 'bi-cash-stack'
    },
    {
      title: 'Tax Summary',
      period: 'FY 2024',
      type: 'warning',
      icon: 'bi-calculator'
    }
  ];
}
