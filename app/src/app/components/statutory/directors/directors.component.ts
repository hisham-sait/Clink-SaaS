import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, from, of, forkJoin } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, filter, map } from 'rxjs/operators';

import { CreateDirectorModalComponent } from './modal/create-director-modal.component';
import { EditDirectorModalComponent } from './modal/edit-director-modal.component';
import { ViewDirectorModalComponent } from './modal/view-director-modal.component';
import { ResignDirectorModalComponent } from './modal/resign-director-modal.component';
import { ConfirmModalComponent } from '../../../components/settings/users/modal/confirm-modal.component';

import { DirectorService } from '../../../services/statutory/director.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { CompanyService } from '../../../services/settings/company.service';
import { Director, Activity } from '../statutory.types';
import type { Company } from '../../../components/settings/settings.types';

interface ActivityResponse {
  activities: Activity[];
  total: number;
}

@Component({
  selector: 'app-directors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateDirectorModalComponent,
    EditDirectorModalComponent,
    ViewDirectorModalComponent,
    ResignDirectorModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Error Alert -->
      <div class="alert alert-danger alert-dismissible fade show" role="alert" *ngIf="error">
        {{ error }}
        <button type="button" class="btn-close" (click)="error = null"></button>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content (only show when not loading) -->
      <ng-container *ngIf="!loading">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-2">Directors Register</h1>
            <p class="text-muted mb-0">Record and manage company directors and their appointments</p>
          </div>
          <div>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddDirectorModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Director</span>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Active Directors</span>
                  <i class="bi bi-people fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getActiveDirectorsCount() }}</h3>
                <small class="text-muted">Currently serving directors</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Executive Directors</span>
                  <i class="bi bi-person-badge fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getExecutiveDirectorsCount() }}</h3>
                <small class="text-muted">Executive & Managing Directors</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Non-Executive Directors</span>
                  <i class="bi bi-person-check fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getNonExecutiveDirectorsCount() }}</h3>
                <small class="text-muted">Independent & Non-Executive Directors</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Average Tenure</span>
                  <i class="bi bi-calendar-check fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getAverageTenure() }}</h3>
                <small class="text-muted">years</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Directors Table -->
        <div class="card mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">Current Directors</h5>
            <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAllDirectors()">
              <i [class]="showAllDirectors ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
              <span>{{ showAllDirectors ? 'Show Active Only' : 'Show All Directors' }}</span>
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">Name</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Company</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Appointed</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Service</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Shareholding</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let director of getFilteredDirectors()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <a href="#" class="text-decoration-none" (click)="viewDirector(director, $event)">
                        {{ getFullName(director) }}
                      </a>
                    </div>
                  </td>
                  <td>{{ director.company?.name }}</td>
                  <td>{{ director.directorType }}</td>
                  <td>{{ formatDate(director.appointmentDate) }}</td>
                  <td>{{ getServiceDuration(director.appointmentDate, director.resignationDate) }}</td>
                  <td>{{ director.shareholding || 'None' }}</td>
                  <td>
                    <span [class]="'badge ' + (director.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                      {{ director.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewDirector(director)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editDirector(director)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" *ngIf="director.status === 'Active'" (click)="markAsResigned(director)" title="Mark as Resigned">
                        <i class="bi bi-person-dash"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="removeDirector(director)" title="Remove">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredDirectors().length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No directors found
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
export class DirectorsComponent implements OnInit, OnDestroy {
  directors: Director[] = [];
  showAllDirectors = false;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private accessibleCompanies: Company[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private directorService: DirectorService,
    private companyService: CompanyService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    // Load accessible companies and their directors
    this.companyService.getAccessibleCompanies().pipe(
      takeUntil(this.destroy$),
      switchMap(companies => {
        this.accessibleCompanies = companies;
        return forkJoin(
          companies.map(company => 
            this.directorService.getDirectors(company.id).pipe(
              map(directors => directors.map(d => ({ ...d, company })))
            )
          )
        );
      }),
      catchError(error => {
        console.error('Error loading directors:', error);
        this.error = 'Failed to load directors. Please try again.';
        return of([]);
      })
    ).subscribe(directorsArrays => {
      this.directors = directorsArrays.flat();
      this.loadActivities();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActivities(): void {
    this.loading = true;
    this.error = null;

    // Load activities for all accessible companies
    forkJoin(
      this.accessibleCompanies.map(company =>
        this.activityService.getActivities(company.id, {
          entityType: 'director',
          limit: 10
        }).pipe(
          catchError(error => {
            console.error('Error loading activities:', error);
            return of({ activities: [], total: 0 } as ActivityResponse);
          })
        )
      )
    ).pipe(
      finalize(() => this.loading = false)
    ).subscribe(activitiesArrays => {
      this.recentActivities = activitiesArrays
        .map(response => response.activities)
        .flat()
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    });
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

  refreshData(): void {
    this.ngOnInit();
  }

  openAddDirectorModal(): void {
    const modalRef = this.modalService.open(CreateDirectorModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.companies = this.accessibleCompanies;

    modalRef.result.then(
      (result: { company: Company; director: Omit<Director, 'id'> }) => {
        this.directorService.createDirector(result.company.id, result.director)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create director. Please try again.';
              console.error('Error creating director:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(director => {
              if (director) {
                this.directors.push({ ...director, company: result.company });
                return this.addActivity(result.company.id, {
                  type: 'appointment',
                  entityType: 'director',
                  entityId: director.id,
                  description: `${this.getFullName(director)} appointed as ${director.directorType}`,
                  user: 'System'
                }).pipe(map(() => director));
              }
              return of(null);
            })
          )
          .subscribe(director => {
            if (director) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  removeDirector(director: Director): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove ${this.getFullName(director)} from the directors register?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.directorService.deleteDirector(director.companyId, director.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove director. Please try again.';
                console.error('Error removing director:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                const index = this.directors.findIndex(d => d.id === director.id);
                if (index !== -1) {
                  this.directors.splice(index, 1);
                  return this.addActivity(director.companyId, {
                    type: 'removal',
                    entityType: 'director',
                    entityId: director.id,
                    description: `${this.getFullName(director)} removed from directors register`,
                    user: 'System'
                  });
                }
                return of(null);
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

  getFullName(director: Director): string {
    return `${director.title} ${director.firstName} ${director.lastName}`;
  }

  markAsResigned(director: Director): void {
    const modalRef = this.modalService.open(ResignDirectorModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.director = {...director};
    
    modalRef.result.then(
      (updatedDirector: Director & { resignationReason: string }) => {
        const resignationDate = updatedDirector.resignationDate || new Date().toISOString();
        this.directorService.resignDirector(director.companyId, director.id, resignationDate)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to resign director. Please try again.';
              console.error('Error resigning director:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              const index = this.directors.findIndex(d => d.id === director.id);
              if (index !== -1) {
                this.directors[index] = { ...result, company: director.company };
                this.addActivity(director.companyId, {
                  type: 'resignation',
                  entityType: 'director',
                  entityId: director.id,
                  description: `${this.getFullName(director)} resigned from position of ${director.directorType}`,
                  user: 'System'
                });
                this.refreshData();
              }
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  getServiceDuration(appointmentDate: string, resignationDate?: string): string {
    const start = new Date(appointmentDate);
    const end = resignationDate ? new Date(resignationDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }

  getActiveDirectorsCount(): number {
    return this.directors.filter(d => d.status === 'Active').length;
  }

  getExecutiveDirectorsCount(): number {
    return this.directors.filter(d => 
      d.status === 'Active' && 
      (d.directorType === 'Executive Director' || d.directorType === 'Managing Director')
    ).length;
  }

  getNonExecutiveDirectorsCount(): number {
    return this.directors.filter(d => 
      d.status === 'Active' && 
      (d.directorType === 'Non-Executive Director' || d.directorType === 'Independent Director')
    ).length;
  }

  getAverageTenure(): string {
    const activeDirectors = this.directors.filter(d => d.status === 'Active');
    if (activeDirectors.length === 0) return '0';

    const totalDays = activeDirectors.reduce((sum, director) => {
      const start = new Date(director.appointmentDate);
      const end = new Date();
      return sum + Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    const averageYears = (totalDays / 365 / activeDirectors.length).toFixed(1);
    return averageYears;
  }

  toggleShowAllDirectors(): void {
    this.showAllDirectors = !this.showAllDirectors;
  }

  getFilteredDirectors(): Director[] {
    return this.showAllDirectors 
      ? this.directors 
      : this.directors.filter(d => d.status === 'Active');
  }

  viewDirector(director: Director, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewDirectorModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.director = {...director};
    
    modalRef.result.then(
      (result: { action: string; director: Director } | undefined) => {
        if (result?.action === 'edit') {
          this.editDirector(result.director);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editDirector(director: Director, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(EditDirectorModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.director = {...director};
    modalRef.componentInstance.companies = this.accessibleCompanies;
    modalRef.componentInstance.mode = 'edit';
    
    modalRef.result.then(
      (updatedDirector: Director) => {
        this.directorService.updateDirector(director.companyId, director.id, updatedDirector)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update director. Please try again.';
              console.error('Error updating director:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                const index = this.directors.findIndex(d => d.id === director.id);
                if (index !== -1) {
                  this.directors[index] = { ...result, company: director.company };
                  return this.addActivity(director.companyId, {
                    type: 'update',
                    entityType: 'director',
                    entityId: director.id,
                    description: `${this.getFullName(director)} details updated`,
                    user: 'System'
                  }).pipe(map(() => result));
                }
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

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'appointment':
        return 'bi bi-person-plus';
      case 'resignation':
        return 'bi bi-person-dash';
      case 'update':
        return 'bi bi-pencil';
      case 'removal':
        return 'bi bi-trash';
      default:
        return 'bi bi-activity';
    }
  }
}
