import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ComplianceStats {
  totalRequirements: number;
  completedRequirements: number;
  pendingAudits: number;
  activePolicies: number;
  riskLevel: string;
  lastUpdated: Date;
}

interface ESGMetrics {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  carbonFootprint: string;
  sustainabilityRating: string;
}

interface GovernanceStats {
  boardMeetings: number;
  committeeMeetings: number;
  policiesReviewed: number;
  riskAssessments: number;
}

interface ComplianceTracking {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  overdueItems: number;
}

interface Deadline {
  title: string;
  date: Date;
  priority: 'High' | 'Medium' | 'Low';
}

interface Filing {
  name: string;
  dueDate: Date;
  status: 'In Progress' | 'Not Started' | 'Under Review' | 'Completed';
}

interface Audit {
  name: string;
  date: Date;
  status: 'Completed' | 'In Review' | 'Pending';
  findings: number;
}

interface RegulatoryUpdate {
  title: string;
  date: Date;
  priority: 'High' | 'Medium' | 'Low';
}

interface ComplianceCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  count?: number;
  hasUpdates?: boolean;
  lastUpdated?: string;
}

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Compliance Dashboard</h1>
          <p class="text-muted mb-0">Monitor and manage your business compliance requirements</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="downloadReport()">
            <i class="bi bi-download"></i>
            <span>Download Report</span>
          </button>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="createCompliance()">
            <i class="bi bi-plus-lg"></i>
            <span>New Compliance</span>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Requirements</span>
                <i class="bi bi-clipboard-check fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{complianceStats.completedRequirements}}/{{complianceStats.totalRequirements}}</h3>
              <small class="text-muted">Completed requirements</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">ESG Score</span>
                <i class="bi bi-graph-up-arrow fs-4 text-success"></i>
              </div>
              <h3 class="mb-0">{{esgMetrics.environmentalScore}}/100</h3>
              <small class="text-success d-flex align-items-center gap-1">
                <i class="bi bi-arrow-up"></i>
                <span>Rating: {{esgMetrics.sustainabilityRating}}</span>
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Governance</span>
                <i class="bi bi-building fs-4 text-info"></i>
              </div>
              <h3 class="mb-0">{{governanceStats.policiesReviewed}}</h3>
              <small class="text-muted">Policies reviewed this quarter</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Risk Level</span>
                <i class="bi bi-shield-check fs-4 text-warning"></i>
              </div>
              <h3 class="mb-0">{{complianceStats.riskLevel}}</h3>
              <small class="text-muted">Last updated: {{complianceStats.lastUpdated | date:'shortDate'}}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row g-4">
        <!-- Compliance Cards -->
        <div class="col-lg-8">
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let card of complianceCards">
              <a [routerLink]="card.link" class="card h-100 text-decoration-none text-dark hover-shadow">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="bg-light rounded p-3 position-relative">
                      <i [class]="card.icon + ' fs-4 text-primary'"></i>
                      <div class="position-absolute top-0 end-0 translate-middle" *ngIf="card.hasUpdates">
                        <span class="badge rounded-pill bg-danger">&nbsp;</span>
                      </div>
                    </div>
                    <div>
                      <h5 class="card-title mb-1">{{ card.title }}</h5>
                      <p class="card-text text-muted small mb-0">{{ card.description }}</p>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-light text-dark" *ngIf="card.count !== undefined">
                      {{ card.count }} Item{{ card.count !== 1 ? 's' : '' }}
                    </span>
                    <small class="text-muted" *ngIf="card.lastUpdated">
                      Updated {{ card.lastUpdated }}
                    </small>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Compliance Progress -->
          <div class="card mb-4">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Compliance Progress</h6>
              
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Requirements Met</span>
                  <span class="small">{{(complianceStats.completedRequirements/complianceStats.totalRequirements*100) | number:'1.0-0'}}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-success" role="progressbar" 
                       [style.width.%]="complianceStats.completedRequirements/complianceStats.totalRequirements*100"></div>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">ESG Performance</span>
                  <span class="small">{{esgMetrics.environmentalScore}}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-info" role="progressbar" 
                       [style.width.%]="esgMetrics.environmentalScore"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Policy Coverage</span>
                  <span class="small">{{(governanceStats.policiesReviewed/12*100) | number:'1.0-0'}}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-primary" role="progressbar" 
                       [style.width.%]="governanceStats.policiesReviewed/12*100"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Recent Activity</h6>
              
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0" *ngFor="let filing of upcomingFilings">
                  <div class="d-flex align-items-start gap-3">
                    <div [class]="'bg-' + getStatusClass(filing.status) + ' bg-opacity-10 rounded p-2'">
                      <i class="bi bi-file-earmark-text" [class]="'text-' + getStatusClass(filing.status)"></i>
                    </div>
                    <div>
                      <p class="mb-1">{{filing.name}}</p>
                      <div class="d-flex align-items-center gap-2 small">
                        <span class="text-muted">Due: {{filing.dueDate | date:'mediumDate'}}</span>
                        <span class="text-muted">•</span>
                        <span class="text-muted">{{filing.status}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button class="btn btn-link text-decoration-none w-100 mt-3" (click)="viewAllActivity()">
                View All Activity
                <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-shadow {
      transition: box-shadow 0.2s ease-in-out;
    }
    .hover-shadow:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
  `]
})
export class DashboardComponent {
  complianceStats: ComplianceStats = {
    totalRequirements: 45,
    completedRequirements: 32,
    pendingAudits: 3,
    activePolicies: 12,
    riskLevel: 'Low',
    lastUpdated: new Date()
  };

  esgMetrics: ESGMetrics = {
    environmentalScore: 85,
    socialScore: 78,
    governanceScore: 92,
    carbonFootprint: '12.5 tons',
    sustainabilityRating: 'A-'
  };

  governanceStats: GovernanceStats = {
    boardMeetings: 4,
    committeeMeetings: 12,
    policiesReviewed: 8,
    riskAssessments: 6
  };

  complianceTracking: ComplianceTracking = {
    totalTasks: 68,
    completedTasks: 45,
    upcomingDeadlines: 5,
    overdueItems: 2
  };

  complianceCards: ComplianceCard[] = [
    {
      title: 'Regulatory Compliance',
      description: 'Track and manage regulatory requirements',
      icon: 'bi bi-shield-check',
      link: '/compliance/regulatory',
      count: 45,
      hasUpdates: true,
      lastUpdated: '2 days ago'
    },
    {
      title: 'Requirements',
      description: 'Monitor compliance requirements and status',
      icon: 'bi bi-list-check',
      link: '/compliance/requirements',
      count: 32,
      lastUpdated: '1 week ago'
    },
    {
      title: 'Filing Management',
      description: 'Track regulatory filings and deadlines',
      icon: 'bi bi-file-earmark-text',
      link: '/compliance/filing',
      count: 15,
      hasUpdates: true,
      lastUpdated: 'Today'
    },
    {
      title: 'Audits',
      description: 'Manage compliance audits and findings',
      icon: 'bi bi-search',
      link: '/compliance/audits',
      count: 8,
      lastUpdated: '3 days ago'
    },
    {
      title: 'Policies',
      description: 'Maintain and review company policies',
      icon: 'bi bi-journal-text',
      link: '/compliance/policies',
      count: 12,
      lastUpdated: '1 month ago'
    },
    {
      title: 'ESG',
      description: 'Monitor environmental, social, and governance metrics',
      icon: 'bi bi-tree',
      link: '/compliance/esg',
      count: 6,
      hasUpdates: true,
      lastUpdated: 'Yesterday'
    },
    {
      title: 'Governance',
      description: 'Track corporate governance activities',
      icon: 'bi bi-diagram-3',
      link: '/compliance/governance',
      count: 10,
      lastUpdated: '5 days ago'
    },
    {
      title: 'Tracking',
      description: 'Monitor compliance progress and metrics',
      icon: 'bi bi-graph-up',
      link: '/compliance/tracking',
      count: 24,
      lastUpdated: '1 week ago'
    }
  ];

  upcomingFilings: Filing[] = [
    {
      name: 'Annual Compliance Report',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: 'In Progress'
    },
    {
      name: 'Quarterly ESG Disclosure',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 25)),
      status: 'Not Started'
    },
    {
      name: 'Board Meeting Minutes',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      status: 'Under Review'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'warning';
      case 'Not Started':
        return 'danger';
      case 'Under Review':
        return 'info';
      case 'Completed':
        return 'success';
      default:
        return 'secondary';
    }
  }

  downloadReport(): void {
    console.log('Downloading compliance report');
  }

  createCompliance(): void {
    console.log('Creating new compliance item');
  }

  viewAllActivity(): void {
    console.log('Viewing all activity');
  }
}
