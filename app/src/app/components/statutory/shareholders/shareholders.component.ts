import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { CreateShareholderModalComponent } from './modal/create-shareholder-modal.component';
import { EditShareholderModalComponent } from './modal/edit-shareholder-modal.component';
import { ViewShareholderModalComponent } from './modal/view-shareholder-modal.component';
import { ImportShareholdersModalComponent } from './modal/import-shareholders-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { ShareholderService } from '../../../services/statutory/shareholder.service';
import { CompanyService } from '../../../services/settings/company.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { AuthService } from '../../../services/auth/auth.service';

import { Shareholder, Activity, ActivityResponse } from '../statutory.types';

@Component({
  selector: 'app-shareholders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateShareholderModalComponent,
    EditShareholderModalComponent,
    ViewShareholderModalComponent,
    ConfirmModalComponent,
    ImportShareholdersModalComponent
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
          <h1 class="h3 mb-2">Shareholders Register</h1>
          <p class="text-muted mb-0">Record and manage company shareholders and their holdings</p>
        </div>
        <div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="importShareholders()">
              <i class="bi bi-upload"></i>
              <span>Import</span>
            </button>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddShareholderModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Shareholder</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Active Shareholders</span>
                <i class="bi bi-people fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getActiveShareholders().length }}</h3>
              <small class="text-muted">Currently holding shares</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Ordinary Shares</span>
                <i class="bi bi-diagram-3 fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalOrdinaryShares() }}</h3>
              <small class="text-muted">Total ordinary shares issued</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Preferential Shares</span>
                <i class="bi bi-diagram-2 fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalPreferentialShares() }}</h3>
              <small class="text-muted">Total preferential shares issued</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Total Shares</span>
                <i class="bi bi-pie-chart fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalShares() }}</h3>
              <small class="text-muted">Combined total shares</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Shareholders Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Current Shareholders</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Active Only' : 'Show All Shareholders' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Name</th>
                <th class="text-uppercase small fw-semibold text-secondary">Ordinary Shares</th>
                <th class="text-uppercase small fw-semibold text-secondary">Preferential Shares</th>
                <th class="text-uppercase small fw-semibold text-secondary">Total Shares</th>
                <th class="text-uppercase small fw-semibold text-secondary">Date Acquired</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let shareholder of getFilteredShareholders()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewShareholder(shareholder, $event)">
                      {{ getFullName(shareholder) }}
                    </a>
                  </div>
                </td>
                <td>{{ shareholder.shares?.ordinary || 0 }}</td>
                <td>{{ shareholder.shares?.preferential || 0 }}</td>
                <td>{{ (shareholder.shares?.ordinary || 0) + (shareholder.shares?.preferential || 0) }}</td>
                <td>{{ formatDate(shareholder.dateAcquired) }}</td>
                <td>
                  <span [class]="'badge ' + (shareholder.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                    {{ shareholder.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewShareholder(shareholder)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editShareholder(shareholder)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeShareholder(shareholder)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredShareholders().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No shareholders found
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
            <ng-container *ngFor="let activity of recentActivities">
              <div class="list-group-item px-0">
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
            </ng-container>
            <div class="text-center py-4 text-muted" *ngIf="recentActivities.length === 0">
              <i class="bi bi-info-circle me-2"></i>
              No recent activities
            </div>
          </div>
        </div>
      </div>
  `
})
export class ShareholdersComponent implements OnInit, OnDestroy {
  shareholders: Shareholder[] = [];
  showAll = true;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private shareholderService: ShareholderService,
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
    // Get current company's shareholders
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
        this.shareholderService.getShareholders(companyId).pipe( // Removed status filter to show all by default
          map(shareholders => shareholders.map(s => ({ ...s, company })))
        )
      ),
      catchError(error => {
        console.error('Error loading shareholders:', error);
        this.error = 'Failed to load shareholders. Please try again.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(shareholdersArrays => {
      this.shareholders = shareholdersArrays.flat();
      this.loadActivities(companyId);
    });
  }

  private loadActivities(companyId: string): void {
    this.activityService.getActivities(companyId, {
      entityType: 'shareholder',
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

  openAddShareholderModal(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(CreateShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newShareholder: Shareholder) => {
        this.shareholderService.createShareholder(companyId, newShareholder)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create shareholder. Please try again.';
              console.error('Error creating shareholder:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(shareholder => {
              if (shareholder) {
                return this.addActivity(companyId, {
                  type: 'added',
                  entityType: 'shareholder',
                  entityId: shareholder.id,
                  description: `${this.getFullName(shareholder)} added as shareholder with ${shareholder.shares.ordinary + shareholder.shares.preferential} shares`,
                  user: 'System'
                }).pipe(map(() => shareholder));
              }
              return of(null);
            })
          )
          .subscribe(shareholder => {
            if (shareholder) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewShareholder(shareholder: Shareholder, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.shareholder = {...shareholder};
    
    modalRef.result.then(
      (result: { action: string; shareholder: Shareholder } | undefined) => {
        if (result?.action === 'edit') {
          this.editShareholder(result.shareholder);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editShareholder(shareholder: Shareholder): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(EditShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.shareholder = {...shareholder};
    
    modalRef.result.then(
      (updatedShareholder: Shareholder) => {
        this.shareholderService.updateShareholder(companyId, shareholder.id, updatedShareholder)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update shareholder. Please try again.';
              console.error('Error updating shareholder:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                return this.addActivity(companyId, {
                  type: 'updated',
                  entityType: 'shareholder',
                  entityId: shareholder.id,
                  description: `${this.getFullName(shareholder)}'s details updated`,
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

  removeShareholder(shareholder: Shareholder): void {
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
    modalRef.componentInstance.message = `Are you sure you want to remove ${this.getFullName(shareholder)} from the shareholders register?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.shareholderService.deleteShareholder(companyId, shareholder.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove shareholder. Please try again.';
                console.error('Error removing shareholder:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                return this.addActivity(companyId, {
                  type: 'removed',
                  entityType: 'shareholder',
                  entityId: shareholder.id,
                  description: `${this.getFullName(shareholder)} removed from shareholders register`,
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

  getFullName(shareholder: Shareholder): string {
    return `${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.refreshData();
  }

  getFilteredShareholders(): Shareholder[] {
    return this.showAll 
      ? this.shareholders 
      : this.shareholders.filter(s => s.status === 'Active');
  }

  getActiveShareholders(): Shareholder[] {
    return this.shareholders.filter(s => s.status === 'Active');
  }

  getTotalOrdinaryShares(): number {
    return this.shareholders.reduce((sum, s) => sum + (s.shares?.ordinary || 0), 0);
  }

  getTotalPreferentialShares(): number {
    return this.shareholders.reduce((sum, s) => sum + (s.shares?.preferential || 0), 0);
  }

  getTotalShares(): number {
    return this.getTotalOrdinaryShares() + this.getTotalPreferentialShares();
  }

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'added':
        return 'bi bi-person-plus';
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

  importShareholders(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(ImportShareholdersModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.companyId = companyId;

    modalRef.result.then(
      (result: { imported: number }) => {
        if (result) {
          this.addActivity(companyId, {
            type: 'imported',
            entityType: 'shareholder',
            entityId: 'bulk',
            description: `Imported ${result.imported} shareholders`,
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
