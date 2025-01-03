import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="alert alert-warning mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ message }}
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" [class]="'btn ' + confirmButtonClass" (click)="activeModal.close(true)">
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Input() confirmButtonText: string = 'Confirm';
  @Input() confirmButtonClass: string = 'btn-primary';

  constructor(public activeModal: NgbActiveModal) {}
}
