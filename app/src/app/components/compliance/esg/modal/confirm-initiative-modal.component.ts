import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-initiative-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="d-flex gap-3 align-items-start">
        <i [class]="'bi ' + icon + ' fs-4 text-' + iconClass"></i>
        <div>
          <p class="mb-0">{{ message }}</p>
          <small class="text-muted" *ngIf="detail">{{ detail }}</small>
        </div>
      </div>

      <!-- Additional Warning for Active Initiatives -->
      <div class="alert alert-warning mt-3" *ngIf="showActiveWarning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>This initiative is currently active. Removing it may affect ongoing ESG compliance efforts and reporting.</span>
      </div>

      <!-- Budget Warning -->
      <div class="alert alert-warning mt-3" *ngIf="showBudgetWarning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>This initiative has an allocated budget and expenses. Removing it will affect financial reporting and budget tracking.</span>
      </div>

      <!-- Impact Information -->
      <div class="alert alert-info mt-3" *ngIf="showImpactInfo">
        <i class="bi bi-info-circle-fill me-2"></i>
        <span>This action will also remove:</span>
        <ul class="mb-0 mt-2">
          <li>Progress tracking and milestones</li>
          <li>Associated stakeholder records</li>
          <li>Budget and expense records</li>
          <li>Related documentation and reports</li>
          <li>Links to associated ESG metrics</li>
        </ul>
      </div>

      <!-- Compliance Impact -->
      <div class="alert alert-danger mt-3" *ngIf="showComplianceImpact">
        <i class="bi bi-shield-exclamation me-2"></i>
        <span>This initiative contributes to regulatory compliance requirements. Removing it may:</span>
        <ul class="mb-0 mt-2">
          <li>Affect compliance status reporting</li>
          <li>Impact ESG performance metrics</li>
          <li>Require updates to compliance documentation</li>
        </ul>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">
        {{ cancelButtonText }}
      </button>
      <button 
        type="button" 
        [class]="'btn btn-' + confirmButtonClass"
        (click)="activeModal.close(true)"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class ConfirmInitiativeModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() detail?: string;
  @Input() icon: string = 'bi-exclamation-triangle-fill';
  @Input() iconClass: string = 'warning';
  @Input() confirmButtonText: string = 'Confirm';
  @Input() confirmButtonClass: string = 'primary';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showActiveWarning: boolean = false;
  @Input() showBudgetWarning: boolean = false;
  @Input() showImpactInfo: boolean = false;
  @Input() showComplianceImpact: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}
}
