import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { CreateMeetingModalComponent } from './modal/create-meeting-modal.component';
import { EditMeetingModalComponent } from './modal/edit-meeting-modal.component';
import { ViewMeetingModalComponent } from './modal/view-meeting-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { MeetingService } from '../../../services/statutory/meeting.service';
import { CompanyService } from '../../../services/settings/company.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { AuthService } from '../../../services/auth/auth.service';

import { Meeting, Activity, DocumentStatus, ActivityResponse } from '../statutory.types';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateMeetingModalComponent,
    EditMeetingModalComponent,
    ViewMeetingModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">General Meetings Minutes</h1>
          <p class="text-muted mb-0">Record and manage company general meetings and resolutions</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddMeetingModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Meeting</span>
          </button>
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
                <h3 class="mb-0">{{ meetings.length }}</h3>
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
                  <span class="text-muted">Quorum</span>
                  <i class="bi bi-people fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getQuorumAchievedPercentage() }}%</h3>
                <small class="text-muted">Quorum achievement rate</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Meetings Table -->
        <div class="card mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">Meetings</h5>
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
                  <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Chairperson</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Quorum</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let meeting of getFilteredMeetings()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-calendar-event text-secondary"></i>
                      <a href="#" class="text-decoration-none" (click)="viewMeeting(meeting, $event)">
                        {{ meeting.id }}
                      </a>
                    </div>
                  </td>
                  <td>{{ meeting.meetingType }}</td>
                  <td>{{ formatDate(meeting.meetingDate) }}</td>
                  <td>{{ meeting.chairperson }}</td>
                  <td>
                    <span [class]="'badge ' + (meeting.quorum?.achieved ? 'text-bg-success' : 'text-bg-danger')">
                      {{ meeting.quorum?.present || 0 }}/{{ meeting.quorum?.required || 0 }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusClass(meeting.status)">
                      {{ meeting.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewMeeting(meeting)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editMeeting(meeting)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="removeMeeting(meeting)" title="Remove">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredMeetings().length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No meetings found
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
export class MeetingsComponent implements OnInit, OnDestroy {
  meetings: Meeting[] = [];
  showAll = false;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private meetingService: MeetingService,
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
    // Get current company's meetings
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
        this.meetingService.getMeetings(companyId, this.showAll ? undefined : 'Final').pipe(
          map(meetings => meetings.map(m => ({ ...m, company })))
        )
      ),
      catchError(error => {
        console.error('Error loading meetings:', error);
        this.error = 'Failed to load meetings. Please try again.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(meetings => {
      this.meetings = meetings;
      this.loadActivities(companyId);
    });
  }

  private loadActivities(companyId: string): void {
    this.activityService.getActivities(companyId, {
      entityType: 'meeting',
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

  openAddMeetingModal(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(CreateMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newMeeting: Meeting) => {
        this.meetingService.createMeeting(companyId, newMeeting)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create meeting. Please try again.';
              console.error('Error creating meeting:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(meeting => {
              if (meeting) {
                return this.addActivity(companyId, {
                  type: 'added',
                  entityType: 'meeting',
                  entityId: meeting.id,
                  description: `New ${meeting.meetingType} (${meeting.id}) created`,
                  user: 'System'
                }).pipe(map(() => meeting));
              }
              return of(null);
            })
          )
          .subscribe(meeting => {
            if (meeting) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewMeeting(meeting: Meeting, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.meeting = {...meeting};
    
    modalRef.result.then(
      (result: { action: string; meeting: Meeting } | undefined) => {
        if (result?.action === 'edit') {
          this.editMeeting(result.meeting);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editMeeting(meeting: Meeting): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(EditMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.meeting = {...meeting};
    
    modalRef.result.then(
      (updatedMeeting: Meeting) => {
        this.meetingService.updateMeeting(companyId, meeting.id, updatedMeeting)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update meeting. Please try again.';
              console.error('Error updating meeting:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                const statusChanged = meeting.status !== updatedMeeting.status;
                return this.addActivity(companyId, {
                  type: statusChanged ? 'status_changed' : 'updated',
                  entityType: 'meeting',
                  entityId: meeting.id,
                  description: statusChanged 
                    ? `${meeting.id} status changed to ${updatedMeeting.status}`
                    : `${meeting.id} details updated`,
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

  removeMeeting(meeting: Meeting): void {
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
    modalRef.componentInstance.message = `Are you sure you want to remove meeting ${meeting.id}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.meetingService.deleteMeeting(companyId, meeting.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove meeting. Please try again.';
                console.error('Error removing meeting:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                return this.addActivity(companyId, {
                  type: 'removed',
                  entityType: 'meeting',
                  entityId: meeting.id,
                  description: `${meeting.id} removed from meetings register`,
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

  getStatusClass(status: DocumentStatus): string {
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

  getFilteredMeetings(): Meeting[] {
    if (!this.showAll) {
      // Show meetings from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return this.meetings.filter(m => new Date(m.meetingDate) >= threeMonthsAgo);
    }
    return this.meetings;
  }

  getTotalResolutions(): number {
    return this.meetings.reduce((sum, m) => sum + m.resolutions.length, 0);
  }

  getPassedResolutionsPercentage(): number {
    const totalResolutions = this.meetings.reduce((sum, m) => sum + m.resolutions.length, 0);
    if (totalResolutions === 0) return 0;

    const passedResolutions = this.meetings.reduce((sum, m) => 
      sum + m.resolutions.filter(r => r.outcome === 'Passed').length, 0);

    return Math.round((passedResolutions / totalResolutions) * 100);
  }

  getQuorumAchievedPercentage(): number {
    if (this.meetings.length === 0) return 0;

    const achievedCount = this.meetings.filter(m => m.quorum?.achieved).length;
    return Math.round((achievedCount / this.meetings.length) * 100);
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
