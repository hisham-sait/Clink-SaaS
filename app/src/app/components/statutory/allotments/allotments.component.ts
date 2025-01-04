import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateAllotmentModalComponent } from './modal/create-allotment-modal.component';
import { EditAllotmentModalComponent } from './modal/edit-allotment-modal.component';
import { ViewAllotmentModalComponent } from './modal/view-allotment-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { Allotment, Activity } from '../statutory.types';

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
    ConfirmModalComponent
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
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddAllotmentModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Allotment</span>
          </button>
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
                      {{ allotment.allotmentId }}
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
export class AllotmentsComponent {
  allotments: Allotment[] = [];
  showAll = false;
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedAllotments = localStorage.getItem('allotments');
    if (savedAllotments) {
      this.allotments = JSON.parse(savedAllotments);
    }

    const savedActivities = localStorage.getItem('allotmentActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddAllotmentModal(): void {
    const modalRef = this.modalService.open(CreateAllotmentModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newAllotment: Allotment) => {
        this.allotments.push(newAllotment);
        localStorage.setItem('allotments', JSON.stringify(this.allotments));

        this.addActivity({
          type: 'added',
          description: `New allotment ${newAllotment.allotmentId} created for ${newAllotment.numberOfShares} ${newAllotment.shareClass}`,
          user: 'System',
          time: new Date().toLocaleString()
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
      (result: { action: string; allotment: Allotment }) => {
        if (result?.action === 'edit') {
          this.editAllotment(result.allotment);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editAllotment(allotment: Allotment): void {
    const modalRef = this.modalService.open(EditAllotmentModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.allotment = {...allotment};
    
    modalRef.result.then(
      (updatedAllotment: Allotment) => {
        const index = this.allotments.indexOf(allotment);
        this.allotments[index] = updatedAllotment;
        localStorage.setItem('allotments', JSON.stringify(this.allotments));

        const statusChanged = allotment.status !== updatedAllotment.status;
        this.addActivity({
          type: statusChanged ? 'status_changed' : 'updated',
          description: statusChanged 
            ? `${updatedAllotment.allotmentId} status changed to ${updatedAllotment.status}`
            : `${updatedAllotment.allotmentId} details updated`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeAllotment(allotment: Allotment): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove allotment ${allotment.allotmentId}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const index = this.allotments.indexOf(allotment);
          this.allotments.splice(index, 1);
          localStorage.setItem('allotments', JSON.stringify(this.allotments));

          this.addActivity({
            type: 'removed',
            description: `${allotment.allotmentId} removed from allotments register`,
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

  getPaymentStatusClass(status: string): string {
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
    localStorage.setItem('allotmentActivities', JSON.stringify(this.recentActivities));
  }
}
