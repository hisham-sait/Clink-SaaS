import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Charge } from '../../statutory.types';

@Component({
  selector: 'app-view-charge-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Charge Details</h5>
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
              <label class="form-label small text-muted">Charge ID</label>
              <div class="form-control-plaintext">{{ charge.chargeId }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Type</label>
              <div class="form-control-plaintext">{{ charge.chargeType }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + getStatusClass(charge.status)">
                  {{ charge.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Amount Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Amount</label>
              <div class="form-control-plaintext">{{ formatAmount(charge.amount, charge.currency) }}</div>
            </div>
          </div>
        </div>

        <!-- Party Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Party Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Chargor</label>
              <div class="form-control-plaintext">{{ charge.chargor }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Chargee</label>
              <div class="form-control-plaintext">{{ charge.chargee }}</div>
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Property Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ charge.propertyCharged }}</div>
        </div>

        <!-- Dates -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Important Dates</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Date Created</label>
              <div class="form-control-plaintext">{{ formatDate(charge.dateCreated) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Registration Date</label>
              <div class="form-control-plaintext">{{ formatDate(charge.registrationDate) }}</div>
            </div>
            <div class="col-md-4" *ngIf="charge.satisfactionDate">
              <label class="form-label small text-muted">Satisfaction Date</label>
              <div class="form-control-plaintext">{{ formatDate(charge.satisfactionDate) }}</div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="col-12" *ngIf="charge.description">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ charge.description }}</div>
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
export class ViewChargeModalComponent {
  @Input() charge!: Charge;

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

  onEdit(): void {
    this.activeModal.close({ action: 'edit', charge: this.charge });
  }
}
