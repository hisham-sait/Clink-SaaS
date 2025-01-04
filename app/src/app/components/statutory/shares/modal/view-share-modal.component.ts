import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Share } from '../../statutory.types';

@Component({
  selector: 'app-view-share-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Share Class Details</h5>
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
            <div class="col-md-6">
              <label class="form-label small text-muted">Share Class</label>
              <div class="form-control-plaintext">{{ share.class }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Type</label>
              <div class="form-control-plaintext">{{ share.type }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Nominal Value</label>
              <div class="form-control-plaintext">{{ share.nominalValue }} {{ share.currency }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (share.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                  {{ share.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rights & Restrictions -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Rights & Restrictions</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Voting Rights</label>
              <div class="form-control-plaintext">
                <i [class]="share.votingRights ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'"></i>
                {{ share.votingRights ? 'Yes' : 'No' }}
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Dividend Rights</label>
              <div class="form-control-plaintext">
                <i [class]="share.dividendRights ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'"></i>
                {{ share.dividendRights ? 'Yes' : 'No' }}
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Transferable</label>
              <div class="form-control-plaintext">
                <i [class]="share.transferable ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'"></i>
                {{ share.transferable ? 'Yes' : 'No' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Issue Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Issue Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Total Shares Issued</label>
              <div class="form-control-plaintext">{{ share.totalIssued }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Total Value</label>
              <div class="form-control-plaintext">{{ getTotalValue() }} {{ share.currency }}</div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="col-12" *ngIf="share.description">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ share.description }}</div>
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
export class ViewShareModalComponent {
  @Input() share!: Share;

  constructor(public activeModal: NgbActiveModal) {}

  getTotalValue(): number {
    return this.share.nominalValue * this.share.totalIssued;
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', share: this.share });
  }
}
