import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ESGMetric, ESGInitiative, TrackingStatus, Status } from '../compliance.types';

type StatusClasses = {
  [key in TrackingStatus | Status]: string;
};

type CategoryIcons = {
  [key in 'Environmental' | 'Social' | 'Governance']: string;
};

const esgTemplate = `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">ESG Management</h2>
          <p class="text-muted">Monitor and manage Environmental, Social, and Governance metrics</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary d-inline-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Add Initiative</span>
          </button>
        </div>
      </div>

      <!-- ESG Score Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Environmental Score</h6>
                <div class="rounded-3 bg-success bg-opacity-10 p-2">
                  <i class="bi bi-tree fs-4 text-success"></i>
                </div>
              </div>
              <h3 class="mb-2 fw-semibold">{{statistics.environmentalScore}}/100</h3>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success rounded-pill" [style.width]="statistics.environmentalScore + '%'"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Social Score</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-people fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-2 fw-semibold">{{statistics.socialScore}}/100</h3>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary rounded-pill" [style.width]="statistics.socialScore + '%'"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Governance Score</h6>
                <div class="rounded-3 bg-info bg-opacity-10 p-2">
                  <i class="bi bi-building fs-4 text-info"></i>
                </div>
              </div>
              <h3 class="mb-2 fw-semibold">{{statistics.governanceScore}}/100</h3>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-info rounded-pill" [style.width]="statistics.governanceScore + '%'"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Budget Utilization</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-cash-stack fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-2 fw-semibold">{{formatCurrency(statistics.totalSpent)}}</h3>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-warning rounded-pill" 
                     [style.width]="(statistics.totalSpent/statistics.totalBudget*100) + '%'"></div>
              </div>
              <small class="text-muted">of {{formatCurrency(statistics.totalBudget)}}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- ESG Metrics -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">ESG Metrics</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Metric</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Value</th>
                <th class="text-uppercase small fw-semibold text-secondary">Target</th>
                <th class="text-uppercase small fw-semibold text-secondary">Progress</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let metric of metrics">
                <td>
                  <div class="fw-medium">{{metric.title}}</div>
                  <small class="text-muted">{{metric.description}}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i [class]="'bi ' + getCategoryIcon(metric.category)"></i>
                    <span>{{metric.category}}</span>
                  </div>
                </td>
                <td>{{metric.current}} {{metric.unit}}</td>
                <td>{{metric.target}} {{metric.unit}}</td>
                <td style="min-width: 150px;">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                      <div class="progress-bar rounded-pill" 
                           [ngClass]="{
                             'bg-success': calculateProgress(metric.current, metric.target) >= 90,
                             'bg-warning': calculateProgress(metric.current, metric.target) >= 60 && calculateProgress(metric.current, metric.target) < 90,
                             'bg-danger': calculateProgress(metric.current, metric.target) < 60
                           }"
                           [style.width]="calculateProgress(metric.current, metric.target) + '%'">
                      </div>
                    </div>
                    <small class="text-muted">{{calculateProgress(metric.current, metric.target)}}%</small>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(metric.status)">{{metric.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ESG Initiatives -->
      <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">ESG Initiatives</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Initiative</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Timeline</th>
                <th class="text-uppercase small fw-semibold text-secondary">Budget</th>
                <th class="text-uppercase small fw-semibold text-secondary">Impact</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let initiative of initiatives">
                <td>
                  <div class="fw-medium">{{initiative.title}}</div>
                  <small class="text-muted">{{initiative.description}}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i [class]="'bi ' + getCategoryIcon(initiative.category)"></i>
                    <span>{{initiative.category}}</span>
                  </div>
                </td>
                <td>
                  <div class="small">
                    <div>Start: {{initiative.startDate | date:'mediumDate'}}</div>
                    <div>End: {{initiative.endDate | date:'mediumDate'}}</div>
                  </div>
                </td>
                <td>
                  <div>{{formatCurrency(initiative.spent)}}</div>
                  <small class="text-muted">of {{formatCurrency(initiative.budget)}}</small>
                </td>
                <td>
                  <span>{{initiative.impact}}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(initiative.status)">{{initiative.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Update Progress">
                      <i class="bi bi-arrow-up-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
`;

