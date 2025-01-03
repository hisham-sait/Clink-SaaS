import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RegistryCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  count?: number;
  hasUpdates?: boolean;
  lastUpdated?: string;
}

interface ActivityItem {
  type: 'beneficial-owner' | 'board-minutes' | 'share-allotment' | 'director' | 'shareholder' | 'charge';
  action: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-statutory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Statutory Dashboard</h1>
          <p class="text-muted mb-0">Overview of company statutory records and registers</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="downloadSummary()">
            <i class="bi bi-download"></i>
            <span>Download Summary</span>
          </button>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="createNewRecord()">
            <i class="bi bi-plus-lg"></i>
            <span>New Record</span>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Total Records</span>
                <i class="bi bi-journals fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalRecords() }}</h3>
              <small class="text-muted">Across all registers</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Updated Today</span>
                <i class="bi bi-clock-history fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getUpdatedToday() }}</h3>
              <small class="text-muted">Recent changes</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Pending Updates</span>
                <i class="bi bi-exclamation-circle fs-4 text-warning"></i>
              </div>
              <h3 class="mb-0">{{ getPendingUpdates() }}</h3>
              <small class="text-muted">Require attention</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Compliance Score</span>
                <i class="bi bi-shield-check fs-4 text-success"></i>
              </div>
              <h3 class="mb-0">{{ getComplianceScore() }}%</h3>
              <small class="text-success d-flex align-items-center gap-1">
                <i class="bi bi-arrow-up"></i>
                <span>2% this month</span>
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row g-4">
        <!-- Registry Cards -->
        <div class="col-lg-8">
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let card of registryCards">
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
                      {{ card.count }} Record{{ card.count !== 1 ? 's' : '' }}
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
                  <span class="small">Records Up to Date</span>
                  <span class="small">{{ getUpToDateScore() }}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-success" role="progressbar" 
                       [style.width.%]="getUpToDateScore()"></div>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Recent Activity</span>
                  <span class="small">{{ getActivityScore() }}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-info" role="progressbar" 
                       [style.width.%]="getActivityScore()"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Completeness</span>
                  <span class="small">{{ getCompletenessScore() }}%</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div class="progress-bar bg-primary" role="progressbar" 
                       [style.width.%]="getCompletenessScore()"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Recent Activity</h6>
              
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0" *ngFor="let activity of recentActivity">
                  <div class="d-flex align-items-start gap-3">
                    <div [class]="'bg-' + activity.iconClass + ' bg-opacity-10 rounded p-2'">
                      <i [class]="'bi ' + activity.icon + ' text-' + activity.iconClass"></i>
                    </div>
                    <div>
                      <p class="mb-1">{{ activity.title }}</p>
                      <div class="d-flex align-items-center gap-2 small">
                        <span class="text-muted">{{ activity.description }}</span>
                        <span class="text-muted">•</span>
                        <span class="text-muted">{{ activity.timestamp }}</span>
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
  registryCards: RegistryCard[] = [
    {
      title: 'Directors & Secretaries',
      description: 'Manage and maintain records of company directors and secretaries',
      icon: 'bi bi-person-badge',
      link: '/statutory/directors',
      count: 4,
      hasUpdates: true,
      lastUpdated: '2 days ago'
    },
    {
      title: 'Members Register',
      description: 'Track company shareholders and their holdings',
      icon: 'bi bi-people',
      link: '/statutory/shareholders',
      count: 12,
      lastUpdated: '1 week ago'
    },
    {
      title: 'Share Register',
      description: 'Monitor share allocations and transfers',
      icon: 'bi bi-journal-bookmark',
      link: '/statutory/shares',
      count: 8,
      lastUpdated: '3 days ago'
    },
    {
      title: 'Beneficial Owners',
      description: 'Record and maintain beneficial ownership information',
      icon: 'bi bi-person-check',
      link: '/statutory/beneficial-owners',
      count: 3,
      hasUpdates: true,
      lastUpdated: 'Today'
    },
    {
      title: 'Charges Register',
      description: 'Track company charges and mortgages',
      icon: 'bi bi-bank',
      link: '/statutory/charges',
      count: 2,
      lastUpdated: '1 month ago'
    },
    {
      title: 'Share Allotments',
      description: 'Manage share allotments and transfers',
      icon: 'bi bi-plus-circle',
      link: '/statutory/allotments',
      count: 15,
      lastUpdated: '2 weeks ago'
    },
    {
      title: 'General Meetings',
      description: 'Record and store minutes of general meetings',
      icon: 'bi bi-calendar-event',
      link: '/statutory/meetings',
      count: 6,
      hasUpdates: true,
      lastUpdated: 'Yesterday'
    },
    {
      title: 'Board Minutes',
      description: 'Maintain records of board meetings and resolutions',
      icon: 'bi bi-file-text',
      link: '/statutory/board-minutes',
      count: 10,
      lastUpdated: '5 days ago'
    }
  ];

