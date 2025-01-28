import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-audit-modal',
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
export class ConfirmAuditModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() detail?: string;
  @Input() icon: string = 'bi-exclamation-triangle-fill';
  @Input() iconClass: string = 'warning';
  @Input() confirmButtonText: string = 'Confirm';
  @Input() confirmButtonClass: string = 'primary';
  @Input() cancelButtonText: string = 'Cancel';

  constructor(public activeModal: NgbActiveModal) {}
}
