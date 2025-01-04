import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Charge } from '../../statutory.types';

@Component({
  selector: 'app-edit-charge-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Charge</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="chargeForm" class="row g-3">
        <!-- Basic Details -->
        <div class="col-md-6">
          <label class="form-label">Charge ID</label>
          <input type="text" class="form-control" formControlName="chargeId" placeholder="e.g., CH001">
        </div>
        <div class="col-md-6">
          <label class="form-label">Type</label>
          <select class="form-select" formControlName="chargeType">
            <option value="">Select Type</option>
            <option *ngFor="let type of chargeTypes" [value]="type">{{ type }}</option>
          </select>
        </div>

        <!-- Amount Details -->
        <div class="col-md-6">
          <label class="form-label">Amount</label>
          <input type="number" class="form-control" formControlName="amount" min="0" step="0.01">
        </div>
        <div class="col-md-6">
          <label class="form-label">Currency</label>
          <select class="form-select" formControlName="currency">
            <option value="">Select Currency</option>
            <option *ngFor="let curr of currencies" [value]="curr">{{ curr }}</option>
          </select>
        </div>

        <!-- Party Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Party Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Chargor</label>
          <input type="text" class="form-control" formControlName="chargor" placeholder="Name of chargor">
        </div>
        <div class="col-md-6">
          <label class="form-label">Chargee</label>
          <input type="text" class="form-control" formControlName="chargee" placeholder="Name of chargee">
        </div>

        <!-- Property Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Property Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label">Property Charged</label>
          <textarea class="form-control" formControlName="propertyCharged" rows="2" 
                    placeholder="Description of property subject to charge"></textarea>
        </div>

        <!-- Dates -->
        <div class="col-md-6">
          <label class="form-label">Date Created</label>
          <input type="date" class="form-control" formControlName="dateCreated">
        </div>
        <div class="col-md-6">
          <label class="form-label">Registration Date</label>
          <input type="date" class="form-control" formControlName="registrationDate">
        </div>

        <!-- Status -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Status Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status" (change)="onStatusChange($event)">
            <option value="Active">Active</option>
            <option value="Satisfied">Satisfied</option>
            <option value="Released">Released</option>
          </select>
        </div>
        <div class="col-md-6" *ngIf="showSatisfactionDate">
          <label class="form-label">Satisfaction Date</label>
          <input type="date" class="form-control" formControlName="satisfactionDate">
        </div>

        <!-- Description -->
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea class="form-control" formControlName="description" rows="3" 
                    placeholder="Additional details about the charge"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!chargeForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditChargeModalComponent implements OnInit {
  @Input() charge!: Charge;
  chargeForm: FormGroup;
  showSatisfactionDate = false;

  chargeTypes = [
    'Fixed Charge',
    'Floating Charge',
    'Fixed & Floating Charge',
    'Mortgage',
    'Debenture'
  ];

  currencies = ['GBP', 'EUR', 'USD'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.chargeForm = this.fb.group({
      chargeId: ['', Validators.required],
      chargeType: ['', Validators.required],
      dateCreated: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      chargor: ['', Validators.required],
      chargee: ['', Validators.required],
      description: [''],
      propertyCharged: ['', Validators.required],
      registrationDate: ['', Validators.required],
      status: ['Active'],
      satisfactionDate: [null]
    });
  }

  ngOnInit(): void {
    if (this.charge) {
      this.chargeForm.patchValue(this.charge);
      this.showSatisfactionDate = this.charge.status !== 'Active';
    }
  }

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.showSatisfactionDate = status !== 'Active';
    
    if (status === 'Active') {
      this.chargeForm.patchValue({ satisfactionDate: null });
    } else if (!this.chargeForm.get('satisfactionDate')?.value) {
      this.chargeForm.patchValue({ satisfactionDate: new Date().toISOString().split('T')[0] });
    }
  }

  onSubmit(): void {
    if (this.chargeForm.valid) {
      const updatedCharge: Charge = {
        ...this.charge,
        ...this.chargeForm.value
      };
      
      if (updatedCharge.status === 'Active') {
        delete updatedCharge.satisfactionDate;
      }
      
      this.activeModal.close(updatedCharge);
    } else {
      Object.keys(this.chargeForm.controls).forEach(key => {
        const control = this.chargeForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
