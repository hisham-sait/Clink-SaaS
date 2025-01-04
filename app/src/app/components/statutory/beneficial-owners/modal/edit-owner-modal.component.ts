import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BeneficialOwner } from '../../statutory.types';

@Component({
  selector: 'app-edit-owner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Beneficial Owner</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="ownerForm" class="row g-3">
        <!-- Personal Details -->
        <div class="col-md-3">
          <label class="form-label">Title</label>
          <select class="form-select" formControlName="title">
            <option value="">Select Title</option>
            <option *ngFor="let title of titles" [value]="title">{{ title }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">First Name</label>
          <input type="text" class="form-control" formControlName="firstName" placeholder="First Name">
        </div>
        <div class="col-md-5">
          <label class="form-label">Last Name</label>
          <input type="text" class="form-control" formControlName="lastName" placeholder="Last Name">
        </div>

        <div class="col-md-6">
          <label class="form-label">Date of Birth</label>
          <input type="date" class="form-control" formControlName="dateOfBirth">
        </div>
        <div class="col-md-6">
          <label class="form-label">Nationality</label>
          <input type="text" class="form-control" formControlName="nationality" placeholder="Nationality">
        </div>

        <div class="col-12">
          <label class="form-label">Address</label>
          <textarea class="form-control" formControlName="address" rows="2" placeholder="Full Address"></textarea>
        </div>

        <!-- Contact Details -->
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" formControlName="email" placeholder="Email">
        </div>
        <div class="col-md-6">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-control" formControlName="phone" placeholder="Phone">
        </div>

        <!-- Control Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Control Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label">Nature of Control</label>
          <div class="row g-2">
            <div class="col-md-6" *ngFor="let control of controlTypes">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       [id]="'control_' + control.value"
                       [value]="control.value"
                       [checked]="isControlSelected(control.value)"
                       (change)="onControlTypeChange($event)">
                <label class="form-check-label" [for]="'control_' + control.value">
                  {{ control.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Ownership Percentage</label>
          <div class="input-group">
            <input type="number" class="form-control" formControlName="ownershipPercentage" min="0" max="100">
            <span class="input-group-text">%</span>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Registration Date</label>
          <input type="date" class="form-control" formControlName="registrationDate">
        </div>

        <!-- Status -->
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" [checked]="ownerForm.get('status')?.value === 'Active'" 
                   (change)="onStatusChange($event)" id="statusCheck">
            <label class="form-check-label" for="statusCheck">
              Active Beneficial Owner
            </label>
          </div>
        </div>

        <!-- Description -->
        <div class="col-12">
          <label class="form-label">Additional Information</label>
          <textarea class="form-control" formControlName="description" rows="3" 
                    placeholder="Any additional details about the beneficial owner"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!ownerForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditOwnerModalComponent implements OnInit {
  @Input() owner!: BeneficialOwner;
  ownerForm: FormGroup;

  titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];
  controlTypes = [
    { value: 'shares', label: 'Ownership of Shares (>25%)' },
    { value: 'voting', label: 'Voting Rights' },
    { value: 'appointment', label: 'Right to Appoint/Remove Directors' },
    { value: 'influence', label: 'Significant Influence or Control' },
    { value: 'trust', label: 'Trustee of a Trust' },
    { value: 'partnership', label: 'Partner in a Partnership' }
  ];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.ownerForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      natureOfControl: [[]],
      ownershipPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      registrationDate: ['', Validators.required],
      description: [''],
      status: ['Active']
    });
  }

  ngOnInit(): void {
    if (this.owner) {
      this.ownerForm.patchValue(this.owner);
    }
  }

  isControlSelected(value: string): boolean {
    return this.owner.natureOfControl.includes(value);
  }

  onControlTypeChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentControls = this.ownerForm.get('natureOfControl')?.value as string[] || [];
    
    if (checkbox.checked) {
      currentControls.push(checkbox.value);
    } else {
      const index = currentControls.indexOf(checkbox.value);
      if (index > -1) {
        currentControls.splice(index, 1);
      }
    }
    
    this.ownerForm.patchValue({ natureOfControl: currentControls });
  }

  onStatusChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.ownerForm.patchValue({
      status: checked ? 'Active' : 'Inactive'
    });
  }

  onSubmit(): void {
    if (this.ownerForm.valid) {
      const updatedOwner: BeneficialOwner = {
        ...this.owner,
        ...this.ownerForm.value
      };
      this.activeModal.close(updatedOwner);
    } else {
      Object.keys(this.ownerForm.controls).forEach(key => {
        const control = this.ownerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
