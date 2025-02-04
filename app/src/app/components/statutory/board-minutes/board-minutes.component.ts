import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { CreateBoardMinuteModalComponent } from './modal/create-board-minute-modal.component';
import { EditBoardMinuteModalComponent } from './modal/edit-board-minute-modal.component';
import { ViewBoardMinuteModalComponent } from './modal/view-board-minute-modal.component';
import { ImportBoardMinutesModalComponent } from './modal/import-board-minutes-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { BoardMinuteService } from '../../../services/statutory/board-minute.service';
import { CompanyService } from '../../../services/settings/company.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { AuthService } from '../../../services/auth/auth.service';

import { BoardMinute, Activity, ActivityResponse } from '../statutory.types';

type MinuteStatus = 'Draft' | 'Final' | 'Signed';

@Component({
  selector: 'app-board-minutes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateBoardMinuteModalComponent,
    EditBoardMinuteModalComponent,
    ViewBoardMinuteModalComponent,
    ConfirmModalComponent,
    ImportBoardMinutesModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Board Minutes Register</h1>
          <p class="text-muted mb-0">Record and manage board meetings and resolutions</p>
        </div>
        <div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="importMinutes()">
              <i class="bi bi-upload"></i>
              <span>Import</span>
            </button>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddMinuteModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Board Meeting</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && !error">
        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Total Meetings</span>
                  <i class="bi bi-calendar-event fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ minutes.length }}</h3>
                <small class="text-muted">Recorded meetings</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Resolutions</span>
                  <i class="bi bi-file-text fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getTotalResolutions() }}</h3>
                <small class="text-muted">Total resolutions</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Passed</span>
                  <i class="bi bi-check-circle fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getPassedResolutionsPercentage() }}%</h3>
                <small class="text-muted">Resolution success rate</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Actions</span>
                  <i class="bi bi-list-task fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getCompletedActionsPercentage() }}%</h3>
                <small class="text-muted">Action items completed</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Minutes Table -->
        <div class="card mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">Board Meetings</h5>
            <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
              <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
              <span>{{ showAll ? 'Show Recent Only' : 'Show All Meetings' }}</span>
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">ID</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Chairperson</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Resolutions</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let minute of getFilteredMinutes()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-calendar-event text-secondary"></i>
                      <a href="#" class="text-decoration-none" (click)="viewMinute(minute, $event)">
                        {{ minute.id }}
                      </a>
                    </div>
                  </td>
                  <td>{{ formatDate(minute.meetingDate) }}</td>
                  <td>{{ minute.chairperson }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge text-bg-secondary">{{ minute.resolutions.length }}</span>
                      <div class="small">
                        <span class="text-success">{{ getPassedResolutions(minute) }}</span> /
                        <span class="text-danger">{{ getRejectedResolutions(minute) }}</span> /
                        <span class="text-warning">{{ getDeferredResolutions(minute) }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge text-bg-secondary">{{ getTotalActions(minute) }}</span>
                      <div class="small">
                        {{ getCompletedActions(minute) }} completed
                      </div>
                    </div>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusClass(minute.status)">
                      {{ minute.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewMinute(minute)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editMinute(minute)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="removeMinute(minute)" title="Remove">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredMinutes().length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No board meetings found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="card">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">Recent Activities</h5>
            <button class="btn btn-link p-0 text-decoration-none" (click)="refreshData()">
              <i class="bi bi-arrow-clockwise me-1"></i>
              <span>Refresh</span>
            </button>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush">
              <div class="list-group-item px-0" *ngFor="let activity of recentActivities">
                <div class="d-flex align-items-start gap-3">
                  <div class="bg-light rounded p-2">
                    <i [class]="getActivityIcon(activity.type)"></i>
                  </div>
                  <div>
                    <p class="mb-1">{{ activity.description }}</p>
                    <div class="d-flex align-items-center gap-2 small">
                      <span class="text-primary">{{ activity.user }}</span>
                      <span class="text-muted">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-center py-4 text-muted" *ngIf="recentActivities.length === 0">
                <i class="bi bi-info-circle me-2"></i>
                No recent activities
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class BoardMinutesComponent implements OnInit, OnDestroy {
  minutes: BoardMinute[] = [];
  showAll = true;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private boardMinuteService: BoardMinuteService,
    private companyService: CompanyService,
    private activityService: ActivityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    // Get current company's board minutes
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    this.loading = true;
    this.error = null;

    // First get company details
    this.companyService.getCompany(companyId).pipe(
      takeUntil(this.destroy$),
      switchMap(company => 
        this.boardMinuteService.getBoardMinutes(companyId).pipe( // Removed status filter to show all by default
          map(minutes => minutes.map(m => ({ ...m, company })))
        )
      ),
      catchError(error => {
        console.error('Error loading board minutes:', error);
        this.error = 'Failed to load board minutes. Please try again.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(minutesArrays => {
      this.minutes = minutesArrays.flat();
      this.loadActivities(companyId);
    });
  }

  private loadActivities(companyId: string): void {
    this.activityService.getActivities(companyId, {
      entityType: 'board-minute',
      limit: 10
    }).pipe(
      catchError(error => {
        console.error('Error loading activities:', error);
        return of({ activities: [], total: 0 } as ActivityResponse);
      })
    ).subscribe(response => {
      this.recentActivities = response.activities;
    });
  }

  openAddMinuteModal(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(CreateBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newMinute: BoardMinute) => {
        this.boardMinuteService.createBoardMinute(companyId, newMinute)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create board minute. Please try again.';
              console.error('Error creating board minute:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(minute => {
              if (minute) {
                return this.addActivity(companyId, {
                  type: 'added',
                  entityType: 'board-minute',
                  entityId: minute.id,
                  description: `New board meeting ${minute.id} created`,
                  user: 'System'
                }).pipe(map(() => minute));
              }
              return of(null);
            })
          )
          .subscribe(minute => {
            if (minute) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewMinute(minute: BoardMinute, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.minute = {...minute};
    
    modalRef.result.then(
      (result: { action: string; minute: BoardMinute } | undefined) => {
        if (result?.action === 'edit') {
          this.editMinute(result.minute);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editMinute(minute: BoardMinute): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(EditBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.minute = {...minute};
    
    modalRef.result.then(
      (updatedMinute: BoardMinute) => {
        this.boardMinuteService.updateBoardMinute(companyId, minute.id, updatedMinute)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update board minute. Please try again.';
              console.error('Error updating board minute:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                const statusChanged = minute.status !== updatedMinute.status;
                return this.addActivity(companyId, {
                  type: statusChanged ? 'status_changed' : 'updated',
                  entityType: 'board-minute',
                  entityId: minute.id,
                  description: statusChanged 
                    ? `${minute.id} status changed to ${updatedMinute.status}`
                    : `${minute.id} details updated`,
                  user: 'System'
                }).pipe(map(() => result));
              }
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  removeMinute(minute: BoardMinute): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove board meeting ${minute.id}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.boardMinuteService.deleteBoardMinute(companyId, minute.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove board minute. Please try again.';
                console.error('Error removing board minute:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                return this.addActivity(companyId, {
                  type: 'removed',
                  entityType: 'board-minute',
                  entityId: minute.id,
                  description: `${minute.id} removed from board minutes register`,
                  user: 'System'
                });
              })
            )
            .subscribe(activity => {
              if (activity) {
                this.refreshData();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getStatusClass(status: MinuteStatus): string {
    switch (status) {
      case 'Draft':
        return 'text-bg-warning';
      case 'Final':
        return 'text-bg-info';
      case 'Signed':
        return 'text-bg-success';
      default:
        return 'text-bg-secondary';
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.refreshData();
  }

  getFilteredMinutes(): BoardMinute[] {
    if (!this.showAll) {
      // Show meetings from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return this.minutes.filter(m => new Date(m.meetingDate) >= threeMonthsAgo);
    }
    return this.minutes;
  }

  getTotalResolutions(): number {
    return this.minutes.reduce((sum, m) => sum + m.resolutions.length, 0);
  }

  getPassedResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Passed').length;
  }

  getRejectedResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Rejected').length;
  }

  getDeferredResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Deferred').length;
  }

  getPassedResolutionsPercentage(): number {
    const totalResolutions = this.minutes.reduce((sum, m) => sum + m.resolutions.length, 0);
    if (totalResolutions === 0) return 0;

    const passedResolutions = this.minutes.reduce((sum, m) => 
      sum + m.resolutions.filter(r => r.outcome === 'Passed').length, 0);

    return Math.round((passedResolutions / totalResolutions) * 100);
  }

  getTotalActions(minute: BoardMinute): number {
    return minute.discussions.reduce((sum, d) => sum + (d.actionItems?.length || 0), 0);
  }

  getCompletedActions(minute: BoardMinute): number {
    return minute.discussions.reduce((sum, d) => 
      sum + (d.actionItems?.filter(a => a.status === 'Completed').length || 0), 0);
  }

  getCompletedActionsPercentage(): number {
    const totalActions = this.minutes.reduce((sum, m) => 
      sum + m.discussions.reduce((dSum, d) => dSum + (d.actionItems?.length || 0), 0), 0);
    
    if (totalActions === 0) return 0;

    const completedActions = this.minutes.reduce((sum, m) => 
      sum + m.discussions.reduce((dSum, d) => 
        dSum + (d.actionItems?.filter(a => a.status === 'Completed').length || 0), 0), 0);

    return Math.round((completedActions / totalActions) * 100);
  }

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'added':
        return 'bi bi-plus-circle';
      case 'updated':
        return 'bi bi-pencil';
      case 'removed':
        return 'bi bi-trash';
      case 'status_changed':
        return 'bi bi-arrow-repeat';
      default:
        return 'bi bi-activity';
    }
  }

  importMinutes(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(ImportBoardMinutesModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.companyId = companyId;

    modalRef.result.then(
      (result: { imported: number }) => {
        if (result) {
          this.addActivity(companyId, {
            type: 'imported',
            entityType: 'board-minute',
            entityId: 'bulk',
            description: `Imported ${result.imported} board minutes`,
            user: 'System'
          }).subscribe(() => {
            this.refreshData();
          });
        }
      },
      () => {} // Modal dismissed
    );
  }

  private addActivity(companyId: string, activity: Omit<Activity, 'id' | 'companyId' | 'time'>): Observable<Activity | null> {
    return this.activityService.createActivity(companyId, {
      ...activity,
      companyId,
      time: new Date().toISOString()
    }).pipe(
      catchError(error => {
        console.error('Error creating activity:', error);
        return of(null);
      })
    );
  }
}
