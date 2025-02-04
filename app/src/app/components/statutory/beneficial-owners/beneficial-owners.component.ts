import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap, map } from 'rxjs/operators';

import { CreateOwnerModalComponent } from './modal/create-owner-modal.component';
import { EditOwnerModalComponent } from './modal/edit-owner-modal.component';
import { ViewOwnerModalComponent } from './modal/view-owner-modal.component';
import { ImportBeneficialOwnersModalComponent } from './modal/import-beneficial-owners-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { BeneficialOwnerService } from '../../../services/statutory/beneficial-owner.service';
import { CompanyService } from '../../../services/settings/company.service';
import { ActivityService } from '../../../services/statutory/activity.service';
import { AuthService } from '../../../services/auth/auth.service';

import { BeneficialOwner, Activity, ActivityResponse } from '../statutory.types';

type ControlValue = 'shares' | 'voting' | 'appointment' | 'influence' | 'trust' | 'partnership';

interface ControlType {
  value: ControlValue;
  label: string;
}

@Component({
  selector: 'app-beneficial-owners',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateOwnerModalComponent,
    EditOwnerModalComponent,
    ViewOwnerModalComponent,
    ConfirmModalComponent,
    ImportBeneficialOwnersModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Beneficial Owners Register</h1>
          <p class="text-muted mb-0">Record and manage company beneficial owners and their control details</p>
        </div>
        <div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="importOwners()">
              <i class="bi bi-upload"></i>
              <span>Import</span>
            </button>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddOwnerModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Beneficial Owner</span>
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
                <span class="text-muted">Active Owners</span>
                <i class="bi bi-people fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getActiveOwnersCount() }}</h3>
              <small class="text-muted">Currently registered owners</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Significant Control</span>
                <i class="bi bi-diagram-3 fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getSignificantControlCount() }}</h3>
              <small class="text-muted">Owners with >25% shares</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Voting Rights</span>
                <i class="bi bi-check-circle fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getVotingRightsCount() }}</h3>
              <small class="text-muted">Owners with voting rights</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Average Ownership</span>
                <i class="bi bi-pie-chart fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getAverageOwnership() }}%</h3>
              <small class="text-muted">Average ownership percentage</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Owners Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Beneficial Owners</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Active Only' : 'Show All Owners' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Name</th>
                <th class="text-uppercase small fw-semibold text-secondary">Control Types</th>
                <th class="text-uppercase small fw-semibold text-secondary">Ownership</th>
                <th class="text-uppercase small fw-semibold text-secondary">Registered</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let owner of getFilteredOwners()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewOwner(owner, $event)">
                      {{ getFullName(owner) }}
                    </a>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let control of owner.natureOfControl" class="badge text-bg-primary">
                      {{ getControlLabel(control) }}
                    </span>
                  </div>
                </td>
                <td>{{ owner.ownershipPercentage }}%</td>
                <td>{{ formatDate(owner.registrationDate) }}</td>
                <td>
                  <span [class]="'badge ' + (owner.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                    {{ owner.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewOwner(owner)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editOwner(owner)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeOwner(owner)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredOwners().length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No beneficial owners found
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
export class BeneficialOwnersComponent implements OnInit, OnDestroy {
  owners: BeneficialOwner[] = [];
  showAll = true;
  recentActivities: Activity[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  controlTypes: ControlType[] = [
    { value: 'shares', label: 'Shares' },
    { value: 'voting', label: 'Voting' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'influence', label: 'Influence' },
    { value: 'trust', label: 'Trust' },
    { value: 'partnership', label: 'Partnership' }
  ];

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private beneficialOwnerService: BeneficialOwnerService,
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
    // Get current company's beneficial owners
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
        this.beneficialOwnerService.getBeneficialOwners(companyId).pipe( // Removed status filter to show all by default
          map(owners => owners.map(o => ({ ...o, company })))
        )
      ),
      catchError(error => {
        console.error('Error loading beneficial owners:', error);
        this.error = 'Failed to load beneficial owners. Please try again.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(ownersArrays => {
      this.owners = ownersArrays.flat();
      this.loadActivities(companyId);
    });
  }

  private loadActivities(companyId: string): void {
    this.activityService.getActivities(companyId, {
      entityType: 'beneficial-owner',
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

  openAddOwnerModal(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(CreateOwnerModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newOwner: BeneficialOwner) => {
        this.beneficialOwnerService.createBeneficialOwner(companyId, newOwner)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create beneficial owner. Please try again.';
              console.error('Error creating beneficial owner:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(owner => {
              if (owner) {
                return this.addActivity(companyId, {
                  type: 'added',
                  entityType: 'beneficial-owner',
                  entityId: owner.id,
                  description: `${this.getFullName(owner)} added as beneficial owner with ${owner.ownershipPercentage}% ownership`,
                  user: 'System'
                }).pipe(map(() => owner));
              }
              return of(null);
            })
          )
          .subscribe(owner => {
            if (owner) {
              this.refreshData();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewOwner(owner: BeneficialOwner, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewOwnerModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.owner = {...owner};
    
    modalRef.result.then(
      (result: { action: string; owner: BeneficialOwner } | undefined) => {
        if (result?.action === 'edit') {
          this.editOwner(result.owner);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editOwner(owner: BeneficialOwner): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(EditOwnerModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.owner = {...owner};
    
    modalRef.result.then(
      (updatedOwner: BeneficialOwner) => {
        this.beneficialOwnerService.updateBeneficialOwner(companyId, owner.id, updatedOwner)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update beneficial owner. Please try again.';
              console.error('Error updating beneficial owner:', error);
              this.error = errorMsg;
              return of(null);
            }),
            switchMap(result => {
              if (result) {
                return this.addActivity(companyId, {
                  type: 'updated',
                  entityType: 'beneficial-owner',
                  entityId: owner.id,
                  description: `${this.getFullName(owner)}'s details updated`,
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

  removeOwner(owner: BeneficialOwner): void {
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
    modalRef.componentInstance.message = `Are you sure you want to remove ${this.getFullName(owner)} from the beneficial owners register?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          this.beneficialOwnerService.deleteBeneficialOwner(companyId, owner.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to remove beneficial owner. Please try again.';
                console.error('Error removing beneficial owner:', error);
                this.error = errorMsg;
                return of(null);
              }),
              switchMap(() => {
                return this.addActivity(companyId, {
                  type: 'removed',
                  entityType: 'beneficial-owner',
                  entityId: owner.id,
                  description: `${this.getFullName(owner)} removed from beneficial owners register`,
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

  getFullName(owner: BeneficialOwner): string {
    return `${owner.title} ${owner.firstName} ${owner.lastName}`;
  }

  getControlLabel(value: string): string {
    const control = this.controlTypes.find(c => c.value === value as ControlValue);
    return control?.label || value;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.refreshData();
  }

  getFilteredOwners(): BeneficialOwner[] {
    return this.showAll 
      ? this.owners 
      : this.owners.filter(o => o.status === 'Active');
  }

  getActiveOwnersCount(): number {
    return this.owners.filter(o => o.status === 'Active').length;
  }

  getSignificantControlCount(): number {
    return this.owners.filter(o => 
      o.status === 'Active' && o.ownershipPercentage > 25
    ).length;
  }

  getVotingRightsCount(): number {
    return this.owners.filter(o => 
      o.status === 'Active' && o.natureOfControl.includes('voting')
    ).length;
  }

  getAverageOwnership(): string {
    const activeOwners = this.owners.filter(o => o.status === 'Active');
    if (activeOwners.length === 0) return '0';

    const totalPercentage = activeOwners.reduce((sum, o) => sum + o.ownershipPercentage, 0);
    return (totalPercentage / activeOwners.length).toFixed(1);
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

  importOwners(): void {
    const user = this.authService.currentUserValue;
    const companyId = user?.companyId;
    if (!companyId) {
      this.error = 'No company selected';
      return;
    }

    const modalRef = this.modalService.open(ImportBeneficialOwnersModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.companyId = companyId;

    modalRef.result.then(
      (result: { imported: number }) => {
        if (result) {
          this.addActivity(companyId, {
            type: 'imported',
            entityType: 'beneficial-owner',
            entityId: 'bulk',
            description: `Imported ${result.imported} beneficial owners`,
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
