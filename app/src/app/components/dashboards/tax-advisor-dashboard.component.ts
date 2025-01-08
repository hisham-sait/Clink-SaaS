import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-advisor-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Tax Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">Tax Overview</h5>
                  <p class="text-muted mb-0">Current Tax Year {{ currentTaxYear }}</p>
                </div>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-download me-2"></i>Export Report
                  </button>
                  <button class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg me-2"></i>New Filing
                  </button>
                </div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-receipt fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Tax Liability</h6>
                      <h4 class="mb-0">€{{ taxLiability.toLocaleString() }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-check-circle fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Tax Paid</h6>
                      <h4 class="mb-0">€{{ taxPaid.toLocaleString() }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-calendar-check fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Next Due Date</h6>
                      <h4 class="mb-0">{{ nextDueDate }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-file-earmark-text fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Pending Returns</h6>
                      <h4 class="mb-0">{{ pendingReturns }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tax Calendar -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Tax Calendar</h5>
                <button class="btn btn-sm btn-outline-primary">View Full Calendar</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let deadline of taxDeadlines">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + deadline.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + deadline.icon + ' text-' + deadline.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ deadline.title }}</h6>
                        <small class="text-muted">Due: {{ deadline.date }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + deadline.type">{{ deadline.daysLeft }} days left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tax Compliance -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Compliance Status</h5>
                <button class="btn btn-sm btn-outline-primary">View Details</button>
              </div>
              <div class="mb-4" *ngFor="let status of complianceStatus">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ status.category }}</span>
                  <span [class]="'text-' + status.type">{{ status.status }}</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [class]="'bg-' + status.type"
                       [style.width.%]="status.completion"></div>
                </div>
                <small class="text-muted">{{ status.note }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Filings -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Recent Filings</h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Filing Type</th>
                      <th>Period</th>
                      <th>Submission Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let filing of recentFilings">
                      <td>{{ filing.type }}</td>
                      <td>{{ filing.period }}</td>
                      <td>{{ filing.date }}</td>
                      <td>€{{ filing.amount.toLocaleString() }}</td>
                      <td>
                        <span [class]="'badge bg-' + filing.status.type">
                          {{ filing.status.label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class TaxAdvisorDashboardComponent {
  // Mock data
  currentTaxYear = '2024';
  taxLiability = 245000;
  taxPaid = 180000;
  nextDueDate = 'Apr 30, 2024';
  pendingReturns = 3;

  taxDeadlines = [
    {
      title: 'VAT Return Q1',
      date: 'April 30, 2024',
      daysLeft: 15,
      type: 'danger',
      icon: 'bi-receipt'
    },
    {
      title: 'Payroll Tax',
      date: 'April 15, 2024',
      daysLeft: 7,
      type: 'warning',
      icon: 'bi-people'
    },
    {
      title: 'Corporation Tax',
      date: 'May 31, 2024',
      daysLeft: 45,
      type: 'info',
      icon: 'bi-building'
    },
    {
      title: 'Annual Return',
      date: 'June 30, 2024',
      daysLeft: 75,
      type: 'success',
      icon: 'bi-file-text'
    }
  ];

  complianceStatus = [
    {
      category: 'VAT Compliance',
      status: 'Up to Date',
      completion: 100,
      type: 'success',
      note: 'All VAT returns filed and paid on time'
    },
    {
      category: 'Corporation Tax',
      status: 'Pending',
      completion: 75,
      type: 'warning',
      note: 'Preliminary tax paid, final return pending'
    },
    {
      category: 'Payroll Taxes',
      status: 'Up to Date',
      completion: 100,
      type: 'success',
      note: 'Monthly returns filed and paid'
    },
    {
      category: 'Tax Registration',
      status: 'Complete',
      completion: 100,
      type: 'success',
      note: 'All required registrations active'
    }
  ];

  recentFilings = [
    {
      type: 'VAT Return',
      period: 'Q4 2023',
      date: 'Jan 31, 2024',
      amount: 45000,
      status: { label: 'Filed', type: 'success' }
    },
    {
      type: 'Payroll Tax',
      period: 'March 2024',
      date: 'Mar 15, 2024',
      amount: 28000,
      status: { label: 'Filed', type: 'success' }
    },
    {
      type: 'Corporation Tax',
      period: 'FY 2023',
      date: 'Mar 1, 2024',
      amount: 120000,
      status: { label: 'Processing', type: 'warning' }
    },
    {
      type: 'VAT Return',
      period: 'Q1 2024',
      date: 'Pending',
      amount: 52000,
      status: { label: 'Pending', type: 'info' }
    }
  ];
}
