import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

interface Shareholder {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  shares: {
    ordinary: number;
    preferential: number;
  };
  dateAcquired: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-edit-shareholder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Shareholder</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="shareholderForm" class="row g-3">
        <!-- Personal Details -->
        <div class="col-md-3">
          <select class="form-select" formControlName="title">
            <option value="">Select Title</option>
            <option *ngFor="let title of titles" [value]="title">{{ title }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" formControlName="firstName" placeholder="First Name">
        </div>
        <div class="col-md-5">
          <input type="text" class="form-control" formControlName="lastName" placeholder="Last Name">
        </div>

        <div class="col-md-6">
          <input type="date" class="form-control" formControlName="dateOfBirth" placeholder="Date of Birth">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" formControlName="nationality" placeholder="Nationality">
        </div>

        <div class="col-12">
          <textarea class="form-control" formControlName="address" rows="2" placeholder="Address"></textarea>
        </div>

        <!-- Contact Details -->
        <div class="col-md-6">
          <input type="email" class="form-control" formControlName="email" placeholder="Email">
        </div>
        <div class="col-md-6">
          <input type="tel" class="form-control" formControlName="phone" placeholder="Phone">
        </div>

        <!-- Share Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Share Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label small">Ordinary Shares</label>
          <input type="number" class="form-control" formControlName="ordinaryShares" min="0">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Preferential Shares</label>
          <input type="number" class="form-control" formControlName="preferentialShares" min="0">
        </div>

        <div class="col-12">
          <label class="form-label small">Date Acquired</label>
          <input type="date" class="form-control" formControlName="dateAcquired">
        </div>

        <!-- Status -->
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" [checked]="shareholderForm.get('status')?.value === 'Active'" 
                   (change)="onStatusChange($event)" id="statusCheck">
            <label class="form-check-label" for="statusCheck">
              Active Shareholder
            </label>
          </div>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!shareholderForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditShareholderModalComponent implements OnInit {
  @Input() shareholder!: Shareholder;
  shareholderForm: FormGroup;

  titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.shareholderForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      ordinaryShares: [0, [Validators.required, Validators.min(0)]],
      preferentialShares: [0, [Validators.required, Validators.min(0)]],
      dateAcquired: ['', Validators.required],
      status: ['Active']
    });
  }

  ngOnInit(): void {
    if (this.shareholder) {
      this.shareholderForm.patchValue({
        ...this.shareholder,
        ordinaryShares: this.shareholder.shares.ordinary,
        preferentialShares: this.shareholder.shares.preferential
      });
    }
  }

  onStatusChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shareholderForm.patchValue({
      status: checked ? 'Active' : 'Inactive'
    });
  }

  onSubmit(): void {
    if (this.shareholderForm.valid) {
      const formValue = this.shareholderForm.value;
      const { ordinaryShares, preferentialShares, ...rest } = formValue;
      const updatedShareholder: Shareholder = {
        ...rest,
        shares: {
          ordinary: ordinaryShares,
          preferential: preferentialShares
        }
      };
      
      this.activeModal.close(updatedShareholder);
    } else {
      Object.keys(this.shareholderForm.controls).forEach(key => {
        const control = this.shareholderForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