  recentActivity: ActivityItem[] = [
    {
      type: 'beneficial-owner',
      action: 'added',
      title: 'New Beneficial Owner Added',
      description: 'John Smith added as PSC',
      timestamp: 'Today',
      icon: 'bi-person-plus',
      iconClass: 'primary'
    },
    {
      type: 'board-minutes',
      action: 'approved',
      title: 'Board Minutes Approved',
      description: 'Q2 Board Meeting minutes finalized',
      timestamp: 'Yesterday',
      icon: 'bi-file-text',
      iconClass: 'success'
    },
    {
      type: 'share-allotment',
      action: 'created',
      title: 'Share Allotment Recorded',
      description: '1,000 ordinary shares allotted',
      timestamp: '2 days ago',
      icon: 'bi-plus-circle',
      iconClass: 'warning'
    }
  ];

  getTotalRecords(): number {
    return this.registryCards.reduce((total, card) => total + (card.count || 0), 0);
  }

  getUpdatedToday(): number {
    return this.registryCards.filter(card => 
      card.lastUpdated?.toLowerCase() === 'today' || 
      card.lastUpdated?.toLowerCase() === 'yesterday'
    ).length;
  }

  getPendingUpdates(): number {
    return this.registryCards.filter(card => card.hasUpdates).length;
  }

  getComplianceScore(): number {
    const totalCards = this.registryCards.length;
    const cardsNeedingUpdates = this.getPendingUpdates();
    const recentlyUpdatedCards = this.registryCards.filter(card => {
      const lastUpdated = card.lastUpdated?.toLowerCase();
      return lastUpdated?.includes('day') || 
             lastUpdated?.includes('week') ||
             lastUpdated === 'today' ||
             lastUpdated === 'yesterday';
    }).length;

    const upToDateScore = ((totalCards - cardsNeedingUpdates) / totalCards) * 100;
    const activityScore = (recentlyUpdatedCards / totalCards) * 100;
    const completenessScore = 100;

    const weightedScore = (
      (upToDateScore * 0.4) +
      (activityScore * 0.3) +
      (completenessScore * 0.3)
    );

    return Math.round(weightedScore);
  }

  getUpToDateScore(): number {
    const totalCards = this.registryCards.length;
    const cardsNeedingUpdates = this.getPendingUpdates();
    return Math.round(((totalCards - cardsNeedingUpdates) / totalCards) * 100);
  }

  getActivityScore(): number {
    const totalCards = this.registryCards.length;
    const recentlyUpdatedCards = this.registryCards.filter(card => {
      const lastUpdated = card.lastUpdated?.toLowerCase();
      return lastUpdated?.includes('day') || 
             lastUpdated?.includes('week') ||
             lastUpdated === 'today' ||
             lastUpdated === 'yesterday';
    }).length;
    return Math.round((recentlyUpdatedCards / totalCards) * 100);
  }

  getCompletenessScore(): number {
    return 100;
  }

  downloadSummary(): void {
    const content = `
Statutory Records Summary
------------------------
Generated: ${new Date().toLocaleString()}

Overview
--------
Total Records: ${this.getTotalRecords()}
Updated Today: ${this.getUpdatedToday()}
Pending Updates: ${this.getPendingUpdates()}
Compliance Score: ${this.getComplianceScore()}%

Compliance Details
----------------
Records Up to Date: ${this.getUpToDateScore()}%
Recent Activity: ${this.getActivityScore()}%
Completeness: ${this.getCompletenessScore()}%

Registry Details
--------------
${this.registryCards.map(card => `
${card.title}
${'-'.repeat(card.title.length)}
Description: ${card.description}
Records: ${card.count || 0}
Last Updated: ${card.lastUpdated || 'N/A'}
Status: ${card.hasUpdates ? 'Updates Pending' : 'Up to date'}
`).join('\n')}

Recent Activity
-------------
${this.recentActivity.map(activity => `
${activity.timestamp}: ${activity.title}
${activity.description}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statutory_summary.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  createNewRecord(): void {
    console.log('Creating new record');
  }

  viewAllActivity(): void {
    console.log('Viewing all activity');
  }
}
