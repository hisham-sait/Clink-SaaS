import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateChargeModalComponent } from './modal/create-charge-modal.component';
import { EditChargeModalComponent } from './modal/edit-charge-modal.component';
import { ViewChargeModalComponent } from './modal/view-charge-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { Charge, Activity } from '../statutory.types';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateChargeModalComponent,
    EditChargeModalComponent,
    ViewChargeModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Charges Register</h1>
          <p class="text-muted mb-0">Record and manage company charges, mortgages and debentures</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddChargeModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Charge</span>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Active Charges</span>
                <i class="bi bi-shield-lock fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getActiveChargesCount() }}</h3>
              <small class="text-muted">Currently active charges</small>
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
              <small class="text-muted">Total value of charges</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Satisfied</span>
                <i class="bi bi-check-circle fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getSatisfiedChargesCount() }}</h3>
              <small class="text-muted">Satisfied charges</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Released</span>
                <i class="bi bi-unlock fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getReleasedChargesCount() }}</h3>
              <small class="text-muted">Released charges</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Charges Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Charges</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Active Only' : 'Show All Charges' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">ID</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Amount</th>
                <th class="text-uppercase small fw-semibold text-secondary">Chargor</th>
                <th class="text-uppercase small fw-semibold text-secondary">Created</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let charge of getFilteredCharges()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-shield-lock text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewCharge(charge, $event)">
                      {{ charge.chargeId }}
                    </a>
                  </div>
                </td>
                <td>{{ charge.chargeType }}</td>
                <td>{{ formatAmount(charge.amount, charge.currency) }}</td>
                <td>{{ charge.chargor }}</td>
                <td>{{ formatDate(charge.dateCreated) }}</td>
                <td>
                  <span [class]="'badge ' + getStatusClass(charge.status)">
                    {{ charge.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewCharge(charge)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editCharge(charge)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeCharge(charge)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredCharges().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No charges found
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
export class ChargesComponent {
  charges: Charge[] = [];
  showAll = false;
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedCharges = localStorage.getItem('charges');
    if (savedCharges) {
      this.charges = JSON.parse(savedCharges);
    }

    const savedActivities = localStorage.getItem('chargeActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddChargeModal(): void {
    const modalRef = this.modalService.open(CreateChargeModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newCharge: Charge) => {
        this.charges.push(newCharge);
        localStorage.setItem('charges', JSON.stringify(this.charges));

        this.addActivity({
          type: 'added',
          description: `New ${newCharge.chargeType} (${newCharge.chargeId}) created for ${this.formatAmount(newCharge.amount, newCharge.currency)}`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  viewCharge(charge: Charge, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewChargeModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.charge = {...charge};
    
    modalRef.result.then(
      (result: { action: string; charge: Charge }) => {
        if (result?.action === 'edit') {
          this.editCharge(result.charge);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editCharge(charge: Charge): void {
    const modalRef = this.modalService.open(EditChargeModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.charge = {...charge};
    
    modalRef.result.then(
      (updatedCharge: Charge) => {
        const index = this.charges.indexOf(charge);
        this.charges[index] = updatedCharge;
        localStorage.setItem('charges', JSON.stringify(this.charges));

        const statusChanged = charge.status !== updatedCharge.status;
        this.addActivity({
          type: statusChanged ? 'status_changed' : 'updated',
          description: statusChanged 
            ? `${updatedCharge.chargeId} status changed to ${updatedCharge.status}`
            : `${updatedCharge.chargeId} details updated`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeCharge(charge: Charge): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove charge ${charge.chargeId}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const index = this.charges.indexOf(charge);
          this.charges.splice(index, 1);
          localStorage.setItem('charges', JSON.stringify(this.charges));

          this.addActivity({
            type: 'removed',
            description: `${charge.chargeId} removed from charges register`,
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

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'text-bg-success';
      case 'Satisfied':
        return 'text-bg-info';
      case 'Released':
        return 'text-bg-secondary';
      default:
        return 'text-bg-secondary';
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  getFilteredCharges(): Charge[] {
    return this.showAll 
      ? this.charges 
      : this.charges.filter(c => c.status === 'Active');
  }

  getActiveChargesCount(): number {
    return this.charges.filter(c => c.status === 'Active').length;
  }

  getSatisfiedChargesCount(): number {
    return this.charges.filter(c => c.status === 'Satisfied').length;
  }

  getReleasedChargesCount(): number {
    return this.charges.filter(c => c.status === 'Released').length;
  }

  getTotalValue(): string {
    const gbpCharges = this.charges.filter(c => c.currency === 'GBP');
    const eurCharges = this.charges.filter(c => c.currency === 'EUR');
    const usdCharges = this.charges.filter(c => c.currency === 'USD');

    const gbpTotal = gbpCharges.reduce((sum, c) => sum + c.amount, 0);
    const eurTotal = eurCharges.reduce((sum, c) => sum + c.amount, 0);
    const usdTotal = usdCharges.reduce((sum, c) => sum + c.amount, 0);

    const parts = [];
    if (gbpTotal > 0) parts.push(`£${gbpTotal}`);
    if (eurTotal > 0) parts.push(`€${eurTotal}`);
    if (usdTotal > 0) parts.push(`$${usdTotal}`);

    return parts.join(' + ') || '£0';
  }

  getActivityIcon(type: string): string {
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

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('chargeActivities', JSON.stringify(this.recentActivities));
  }
}