@Component({
  selector: 'app-compliance-esg',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: esgTemplate
})
export class ESGComponent {
  metrics: ESGMetric[] = [
    {
      id: '1',
      name: 'Carbon Emissions',
      title: 'Carbon Emissions',
      description: 'Total carbon emissions from operations',
      category: 'Environmental',
      unit: 'tons CO2e',
      target: 100,
      current: 125,
      status: 'At Risk',
      reportingPeriod: 'Monthly',
      lastUpdated: new Date().toISOString(),
      nextReportDue: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      methodology: 'GHG Protocol',
      dataSource: 'Energy consumption data',
      companyId: '1'
    },
    {
      id: '2',
      name: 'Employee Training Hours',
      title: 'Employee Training Hours',
      description: 'Total training hours completed by employees',
      category: 'Social',
      unit: 'hours',
      target: 3000,
      current: 2500,
      status: 'On Track',
      reportingPeriod: 'Monthly',
      lastUpdated: new Date().toISOString(),
      nextReportDue: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      methodology: 'HR tracking system',
      dataSource: 'Training records',
      companyId: '1'
    },
    {
      id: '3',
      name: 'Board Diversity',
      title: 'Board Diversity',
      description: 'Percentage of board members from diverse backgrounds',
      category: 'Governance',
      unit: '%',
      target: 50,
      current: 40,
      status: 'On Track',
      reportingPeriod: 'Quarterly',
      lastUpdated: new Date().toISOString(),
      nextReportDue: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      methodology: 'Board composition analysis',
      dataSource: 'Board records',
      companyId: '1'
    }
  ];

  initiatives: ESGInitiative[] = [
    {
      id: '1',
      title: 'Solar Panel Installation',
      category: 'Environmental',
      description: 'Installation of solar panels to reduce carbon footprint',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
      status: 'In Progress',
      budget: 100000,
      spent: 45000,
      impact: 'High impact on carbon reduction',
      stakeholders: ['Facilities', 'Sustainability Team'],
      metrics: ['Carbon Emissions', 'Energy Costs'],
      documents: [],
      companyId: '1'
    },
    {
      id: '2',
      title: 'Community Outreach Program',
      category: 'Social',
      description: 'Program to engage with local communities',
      startDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      status: 'Draft',
      budget: 50000,
      spent: 0,
      impact: 'Medium impact on community relations',
      stakeholders: ['HR', 'Community Relations'],
      metrics: ['Community Engagement', 'Social Impact'],
      documents: [],
      companyId: '1'
    },
    {
      id: '3',
      title: 'Board Restructuring',
      category: 'Governance',
      description: 'Restructuring board composition for better governance',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      status: 'Completed',
      budget: 75000,
      spent: 72000,
      impact: 'High impact on governance structure',
      stakeholders: ['Board', 'Executive Team'],
      metrics: ['Board Diversity', 'Governance Score'],
      documents: [],
      companyId: '1'
    }
  ];

  statistics = {
    environmentalScore: 85,
    socialScore: 78,
    governanceScore: 92,
    totalInitiatives: this.initiatives.length,
    completedInitiatives: this.initiatives.filter(i => i.status === 'Completed').length,
    totalBudget: this.initiatives.reduce((sum, init) => sum + init.budget, 0),
    totalSpent: this.initiatives.reduce((sum, init) => sum + init.spent, 0)
  };

  private statusClasses: StatusClasses = {
    'On Track': 'bg-success',
    'At Risk': 'bg-warning',
    'Off Track': 'bg-danger',
    'Completed': 'bg-success',
    'Not Started': 'bg-secondary',
    'Active': 'bg-success',
    'Inactive': 'bg-secondary',
    'Draft': 'bg-info',
    'Under Review': 'bg-warning',
    'Pending': 'bg-info',
    'In Progress': 'bg-primary',
    'Archived': 'bg-secondary',
    'Superseded': 'bg-warning',
    'Repealed': 'bg-danger'
  };

  private categoryIcons: CategoryIcons = {
    'Environmental': 'bi-tree',
    'Social': 'bi-people',
    'Governance': 'bi-building'
  };

  getStatusClass(status: TrackingStatus | Status): string {
    return this.statusClasses[status] || 'bg-secondary';
  }

  getCategoryIcon(category: keyof CategoryIcons): string {
    return this.categoryIcons[category];
  }

  getTrendIcon(trend: 'Increasing' | 'Decreasing' | 'Stable'): string {
    return {
      'Increasing': 'bi-arrow-up-circle-fill text-success',
      'Decreasing': 'bi-arrow-down-circle-fill text-danger',
      'Stable': 'bi-dash-circle-fill text-warning'
    }[trend];
  }

  calculateProgress(value: number, target: number): number {
    return Math.min(Math.round((value / target) * 100), 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
