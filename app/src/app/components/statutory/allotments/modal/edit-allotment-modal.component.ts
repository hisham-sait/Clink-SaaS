import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

interface Allotment {
  allotmentId: string;
  allotmentDate: string;
  shareClass: string;
  numberOfShares: number;
  pricePerShare: number;
  currency: string;
  allottee: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: string;
  certificateNumber?: string;
  status: 'Active' | 'Cancelled';
  notes?: string;
}

@Component({
  selector: 'app-edit-allotment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Share Allotment</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="allotmentForm" class="row g-3">
        <!-- Basic Details -->
        <div class="col-md-6">
          <label class="form-label">Allotment ID</label>
          <input type="text" class="form-control" formControlName="allotmentId" placeholder="e.g., AL001">
        </div>
        <div class="col-md-6">
          <label class="form-label">Allotment Date</label>
          <input type="date" class="form-control" formControlName="allotmentDate">
        </div>

        <!-- Share Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Share Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Share Class</label>
          <select class="form-select" formControlName="shareClass">
            <option value="">Select Share Class</option>
            <option *ngFor="let shareClass of shareClasses" [value]="shareClass">{{ shareClass }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Number of Shares</label>
          <input type="number" class="form-control" formControlName="numberOfShares" min="1">
        </div>

        <!-- Price Details -->
        <div class="col-md-4">
          <label class="form-label">Price per Share</label>
          <input type="number" class="form-control" formControlName="pricePerShare" min="0" step="0.01">
        </div>
        <div class="col-md-4">
          <label class="form-label">Currency</label>
          <select class="form-select" formControlName="currency">
            <option value="">Select Currency</option>
            <option *ngFor="let curr of currencies" [value]="curr">{{ curr }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Total Amount</label>
          <div class="form-control-plaintext">
            {{ calculateTotal() }}
          </div>
        </div>

        <!-- Allottee Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Allottee Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-12">
          <label class="form-label">Allottee</label>
          <input type="text" class="form-control" formControlName="allottee" placeholder="Name of allottee">
        </div>

        <!-- Payment Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Payment Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-4">
          <label class="form-label">Payment Status</label>
          <select class="form-select" formControlName="paymentStatus" (change)="onPaymentStatusChange($event)">
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
        <div class="col-md-4" *ngIf="showPaymentFields">
          <label class="form-label">Amount Paid</label>
          <input type="number" class="form-control" formControlName="amountPaid" min="0" step="0.01">
        </div>
        <div class="col-md-4" *ngIf="showPaymentFields">
          <label class="form-label">Payment Date</label>
          <input type="date" class="form-control" formControlName="paymentDate">
        </div>

        <!-- Certificate Details -->
        <div class="col-md-6">
          <label class="form-label">Certificate Number</label>
          <input type="text" class="form-control" formControlName="certificateNumber" placeholder="e.g., CERT001">
        </div>

        <!-- Status -->
        <div class="col-md-6">
          <div class="form-check mt-4">
            <input class="form-check-input" type="checkbox" [checked]="allotmentForm.get('status')?.value === 'Active'" 
                   (change)="onStatusChange($event)" id="statusCheck">
            <label class="form-check-label" for="statusCheck">
              Active Allotment
            </label>
          </div>
        </div>

        <!-- Notes -->
        <div class="col-12">
          <label class="form-label">Notes</label>
          <textarea class="form-control" formControlName="notes" rows="3" 
                    placeholder="Additional notes about this allotment"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!allotmentForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditAllotmentModalComponent implements OnInit {
  @Input() allotment!: Allotment;
  allotmentForm: FormGroup;
  showPaymentFields = true;

  shareClasses = ['Ordinary Shares', 'Preference Shares', 'Class A', 'Class B'];
  currencies = ['GBP', 'EUR', 'USD'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.allotmentForm = this.fb.group({
      allotmentId: ['', Validators.required],
      allotmentDate: ['', Validators.required],
      shareClass: ['', Validators.required],
      numberOfShares: [1, [Validators.required, Validators.min(1)]],
      pricePerShare: [0, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      allottee: ['', Validators.required],
      paymentStatus: ['Paid'],
      amountPaid: [0],
      paymentDate: [''],
      certificateNumber: [''],
      notes: [''],
      status: ['Active']
    });
  }

  ngOnInit(): void {
    if (this.allotment) {
      this.allotmentForm.patchValue(this.allotment);
      this.showPaymentFields = this.allotment.paymentStatus !== 'Unpaid';
    }
  }

  calculateTotal(): string {
    const shares = this.allotmentForm.get('numberOfShares')?.value || 0;
    const price = this.allotmentForm.get('pricePerShare')?.value || 0;
    const currency = this.allotmentForm.get('currency')?.value || '';
    
    if (!currency) return '';

    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(shares * price);
  }

  onPaymentStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.showPaymentFields = status !== 'Unpaid';
    
    if (!this.showPaymentFields) {
      this.allotmentForm.patchValue({
        amountPaid: 0,
        paymentDate: null
      });
    }
  }

  onStatusChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allotmentForm.patchValue({
      status: checked ? 'Active' : 'Cancelled'
    });
  }

  onSubmit(): void {
    if (this.allotmentForm.valid) {
      const formValue = this.allotmentForm.value;
      
      // Remove payment details if unpaid
      if (formValue.paymentStatus === 'Unpaid') {
        delete formValue.amountPaid;
        delete formValue.paymentDate;
      }
      
      const updatedAllotment: Allotment = {
        ...this.allotment,
        ...formValue
      };
      
      this.activeModal.close(updatedAllotment);
    } else {
      Object.keys(this.allotmentForm.controls).forEach(key => {
        const control = this.allotmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
