import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Share } from '../../statutory.types';

@Component({
  selector: 'app-create-share-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New Share Class</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="shareForm" class="row g-3">
        <!-- Basic Details -->
        <div class="col-md-6">
          <label class="form-label">Share Class</label>
          <input type="text" class="form-control" formControlName="class" placeholder="e.g., Class A">
        </div>
        <div class="col-md-6">
          <label class="form-label">Type</label>
          <select class="form-select" formControlName="type">
            <option value="">Select Type</option>
            <option *ngFor="let type of shareTypes" [value]="type">{{ type }}</option>
          </select>
        </div>

        <!-- Value Details -->
        <div class="col-md-6">
          <label class="form-label">Nominal Value</label>
          <input type="number" class="form-control" formControlName="nominalValue" min="0" step="0.01">
        </div>
        <div class="col-md-6">
          <label class="form-label">Currency</label>
          <select class="form-select" formControlName="currency">
            <option value="">Select Currency</option>
            <option *ngFor="let curr of currencies" [value]="curr">{{ curr }}</option>
          </select>
        </div>

        <!-- Rights -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Rights & Restrictions</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" formControlName="votingRights" id="votingRights">
            <label class="form-check-label" for="votingRights">
              Voting Rights
            </label>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" formControlName="dividendRights" id="dividendRights">
            <label class="form-check-label" for="dividendRights">
              Dividend Rights
            </label>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" formControlName="transferable" id="transferable">
            <label class="form-check-label" for="transferable">
              Transferable
            </label>
          </div>
        </div>

        <!-- Issue Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Issue Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Total Shares Issued</label>
          <input type="number" class="form-control" formControlName="totalIssued" min="0">
        </div>

        <!-- Description -->
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea class="form-control" formControlName="description" rows="3" 
                    placeholder="Additional details about this share class"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!shareForm.valid">
        Add Share Class
      </button>
    </div>
  `
})
export class CreateShareModalComponent {
  shareForm: FormGroup;

  shareTypes = ['Ordinary', 'Preferential', 'Deferred'];
  currencies = ['GBP', 'EUR', 'USD'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.shareForm = this.fb.group({
      class: ['', Validators.required],
      type: ['', Validators.required],
      nominalValue: [0, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      votingRights: [false],
      dividendRights: [false],
      transferable: [true],
      totalIssued: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['Active']
    });
  }

  onSubmit(): void {
    if (this.shareForm.valid) {
      this.activeModal.close(this.shareForm.value);
    } else {
      Object.keys(this.shareForm.controls).forEach(key => {
        const control = this.shareForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
