import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateOwnerModalComponent } from './modal/create-owner-modal.component';
import { EditOwnerModalComponent } from './modal/edit-owner-modal.component';
import { ViewOwnerModalComponent } from './modal/view-owner-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

interface BeneficialOwner {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  natureOfControl: string[];
  ownershipPercentage: number;
  registrationDate: string;
  status: 'Active' | 'Inactive';
  description?: string;
}

interface Activity {
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  description: string;
  user: string;
  time: string;
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
    ConfirmModalComponent
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
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddOwnerModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Beneficial Owner</span>
          </button>
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
          <button class="btn btn-link p-0 text-decoration-none">
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
export class BeneficialOwnersComponent {
  owners: BeneficialOwner[] = [];
  showAll = false;
  recentActivities: Activity[] = [];

  controlTypes = [
    { value: 'shares', label: 'Shares' },
    { value: 'voting', label: 'Voting' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'influence', label: 'Influence' },
    { value: 'trust', label: 'Trust' },
    { value: 'partnership', label: 'Partnership' }
  ];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedOwners = localStorage.getItem('beneficialOwners');
    if (savedOwners) {
      this.owners = JSON.parse(savedOwners);
    }

    const savedActivities = localStorage.getItem('beneficialOwnerActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddOwnerModal(): void {
    const modalRef = this.modalService.open(CreateOwnerModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newOwner: BeneficialOwner) => {
        this.owners.push(newOwner);
        localStorage.setItem('beneficialOwners', JSON.stringify(this.owners));

        this.addActivity({
          type: 'added',
          description: `${this.getFullName(newOwner)} added as beneficial owner with ${newOwner.ownershipPercentage}% ownership`,
          user: 'System',
          time: new Date().toLocaleString()
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
      (result: { action: string; owner: BeneficialOwner }) => {
        if (result?.action === 'edit') {
          this.editOwner(result.owner);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editOwner(owner: BeneficialOwner): void {
    const modalRef = this.modalService.open(EditOwnerModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.owner = {...owner};
    
    modalRef.result.then(
      (updatedOwner: BeneficialOwner) => {
        const index = this.owners.indexOf(owner);
        this.owners[index] = updatedOwner;
        localStorage.setItem('beneficialOwners', JSON.stringify(this.owners));

        this.addActivity({
          type: 'updated',
          description: `${this.getFullName(updatedOwner)}'s details updated`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeOwner(owner: BeneficialOwner): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove ${this.getFullName(owner)} from the beneficial owners register?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const index = this.owners.indexOf(owner);
          this.owners.splice(index, 1);
          localStorage.setItem('beneficialOwners', JSON.stringify(this.owners));

          this.addActivity({
            type: 'removed',
            description: `${this.getFullName(owner)} removed from beneficial owners register`,
            user: 'System',
            time: new Date().toLocaleString()
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
    const control = this.controlTypes.find(c => c.value === value);
    return control?.label || value;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
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

  getActivityIcon(type: string): string {
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

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('beneficialOwnerActivities', JSON.stringify(this.recentActivities));
  }
}
