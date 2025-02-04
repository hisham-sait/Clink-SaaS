import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { CreateAllotmentModalComponent } from './modal/create-allotment-modal.component';
import { EditAllotmentModalComponent } from './modal/edit-allotment-modal.component';
import { ViewAllotmentModalComponent } from './modal/view-allotment-modal.component';
import { ImportAllotmentsModalComponent } from './modal/import-allotments-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { AllotmentService } from '../../../services/statutory/allotment.service';
import { CompanyService } from '../../../services/settings/company.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { AuthService } from '../../../services/auth/auth.service';

import { Allotment, Activity, ActivityResponse } from '../statutory.types';

@Component({
  selector: 'app-allotments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateAllotmentModalComponent,
    EditAllotmentModalComponent,
    ViewAllotmentModalComponent,
    ConfirmModalComponent,
    ImportAllotmentsModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Share Allotments Register</h1>
          <p class="text-muted mb-0">Record and track share allotments and transfers</p>
        </div>
        <div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="importAllotments()">
              <i class="bi bi-upload"></i>
              <span>Import</span>
            </button>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddAllotmentModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Allotment</span>
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
                <span class="text-muted">Total Allotments</span>
                <i class="bi bi-diagram-3 fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getActiveAllotmentsCount() }}</h3>
              <small class="text-muted">Active allotments</small>
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
              <small class="text-muted">Shares allotted</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Total Value</span>
                <i class="bi bi-currency-pound fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalValue() }}</h3>
              <small class="text-muted">Value of allotments</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Payment Status</span>
                <i class="bi bi-cash-stack fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getPaidPercentage() }}%</h3>
              <small class="text-muted">Fully paid allotments</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Allotments Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Allotments</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Active Only' : 'Show All Allotments' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">ID</th>
                <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Share Class</th>
                <th class="text-uppercase small fw-semibold text-secondary">Shares</th>
                <th class="text-uppercase small fw-semibold text-secondary">Allottee</th>
                <th class="text-uppercase small fw-semibold text-secondary">Payment</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let allotment of getFilteredAllotments()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-diagram-3 text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewAllotment(allotment, $event)">
                      {{ allotment.id }}
                    </a>
                  </div>
                </td>
                <td>{{ formatDate(allotment.allotmentDate) }}</td>
                <td>{{ allotment.shareClass }}</td>
                <td>{{ allotment.numberOfShares }}</td>
                <td>{{ allotment.allottee }}</td>
                <td>
                  <span [class]="'badge ' + getPaymentStatusClass(allotment.paymentStatus)">
                    {{ allotment.paymentStatus }}
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + (allotment.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                    {{ allotment.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewAllotment(allotment)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editAllotment(allotment)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeAllotment(allotment)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredAllotments().length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No allotments found
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
    </div>
  `
})
export class AllotmentsComponent implements OnInit, OnDestroy {
  allotments: Allotment[] = [];
  showAll = true;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private allotmentService: AllotmentService,
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
    // Get current company's allotments
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
        this.allotmentService.getAllotments(companyId).pipe( // Removed status filter to show all by default
          map(allotments => allotments.map(a => ({ ...a, company })))
        )
      ),
      catchError(error => {
        console.error('Error loading allotments:', error);
        this.error = 'Failed to load allotments. Please try again.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(allotmentsArrays => {
      this.allotments = allotmentsArrays.flat();
      this.loadActivities(companyId);
    });
  }

  private loadActivities(companyId: string): void {
    this.activityService.getActivities(companyId, {
      entityType: 'allotment',
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

  openAddAllotmentModal(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(CreateAllotmentModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newAllotment: Allotment) => {
        this.allotmentService.createAllotment(companyId, newAllotment)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create allotment. Please try again.';
              console.error('Error creating allotment:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(allotment => {
              if (allotment) {
                return this.addActivity(companyId, {
                  type: 'added',
                  entityType: 'allotment',
                  entityId: allotment.id,
                  description: `New allotment ${allotment.id} created for ${allotment.numberOfShares} ${allotment.shareClass}`,
                  user: 'System'
                }).pipe(map(() => allotment));
              }
              return of(null);
            })
          )
          .subscribe(allotment => {
            if (allotment) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewAllotment(allotment: Allotment, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewAllotmentModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.allotment = {...allotment};
    
    modalRef.result.then(
      (result: { action: string; allotment: Allotment } | undefined) => {
        if (result?.action === 'edit') {
          this.editAllotment(result.allotment);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editAllotment(allotment: Allotment): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(EditAllotmentModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.allotment = {...allotment};
    
    modalRef.result.then(
      (updatedAllotment: Allotment) => {
        this.allotmentService.updateAllotment(companyId, allotment.id, updatedAllotment)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update allotment. Please try again.';
              console.error('Error updating allotment:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                const statusChanged = allotment.status !== updatedAllotment.status;
                return this.addActivity(companyId, {
                  type: statusChanged ? 'status_changed' : 'updated',
                  entityType: 'allotment',
                  entityId: allotment.id,
                  description: statusChanged 
                    ? `${allotment.id} status changed to ${updatedAllotment.status}`
                    : `${allotment.id} details updated`,
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

  removeAllotment(allotment: Allotment): void {
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
    modalRef.componentInstance.message = `Are you sure you want to remove allotment ${allotment.id}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.allotmentService.deleteAllotment(companyId, allotment.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove allotment. Please try again.';
                console.error('Error removing allotment:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                return this.addActivity(companyId, {
                  type: 'removed',
                  entityType: 'allotment',
                  entityId: allotment.id,
                  description: `${allotment.id} removed from allotments register`,
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

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getPaymentStatusClass(status: Allotment['paymentStatus']): string {
    switch (status) {
      case 'Paid':
        return 'text-bg-success';
      case 'Partially Paid':
        return 'text-bg-warning';
      case 'Unpaid':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.refreshData();
  }

  getFilteredAllotments(): Allotment[] {
    return this.showAll 
      ? this.allotments 
      : this.allotments.filter(a => a.status === 'Active');
  }

  getActiveAllotmentsCount(): number {
    return this.allotments.filter(a => a.status === 'Active').length;
  }

  getTotalShares(): number {
    return this.allotments
      .filter(a => a.status === 'Active')
      .reduce((sum, a) => sum + a.numberOfShares, 0);
  }

  getTotalValue(): string {
    const gbpAllotments = this.allotments.filter(a => a.currency === 'GBP' && a.status === 'Active');
    const eurAllotments = this.allotments.filter(a => a.currency === 'EUR' && a.status === 'Active');
    const usdAllotments = this.allotments.filter(a => a.currency === 'USD' && a.status === 'Active');

    const gbpTotal = gbpAllotments.reduce((sum, a) => sum + (a.numberOfShares * a.pricePerShare), 0);
    const eurTotal = eurAllotments.reduce((sum, a) => sum + (a.numberOfShares * a.pricePerShare), 0);
    const usdTotal = usdAllotments.reduce((sum, a) => sum + (a.numberOfShares * a.pricePerShare), 0);

    const parts = [];
    if (gbpTotal > 0) parts.push(`£${gbpTotal}`);
    if (eurTotal > 0) parts.push(`€${eurTotal}`);
    if (usdTotal > 0) parts.push(`$${usdTotal}`);

    return parts.join(' + ') || '£0';
  }

  getPaidPercentage(): number {
    const activeAllotments = this.allotments.filter(a => a.status === 'Active');
    if (activeAllotments.length === 0) return 0;

    const paidAllotments = activeAllotments.filter(a => a.paymentStatus === 'Paid');
    return Math.round((paidAllotments.length / activeAllotments.length) * 100);
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

  importAllotments(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(ImportAllotmentsModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.companyId = companyId;

    modalRef.result.then(
      (result: { imported: number }) => {
        if (result) {
          this.addActivity(companyId, {
            type: 'imported',
            entityType: 'allotment',
            entityId: 'bulk',
            description: `Imported ${result.imported} allotments`,
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
