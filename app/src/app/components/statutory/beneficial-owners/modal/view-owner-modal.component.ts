import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
  selector: 'app-view-owner-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Beneficial Owner Details</h5>
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
              <div class="form-control-plaintext">{{ owner.title }} {{ owner.firstName }} {{ owner.lastName }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Date of Birth</label>
              <div class="form-control-plaintext">{{ formatDate(owner.dateOfBirth) }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Nationality</label>
              <div class="form-control-plaintext">{{ owner.nationality }}</div>
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Address</label>
              <div class="form-control-plaintext">{{ owner.address }}</div>
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
              <div class="form-control-plaintext">{{ owner.email }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Phone</label>
              <div class="form-control-plaintext">{{ owner.phone }}</div>
            </div>
          </div>
        </div>

        <!-- Control Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Control Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small text-muted">Nature of Control</label>
              <div class="form-control-plaintext">
                <div class="d-flex flex-wrap gap-2">
                  <span *ngFor="let control of owner.natureOfControl" class="badge text-bg-primary">
                    {{ getControlLabel(control) }}
                  </span>
                  <span *ngIf="owner.natureOfControl.length === 0" class="text-muted">
                    No control types specified
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Ownership Percentage</label>
              <div class="form-control-plaintext">{{ owner.ownershipPercentage }}%</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Registration Date</label>
              <div class="form-control-plaintext">{{ formatDate(owner.registrationDate) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (owner.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                  {{ owner.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="col-12" *ngIf="owner.description">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ owner.description }}</div>
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
export class ViewOwnerModalComponent {
  @Input() owner!: BeneficialOwner;

  controlTypes = [
    { value: 'shares', label: 'Ownership of Shares (>25%)' },
    { value: 'voting', label: 'Voting Rights' },
    { value: 'appointment', label: 'Right to Appoint/Remove Directors' },
    { value: 'influence', label: 'Significant Influence or Control' },
    { value: 'trust', label: 'Trustee of a Trust' },
    { value: 'partnership', label: 'Partner in a Partnership' }
  ];

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getControlLabel(value: string): string {
    const control = this.controlTypes.find(c => c.value === value);
    return control?.label || value;
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', owner: this.owner });
  }
}
