import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateShareholderModalComponent } from './modal/create-shareholder-modal.component';
import { EditShareholderModalComponent } from './modal/edit-shareholder-modal.component';
import { ViewShareholderModalComponent } from './modal/view-shareholder-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

interface Shareholder {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  shares: {
    ordinary: number;
    preferential: number;
  };
  dateAcquired: string;
  status: 'Active' | 'Inactive';
}

interface Activity {
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  description: string;
  user: string;
  time: string;
}

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
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Shareholders Register</h1>
          <p class="text-muted mb-0">Record and manage company shareholders and their holdings</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddShareholderModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Shareholder</span>
          </button>
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
                <td>{{ shareholder.shares.ordinary }}</td>
                <td>{{ shareholder.shares.preferential }}</td>
                <td>{{ shareholder.shares.ordinary + shareholder.shares.preferential }}</td>
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
export class ShareholdersComponent {
  shareholders: Shareholder[] = [];
  showAll = false;
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedShareholders = localStorage.getItem('shareholders');
    if (savedShareholders) {
      this.shareholders = JSON.parse(savedShareholders);
    }

    const savedActivities = localStorage.getItem('shareholderActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddShareholderModal(): void {
    const modalRef = this.modalService.open(CreateShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newShareholder: Shareholder) => {
        this.shareholders.push(newShareholder);
        localStorage.setItem('shareholders', JSON.stringify(this.shareholders));

        this.addActivity({
          type: 'added',
          description: `${this.getFullName(newShareholder)} added as shareholder with ${newShareholder.shares.ordinary + newShareholder.shares.preferential} shares`,
          user: 'System',
          time: new Date().toLocaleString()
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
      (result: { action: string; shareholder: Shareholder }) => {
        if (result?.action === 'edit') {
          this.editShareholder(result.shareholder);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editShareholder(shareholder: Shareholder): void {
    const modalRef = this.modalService.open(EditShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.shareholder = {...shareholder};
    
    modalRef.result.then(
      (updatedShareholder: Shareholder) => {
        const index = this.shareholders.indexOf(shareholder);
        this.shareholders[index] = updatedShareholder;
        localStorage.setItem('shareholders', JSON.stringify(this.shareholders));

        this.addActivity({
          type: 'updated',
          description: `${this.getFullName(updatedShareholder)}'s details updated`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeShareholder(shareholder: Shareholder): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove ${this.getFullName(shareholder)} from the shareholders register?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const index = this.shareholders.indexOf(shareholder);
          this.shareholders.splice(index, 1);
          localStorage.setItem('shareholders', JSON.stringify(this.shareholders));

          this.addActivity({
            type: 'removed',
            description: `${this.getFullName(shareholder)} removed from shareholders register`,
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

  getFullName(shareholder: Shareholder): string {
    return `${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
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
    return this.shareholders.reduce((sum, s) => sum + s.shares.ordinary, 0);
  }

  getTotalPreferentialShares(): number {
    return this.shareholders.reduce((sum, s) => sum + s.shares.preferential, 0);
  }

  getTotalShares(): number {
    return this.getTotalOrdinaryShares() + this.getTotalPreferentialShares();
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
    localStorage.setItem('shareholderActivities', JSON.stringify(this.recentActivities));
  }
}
