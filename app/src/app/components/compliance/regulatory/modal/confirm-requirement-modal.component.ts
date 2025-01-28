import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, RegulatoryStatus } from './../../compliance.types';

@Component({
  selector: 'app-confirm-requirement-modal',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <p [class.mb-0]="!showWarnings">{{ message }}</p>

      <!-- Status Select -->
      <div class="mb-3" *ngIf="showStatusSelect">
        <label class="form-label mt-3">New Status</label>
        <select class="form-select" [(ngModel)]="selectedStatus">
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Superseded">Superseded</option>
          <option value="Repealed">Repealed</option>
        </select>
      </div>

      <!-- Owner Select -->
      <div class="mb-3" *ngIf="showOwnerSelect">
        <label class="form-label mt-3">New Owner</label>
        <select class="form-select" [(ngModel)]="selectedOwner">
          <option value="">Select Owner</option>
          <option *ngFor="let owner of owners" [value]="owner.id">
            {{ owner.name }}
          </option>
        </select>
      </div>

      <!-- Warnings -->
      <div class="mt-3" *ngIf="showWarnings">
        <!-- Active Warning -->
        <div class="alert alert-warning" *ngIf="showActiveWarning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Warning:</strong> This requirement is currently active. Deleting it may impact compliance tracking.
        </div>

        <!-- Dependencies Warning -->
        <div class="alert alert-warning" *ngIf="showDependenciesWarning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Warning:</strong> This action will also affect:
          <ul class="mb-0 mt-2">
            <li *ngIf="(requirement?.obligations ?? []).length > 0">
              {{ requirement?.obligations?.length }} Obligation(s)
            </li>
            <li *ngIf="(requirement?.controls ?? []).length > 0">
              {{ requirement?.controls?.length }} Control(s)
            </li>
            <li *ngIf="(requirement?.documents ?? []).length > 0">
              {{ requirement?.documents?.length }} Document(s)
            </li>
            <li *ngIf="(requirement?.assessments ?? []).length > 0">
              {{ requirement?.assessments?.length }} Assessment(s)
            </li>
          </ul>
        </div>

        <!-- Impact Info -->
        <div class="alert alert-info" *ngIf="showImpactInfo">
          <i class="bi bi-info-circle me-2"></i>
          This action cannot be undone. Please make sure you have backed up any important data.
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button 
        type="button" 
        [class]="'btn btn-' + confirmButtonClass"
        [disabled]="(showStatusSelect && !selectedStatus) || (showOwnerSelect && !selectedOwner)"
        (click)="onConfirm()"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class ConfirmRequirementModalComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmButtonText = 'Confirm';
  @Input() confirmButtonClass = 'primary';
  @Input() requirement?: RegulatoryRequirement;
  @Input() showStatusSelect = false;
  @Input() showOwnerSelect = false;
  @Input() showActiveWarning = false;
  @Input() showDependenciesWarning = false;
  @Input() showImpactInfo = false;
  @Input() owners: { id: string; name: string }[] = [];

  selectedStatus: RegulatoryStatus | '' = '';
  selectedOwner = '';

  constructor(public activeModal: NgbActiveModal) {}

  get showWarnings(): boolean {
    return this.showActiveWarning || this.showDependenciesWarning || this.showImpactInfo;
  }

  onConfirm(): void {
    if (this.showStatusSelect) {
      this.activeModal.close({ status: this.selectedStatus });
    } else if (this.showOwnerSelect) {
      this.activeModal.close({ owner: this.selectedOwner });
    } else {
      this.activeModal.close(true);
    }
  }
}
