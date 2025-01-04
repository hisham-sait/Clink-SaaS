import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Director } from '../../statutory.types';

@Component({
  selector: 'app-resign-director-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Director Resignation</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="alert alert-warning mb-4">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Are you sure you want to mark <strong>{{ getFullName(director) }}</strong> as resigned?
      </div>

      <form [formGroup]="resignForm">
        <div class="mb-3">
          <label class="form-label">Resignation Date</label>
          <input type="date" class="form-control" formControlName="resignationDate">
          <div class="invalid-feedback" [class.d-block]="resignForm.get('resignationDate')?.errors?.['required'] && resignForm.get('resignationDate')?.touched">
            Resignation date is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Reason for Resignation</label>
          <textarea class="form-control" rows="3" formControlName="reason" placeholder="Enter reason for resignation"></textarea>
          <div class="invalid-feedback" [class.d-block]="resignForm.get('reason')?.errors?.['required'] && resignForm.get('reason')?.touched">
            Reason is required
          </div>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!resignForm.valid">
        Confirm Resignation
      </button>
    </div>
  `
})
export class ResignDirectorModalComponent {
  @Input() director!: Director;
  resignForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.resignForm = this.fb.group({
      resignationDate: [new Date().toISOString().split('T')[0], Validators.required],
      reason: ['', Validators.required]
    });
  }

  getFullName(director: Director): string {
    return `${director.title} ${director.firstName} ${director.lastName}`;
  }

  onSubmit(): void {
    if (this.resignForm.valid) {
      const resignationDetails = {
        ...this.director,
        status: 'Resigned' as const,
        resignationDate: this.resignForm.value.resignationDate,
        resignationReason: this.resignForm.value.reason
      };
      this.activeModal.close(resignationDetails);
    } else {
      Object.keys(this.resignForm.controls).forEach(key => {
        const control = this.resignForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
