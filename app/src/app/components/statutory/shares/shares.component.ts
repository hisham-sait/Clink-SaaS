import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateShareModalComponent } from './modal/create-share-modal.component';
import { EditShareModalComponent } from './modal/edit-share-modal.component';
import { ViewShareModalComponent } from './modal/view-share-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { Share, Activity } from '../statutory.types';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateShareModalComponent,
    EditShareModalComponent,
    ViewShareModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Share Register</h1>
          <p class="text-muted mb-0">Manage and track company share classes and their details</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddShareModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Share Class</span>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Share Classes</span>
                <i class="bi bi-diagram-3 fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getActiveShareClasses().length }}</h3>
              <small class="text-muted">Active share classes</small>
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
              <small class="text-muted">Total shares issued</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Share Value</span>
                <i class="bi bi-currency-pound fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalValue() }}</h3>
              <small class="text-muted">Total nominal value</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Voting Shares</span>
                <i class="bi bi-check-circle fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getVotingShares() }}</h3>
              <small class="text-muted">Shares with voting rights</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Classes Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Share Classes</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Active Only' : 'Show All Classes' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Class</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Nominal Value</th>
                <th class="text-uppercase small fw-semibold text-secondary">Total Issued</th>
                <th class="text-uppercase small fw-semibold text-secondary">Rights</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let share of getFilteredShares()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-diagram-3 text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewShare(share, $event)">
                      {{ share.class }}
                    </a>
                  </div>
                </td>
                <td>{{ share.type }}</td>
                <td>{{ share.nominalValue }} {{ share.currency }}</td>
                <td>{{ share.totalIssued }}</td>
                <td>
                  <div class="d-flex gap-2">
                    <span class="badge" [class.text-bg-success]="share.votingRights" [class.text-bg-secondary]="!share.votingRights">
                      <i class="bi" [class.bi-check-lg]="share.votingRights" [class.bi-x-lg]="!share.votingRights"></i>
                      Voting
                    </span>
                    <span class="badge" [class.text-bg-success]="share.dividendRights" [class.text-bg-secondary]="!share.dividendRights">
                      <i class="bi" [class.bi-check-lg]="share.dividendRights" [class.bi-x-lg]="!share.dividendRights"></i>
                      Dividend
                    </span>
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + (share.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                    {{ share.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewShare(share)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editShare(share)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeShare(share)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredShares().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No share classes found
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
export class SharesComponent {
  shares: Share[] = [];
  showAll = false;
  recentActivities: Activity[] = [];
  private companyId: string = '1'; // This should be injected or retrieved from a service

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedShares = localStorage.getItem('shares');
    if (savedShares) {
      this.shares = JSON.parse(savedShares);
    }

    const savedActivities = localStorage.getItem('shareActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddShareModal(): void {
    const modalRef = this.modalService.open(CreateShareModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newShare: Share) => {
        this.shares.push(newShare);
        localStorage.setItem('shares', JSON.stringify(this.shares));

        this.addActivity({
          id: crypto.randomUUID(),
          type: 'added',
          entityType: 'share',
          entityId: newShare.class,
          description: `${newShare.class} share class added with ${newShare.totalIssued} shares`,
          user: 'System',
          time: new Date().toLocaleString(),
          companyId: this.companyId
        });
      },
      () => {} // Modal dismissed
    );
  }

  viewShare(share: Share, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewShareModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.share = {...share};
    
    modalRef.result.then(
      (result: { action: string; share: Share } | undefined) => {
        if (result?.action === 'edit') {
          this.editShare(result.share);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editShare(share: Share): void {
    const modalRef = this.modalService.open(EditShareModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.share = {...share};
    
    modalRef.result.then(
      (updatedShare: Share) => {
        const index = this.shares.findIndex(s => s.class === share.class);
        if (index !== -1) {
          this.shares[index] = updatedShare;
          localStorage.setItem('shares', JSON.stringify(this.shares));

          this.addActivity({
            id: crypto.randomUUID(),
            type: 'updated',
            entityType: 'share',
            entityId: updatedShare.class,
            description: `${updatedShare.class} share class details updated`,
            user: 'System',
            time: new Date().toLocaleString(),
            companyId: this.companyId
          });
        }
      },
      () => {} // Modal dismissed
    );
  }

  removeShare(share: Share): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove ${share.class} share class?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          const index = this.shares.findIndex(s => s.class === share.class);
          if (index !== -1) {
            this.shares.splice(index, 1);
            localStorage.setItem('shares', JSON.stringify(this.shares));

            this.addActivity({
              id: crypto.randomUUID(),
              type: 'removed',
              entityType: 'share',
              entityId: share.class,
              description: `${share.class} share class removed`,
              user: 'System',
              time: new Date().toLocaleString(),
              companyId: this.companyId
            });
          }
        }
      },
      () => {} // Modal dismissed
    );
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  getFilteredShares(): Share[] {
    return this.showAll 
      ? this.shares 
      : this.shares.filter(s => s.status === 'Active');
  }

  getActiveShareClasses(): Share[] {
    return this.shares.filter(s => s.status === 'Active');
  }

  getTotalShares(): number {
    return this.shares.reduce((sum, s) => sum + s.totalIssued, 0);
  }

  getTotalValue(): string {
    const gbpShares = this.shares.filter(s => s.currency === 'GBP');
    const eurShares = this.shares.filter(s => s.currency === 'EUR');
    const usdShares = this.shares.filter(s => s.currency === 'USD');

    const gbpTotal = gbpShares.reduce((sum, s) => sum + (s.nominalValue * s.totalIssued), 0);
    const eurTotal = eurShares.reduce((sum, s) => sum + (s.nominalValue * s.totalIssued), 0);
    const usdTotal = usdShares.reduce((sum, s) => sum + (s.nominalValue * s.totalIssued), 0);

    const parts = [];
    if (gbpTotal > 0) parts.push(`£${gbpTotal}`);
    if (eurTotal > 0) parts.push(`€${eurTotal}`);
    if (usdTotal > 0) parts.push(`$${usdTotal}`);

    return parts.join(' + ') || '£0';
  }

  getVotingShares(): number {
    return this.shares
      .filter(s => s.status === 'Active' && s.votingRights)
      .reduce((sum, s) => sum + s.totalIssued, 0);
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

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('shareActivities', JSON.stringify(this.recentActivities));
  }
}
