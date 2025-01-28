import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { 
  ActivityService, 
  DirectorService,
  ShareholderService,
  ShareService,
  BeneficialOwnerService,
  ChargeService,
  AllotmentService,
  MeetingService,
  BoardMinuteService
} from '../../services/statutory';
import { Activity } from './statutory.types';

interface RegistryCardData {
  count: number;
  lastUpdated?: string;
  hasUpdates?: boolean;
}

interface RegistryCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  count?: number;
  hasUpdates?: boolean;
  lastUpdated?: string;
}

interface ActivityItem extends Activity {
  icon: string;
  iconClass: string;
  title: string;
  timestamp: string;
}

interface DashboardStats {
  totalRecords: number;
  updatedToday: number;
  pendingUpdates: number;
  upToDateScore: number;
  activityScore: number;
  completenessScore: number;
  totalActivities?: number;
  activityByType?: { [key: string]: number };
  activityByEntity?: { [key: string]: number };
}

@Component({
  selector: 'app-statutory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }
    .hover-shadow {
      transition: box-shadow 0.2s ease-in-out;
    }
    .hover-shadow:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
  `],
  template: `
    <ng-container *ngIf="!loading; else loadingTemplate">
      <div class="container-fluid p-4">
        <div *ngIf="error" class="alert alert-danger mb-4">
          {{ error }}
          <button class="btn btn-link text-danger" (click)="refresh()">Try Again</button>
        </div>

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
                        <div class="position-absolute top-0 end-0 translate-middle" *ngIf="getCardData(card.id).hasUpdates">
                          <span class="badge rounded-pill bg-danger">&nbsp;</span>
                        </div>
                      </div>
                      <div>
                        <h5 class="card-title mb-1">{{ card.title }}</h5>
                        <p class="card-text text-muted small mb-0">{{ card.description }}</p>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="badge bg-light text-dark" *ngIf="getCardData(card.id).count !== undefined">
                        {{ getCardData(card.id).count }} Record{{ getCardData(card.id).count !== 1 ? 's' : '' }}
                      </span>
                      <small class="text-muted" *ngIf="getCardData(card.id).lastUpdated">
                        Updated {{ getCardData(card.id).lastUpdated }}
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
                      <div [class]="'bg-' + getActivityIconClass(activity) + ' bg-opacity-10 rounded p-2'">
                        <i [class]="'bi ' + getActivityIcon(activity) + ' text-' + getActivityIconClass(activity)"></i>
                      </div>
                      <div>
                        <p class="mb-1">{{ getActivityTitle(activity) }}</p>
                        <div class="d-flex align-items-center gap-2 small">
                          <span class="text-muted">{{ activity.description }}</span>
                          <span class="text-muted">•</span>
                          <span class="text-muted">{{ formatActivityTime(activity.time) }}</span>
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
    </ng-container>

    <ng-template #loadingTemplate>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </ng-template>
  `
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  stats: DashboardStats = {
    totalRecords: 0,
    updatedToday: 0,
    pendingUpdates: 0,
    upToDateScore: 0,
    activityScore: 0,
    completenessScore: 0
  };

  registryCards: RegistryCard[] = [
    {
      id: 'directors',
      title: 'Directors & Secretaries',
      description: 'Manage and maintain records of company directors and secretaries',
      icon: 'bi bi-person-badge',
      link: '/statutory/directors'
    },
    {
      id: 'shareholders',
      title: 'Members Register',
      description: 'Track company shareholders and their holdings',
      icon: 'bi bi-people',
      link: '/statutory/shareholders'
    },
    {
      id: 'shares',
      title: 'Share Register',
      description: 'Monitor share allocations and transfers',
      icon: 'bi bi-journal-bookmark',
      link: '/statutory/shares'
    },
    {
      id: 'beneficial-owners',
      title: 'Beneficial Owners',
      description: 'Record and maintain beneficial ownership information',
      icon: 'bi bi-person-check',
      link: '/statutory/beneficial-owners'
    },
    {
      id: 'charges',
      title: 'Charges Register',
      description: 'Track company charges and mortgages',
      icon: 'bi bi-bank',
      link: '/statutory/charges'
    },
    {
      id: 'allotments',
      title: 'Share Allotments',
      description: 'Manage share allotments and transfers',
      icon: 'bi bi-plus-circle',
      link: '/statutory/allotments'
    },
    {
      id: 'meetings',
      title: 'General Meetings',
      description: 'Record and store minutes of general meetings',
      icon: 'bi bi-calendar-event',
      link: '/statutory/meetings'
    },
    {
      id: 'board-minutes',
      title: 'Board Minutes',
      description: 'Maintain records of board meetings and resolutions',
      icon: 'bi bi-file-text',
      link: '/statutory/board-minutes'
    }
  ];

  cardData: { [key: string]: RegistryCardData } = {};
  recentActivity: Activity[] = [];

  constructor(
    private authService: AuthService,
    private activityService: ActivityService,
    private directorService: DirectorService,
    private shareholderService: ShareholderService,
    private shareService: ShareService,
    private beneficialOwnerService: BeneficialOwnerService,
    private chargeService: ChargeService,
    private allotmentService: AllotmentService,
    private meetingService: MeetingService,
    private boardMinuteService: BoardMinuteService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private async loadDashboardData() {
    let user;
    try {
      this.loading = true;
      this.error = null;

      user = this.authService.currentUserValue;
      if (!user?.companyId) {
        throw new Error('No company selected');
      }
      const companyId = user.companyId;

      // Load activities
      const activityResponse = await firstValueFrom(this.activityService.getActivities(companyId, { limit: 5 }));
      this.recentActivity = activityResponse?.activities || [];

      // Get activity statistics
      const stats = await firstValueFrom(this.activityService.getActivityStatistics(companyId));
      if (stats) {
        // Update activity-based stats
        this.stats.totalActivities = stats.totalActivities;
        this.stats.activityByType = stats.activityByType;
        this.stats.activityByEntity = stats.activityByEntity;
      }

      // Load registry card data
      await Promise.all([
        this.loadCardData('directors', firstValueFrom(this.directorService.getDirectors(companyId, 'Active'))),
        this.loadCardData('shareholders', firstValueFrom(this.shareholderService.getShareholders(companyId, 'Active'))),
        this.loadCardData('shares', firstValueFrom(this.shareService.getShares(companyId, 'Active'))),
        this.loadCardData('beneficial-owners', firstValueFrom(this.beneficialOwnerService.getBeneficialOwners(companyId, 'Active'))),
        this.loadCardData('charges', firstValueFrom(this.chargeService.getCharges(companyId, 'Active'))),
        this.loadCardData('allotments', firstValueFrom(this.allotmentService.getAllotments(companyId, 'Active'))),
        this.loadCardData('meetings', firstValueFrom(this.meetingService.getMeetings(companyId, 'Final'))),
        this.loadCardData('board-minutes', firstValueFrom(this.boardMinuteService.getBoardMinutes(companyId, 'Final')))
      ]);

      // Update dashboard stats
      this.updateDashboardStats();

    } catch (err: any) {
      // Handle specific error messages from the API
      if (err?.error?.message) {
        this.error = err.error.message;
      } else {
        this.error = 'Failed to load dashboard data. Please try again.';
      }
      console.error('Dashboard loading error:', {
        error: err,
        message: err?.message,
        companyId: user?.companyId,
        stack: err?.stack
      });
    } finally {
      this.loading = false;
    }
  }

  private async loadCardData(cardId: string, request: Promise<any>) {
    try {
      const response = await request;
      
      // Handle both array responses and paginated responses
      const items = Array.isArray(response) ? response : response.items || [];
      const count = Array.isArray(response) ? response.length : response.total || items.length;
      
      const data: RegistryCardData = {
        count,
        lastUpdated: this.getLastUpdated(items),
        hasUpdates: this.checkForUpdates(items)
      };
      this.cardData[cardId] = data;
    } catch (err: any) {
      console.error(`Error loading ${cardId} data:`, {
        error: err,
        message: err?.message,
        cardId,
        stack: err?.stack
      });
      this.cardData[cardId] = { count: 0 };
    }
  }

  private getLastUpdated(items: any[]): string {
    if (!items?.length) return '';

    const latestDate = new Date(Math.max(...items.map(item => new Date(item.updatedAt || item.createdAt).getTime())));
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  private checkForUpdates(items: any[]): boolean {
    if (!items?.length) return false;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return items.some((item: any) => {
      const updateDate = new Date(item.updatedAt || item.createdAt);
      return updateDate > thirtyDaysAgo && item.status === 'pending';
    });
  }

  private updateDashboardStats() {
    const totalRecords = Object.values(this.cardData).reduce((sum, data) => sum + (data.count || 0), 0);
    const updatedToday = Object.values(this.cardData).filter(data => data.lastUpdated === 'Today').length;
    const pendingUpdates = Object.values(this.cardData).filter(data => data.hasUpdates).length;

    const totalCards = this.registryCards.length;
    const upToDateScore = Math.round(((totalCards - pendingUpdates) / totalCards) * 100);
    
    const recentlyUpdatedCards = Object.values(this.cardData).filter(data => {
      const lastUpdated = data.lastUpdated?.toLowerCase();
      return lastUpdated?.includes('day') || 
             lastUpdated?.includes('week') ||
             lastUpdated === 'today' ||
             lastUpdated === 'yesterday';
    }).length;
    
    const activityScore = Math.round((recentlyUpdatedCards / totalCards) * 100);

    this.stats = {
      ...this.stats, // Preserve existing stats including activity statistics
      totalRecords,
      updatedToday,
      pendingUpdates,
      upToDateScore,
      activityScore,
      completenessScore: this.calculateCompletenessScore()
    };
  }

  private calculateCompletenessScore(): number {
    return Math.round(Object.values(this.cardData).reduce((score, data) => {
      return score + (data.count > 0 ? 1 : 0);
    }, 0) / this.registryCards.length * 100);
  }

  getTotalRecords(): number {
    return this.stats.totalRecords;
  }

  getUpdatedToday(): number {
    return this.stats.updatedToday;
  }

  getPendingUpdates(): number {
    return this.stats.pendingUpdates;
  }

  getComplianceScore(): number {
    const weightedScore = (
      (this.stats.upToDateScore * 0.4) +
      (this.stats.activityScore * 0.3) +
      (this.stats.completenessScore * 0.3)
    );
    return Math.round(weightedScore);
  }

  getUpToDateScore(): number {
    return this.stats.upToDateScore;
  }

  getActivityScore(): number {
    return this.stats.activityScore;
  }

  getCompletenessScore(): number {
    return this.stats.completenessScore;
  }

  getCardData(cardId: string): RegistryCardData {
    return this.cardData[cardId] || { count: 0 };
  }

  getActivityIcon(activity: Activity): string {
    switch (activity.type) {
      case 'appointment':
        return 'bi-person-plus';
      case 'resignation':
        return 'bi-person-dash';
      case 'update':
        return 'bi-pencil';
      case 'removal':
        return 'bi-trash';
      case 'added':
        return 'bi-plus-circle';
      case 'updated':
        return 'bi-pencil';
      case 'removed':
        return 'bi-trash';
      case 'status_changed':
        return 'bi-arrow-repeat';
      default:
        return 'bi-info-circle';
    }
  }

  getActivityIconClass(activity: Activity): string {
    switch (activity.type) {
      case 'appointment':
      case 'added':
        return 'success';
      case 'resignation':
      case 'removal':
      case 'removed':
        return 'danger';
      case 'update':
      case 'updated':
        return 'primary';
      case 'status_changed':
        return 'warning';
      default:
        return 'info';
    }
  }

  getActivityTitle(activity: Activity): string {
    switch (activity.type) {
      case 'appointment':
        return 'New Appointment';
      case 'resignation':
        return 'Resignation';
      case 'update':
        return 'Record Updated';
      case 'removal':
        return 'Record Removed';
      case 'added':
        return 'New Record Added';
      case 'updated':
        return 'Record Updated';
      case 'removed':
        return 'Record Removed';
      case 'status_changed':
        return 'Status Changed';
      default:
        return 'Activity';
    }
  }

  formatActivityTime(time: string): string {
    const date = new Date(time);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  async downloadSummary(): Promise<void> {
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
Records: ${this.getCardData(card.id).count || 0}
Last Updated: ${this.getCardData(card.id).lastUpdated || 'N/A'}
Status: ${this.getCardData(card.id).hasUpdates ? 'Updates Pending' : 'Up to date'}
`).join('\n')}

Recent Activity
-------------
${this.recentActivity.map(activity => `
${this.formatActivityTime(activity.time)}: ${this.getActivityTitle(activity)}
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

  async createNewRecord(): Promise<void> {
    // TODO: Implement modal or navigation to create new record
  }

  async viewAllActivity(): Promise<void> {
    // TODO: Navigate to activity log page
  }

  async refresh(): Promise<void> {
    await this.loadDashboardData();
  }
}
