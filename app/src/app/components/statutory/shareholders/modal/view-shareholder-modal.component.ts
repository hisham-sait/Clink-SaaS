import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
  selector: 'app-view-shareholder-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Shareholder Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="row g-3">
        <!-- Personal Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Personal Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Full Name</label>
              <div class="form-control-plaintext">{{ shareholder.title }} {{ shareholder.firstName }} {{ shareholder.lastName }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Date of Birth</label>
              <div class="form-control-plaintext">{{ formatDate(shareholder.dateOfBirth) }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Nationality</label>
              <div class="form-control-plaintext">{{ shareholder.nationality }}</div>
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Address</label>
              <div class="form-control-plaintext">{{ shareholder.address }}</div>
            </div>
          </div>
        </div>

        <!-- Contact Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Contact Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Email</label>
              <div class="form-control-plaintext">{{ shareholder.email }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Phone</label>
              <div class="form-control-plaintext">{{ shareholder.phone }}</div>
            </div>
          </div>
        </div>

        <!-- Share Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Share Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Ordinary Shares</label>
              <div class="form-control-plaintext">{{ shareholder.shares.ordinary }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Preferential Shares</label>
              <div class="form-control-plaintext">{{ shareholder.shares.preferential }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Total Shares</label>
              <div class="form-control-plaintext">{{ getTotalShares() }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Date Acquired</label>
              <div class="form-control-plaintext">{{ formatDate(shareholder.dateAcquired) }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (shareholder.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                  {{ shareholder.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">
        Edit
      </button>
    </div>
  `
})
export class ViewShareholderModalComponent {
  @Input() shareholder!: Shareholder;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getTotalShares(): number {
    return this.shareholder.shares.ordinary + this.shareholder.shares.preferential;
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', shareholder: this.shareholder });
  }
}
