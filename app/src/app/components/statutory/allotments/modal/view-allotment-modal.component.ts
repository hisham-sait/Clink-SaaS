import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Allotment } from '../../statutory.types';

@Component({
  selector: 'app-view-allotment-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Allotment Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="row g-3">
        <!-- Basic Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Basic Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Allotment ID</label>
              <div class="form-control-plaintext">{{ allotment.allotmentId }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Allotment Date</label>
              <div class="form-control-plaintext">{{ formatDate(allotment.allotmentDate) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (allotment.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                  {{ allotment.status }}
                </span>
              </div>
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
              <label class="form-label small text-muted">Share Class</label>
              <div class="form-control-plaintext">{{ allotment.shareClass }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Number of Shares</label>
              <div class="form-control-plaintext">{{ allotment.numberOfShares }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Price per Share</label>
              <div class="form-control-plaintext">{{ formatAmount(allotment.pricePerShare, allotment.currency) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Total Amount</label>
              <div class="form-control-plaintext">{{ calculateTotal() }}</div>
            </div>
          </div>
        </div>

        <!-- Allottee Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Allottee Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ allotment.allottee }}</div>
        </div>

        <!-- Payment Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Payment Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Payment Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + getPaymentStatusClass(allotment.paymentStatus)">
                  {{ allotment.paymentStatus }}
                </span>
              </div>
            </div>
            <div class="col-md-4" *ngIf="allotment.amountPaid !== undefined">
              <label class="form-label small text-muted">Amount Paid</label>
              <div class="form-control-plaintext">{{ formatAmount(allotment.amountPaid, allotment.currency) }}</div>
            </div>
            <div class="col-md-4" *ngIf="allotment.paymentDate">
              <label class="form-label small text-muted">Payment Date</label>
              <div class="form-control-plaintext">{{ formatDate(allotment.paymentDate) }}</div>
            </div>
          </div>
        </div>

        <!-- Certificate Details -->
        <div class="col-12" *ngIf="allotment.certificateNumber">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Certificate Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">Certificate Number: {{ allotment.certificateNumber }}</div>
        </div>

        <!-- Notes -->
        <div class="col-12" *ngIf="allotment.notes">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ allotment.notes }}</div>
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
export class ViewAllotmentModalComponent {
  @Input() allotment!: Allotment;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateTotal(): string {
    return this.formatAmount(
      this.allotment.numberOfShares * this.allotment.pricePerShare,
      this.allotment.currency
    );
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

  onEdit(): void {
    this.activeModal.close({ action: 'edit', allotment: this.allotment });
  }
}
