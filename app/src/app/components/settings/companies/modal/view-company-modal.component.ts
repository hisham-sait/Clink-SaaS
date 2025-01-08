import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../settings.types';

@Component({
  selector: 'app-view-company-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Company Details</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="text-center mb-4">
        <div class="avatar-placeholder mb-2">
          <i class="bi bi-building fs-1 text-secondary"></i>
        </div>
        <h5 class="mb-1">{{ company.name }}</h5>
        <p class="text-muted mb-0">{{ company.type }}</p>
        <div class="mt-2">
          <span *ngFor="let tag of company.tags" class="badge text-bg-primary me-1">{{ tag }}</span>
        </div>
      </div>

      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Basic Information</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Legal Name</small>
                <span>{{ company.legalName }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Registration Number</small>
                <span>{{ company.registrationNumber }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">VAT Number</small>
                <span>{{ company.vatNumber || 'Not specified' }}</span>
              </div>

              <div class="mb-2">
                <small class="text-muted d-block">Industry</small>
                <span>{{ company.industry }}</span>
              </div>

              <div class="mb-2">
                <small class="text-muted d-block">Size</small>
                <span>{{ company.size }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Contact Information</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Email</small>
                <span>{{ company.email }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Phone</small>
                <span>{{ company.phone }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Website</small>
                <a [href]="company.website" target="_blank" *ngIf="company.website">{{ company.website }}</a>
                <span *ngIf="!company.website">Not specified</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Address</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Street</small>
                <span>{{ company.address.street || 'Not specified' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">City</small>
                <span>{{ company.address.city || 'Not specified' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">State/Province</small>
                <span>{{ company.address.state || 'Not specified' }}</span>
              </div>

              <div class="mb-2">
                <small class="text-muted d-block">Postal Code</small>
                <span>{{ company.address.postalCode || 'Not specified' }}</span>
              </div>

              <div class="mb-2">
                <small class="text-muted d-block">Country</small>
                <span>{{ company.address.country || 'Not specified' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Contact -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Primary Contact</h6>
              
              <div *ngIf="company.primaryContact; else noContact">
                <div class="mb-2">
                  <small class="text-muted d-block">Name</small>
                  <span>{{ company.primaryContact.name }}</span>
                </div>
                
                <div class="mb-2">
                  <small class="text-muted d-block">Email</small>
                  <span>{{ company.primaryContact.email }}</span>
                </div>
                
                <div class="mb-2">
                  <small class="text-muted d-block">Phone</small>
                  <span>{{ company.primaryContact.phone }}</span>
                </div>

                <div class="mb-2">
                  <small class="text-muted d-block">Role</small>
                  <span>{{ company.primaryContact.role }}</span>
                </div>
              </div>
              <ng-template #noContact>
                <div class="text-muted">No primary contact specified</div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Additional Details -->
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Additional Details</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Currency</small>
                <span>{{ company.currency }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Fiscal Year End</small>
                <span>{{ company.fiscalYearEnd | date:'mediumDate' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Created</small>
                <span>{{ company.createdAt | date:'medium' }}</span>
              </div>

              <div class="mb-2">
                <small class="text-muted d-block">Last Updated</small>
                <span>{{ company.updatedAt | date:'medium' }}</span>
              </div>

              <div class="mb-2" *ngIf="company.notes">
                <small class="text-muted d-block">Notes</small>
                <p class="mb-0">{{ company.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">Edit Company</button>
    </div>
  `,
  styles: [`
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 50%;
    }
  `]
})
export class ViewCompanyModalComponent {
  @Input() company!: Company;

  constructor(public activeModal: NgbActiveModal) {}

  onEdit(): void {
    this.activeModal.close({ action: 'edit', company: this.company });
  }
}
