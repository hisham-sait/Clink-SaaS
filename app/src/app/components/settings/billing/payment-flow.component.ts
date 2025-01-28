import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Invoice, PaymentMethod } from '../settings.types';
import { BillingService } from '../../../services/settings/billing.service';

@Component({
  selector: 'app-payment-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Pay Invoice #{{ invoice.number }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Payment Summary -->
      <div class="card border-0 bg-light mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted">Amount Due</span>
            <h4 class="mb-0">{{ invoice.amount | currency:invoice.currency }}</h4>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted">Due Date</span>
            <span>{{ invoice.dueDate | date }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection -->
      <form [formGroup]="paymentForm">
        <div class="mb-4">
          <h6 class="mb-3">Select Payment Method</h6>
          <div class="list-group">
            <label 
              *ngFor="let method of paymentMethods" 
              class="list-group-item list-group-item-action"
              [class.active]="paymentForm.get('methodId')?.value === method.id">
              <div class="d-flex align-items-center">
                <input 
                  type="radio" 
                  [value]="method.id" 
                  formControlName="methodId"
                  class="form-check-input me-3">
                <div>
                  <i class="bi" [class]="getPaymentIcon(method.type)"></i>
                  <span class="ms-2">•••• {{ method.lastFour }}</span>
                  <small class="d-block text-muted">
                    Expires {{ method.expiryDate | date:'MM/yy' }}
                  </small>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Add New Payment Method -->
        <div class="mb-4">
          <button 
            type="button" 
            class="btn btn-outline-primary btn-sm"
            (click)="addNewPaymentMethod()">
            <i class="bi bi-plus-lg me-2"></i>
            Add New Payment Method
          </button>
        </div>

        <!-- Payment Notes -->
        <div class="mb-4">
          <label class="form-label">Notes (Optional)</label>
          <textarea 
            class="form-control" 
            formControlName="notes"
            rows="2"
            placeholder="Add any notes for this payment"></textarea>
        </div>
      </form>

      <!-- Terms -->
      <div class="alert alert-info" role="alert">
        <small>
          By proceeding with the payment, you agree to our terms and conditions. 
          All payments are secure and encrypted.
        </small>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button 
        type="button" 
        class="btn btn-primary"
        [disabled]="!paymentForm.valid || processing"
        (click)="processPayment()">
        <span *ngIf="!processing">
          Pay {{ invoice.amount | currency:invoice.currency }}
        </span>
        <span *ngIf="processing">
          <i class="bi bi-arrow-repeat spin me-2"></i>
          Processing...
        </span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .list-group-item {
      cursor: pointer;
    }
    .list-group-item:hover:not(.active) {
      background-color: var(--bs-light);
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class PaymentFlowComponent {
  @Input() invoice!: Invoice;
  paymentMethods: PaymentMethod[] = [];
  paymentForm: FormGroup;
  processing = false;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private billingService: BillingService
  ) {
    this.paymentForm = this.formBuilder.group({
      methodId: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    this.billingService.getPaymentMethods(this.invoice.companyId).subscribe(methods => {
      this.paymentMethods = methods;
      
      // Select default payment method if available
      const defaultMethod = methods.find(m => m.isDefault);
      if (defaultMethod) {
        this.paymentForm.patchValue({ methodId: defaultMethod.id });
      }
    });
  }

  getPaymentIcon(type: string): string {
    switch (type) {
      case 'card':
        return 'bi-credit-card';
      case 'bank':
        return 'bi-bank';
      default:
        return 'bi-credit-card';
    }
  }

  addNewPaymentMethod() {
    // Close current modal and signal parent to open payment method modal
    this.activeModal.close('add-payment-method');
  }

  processPayment() {
    if (this.paymentForm.valid && !this.processing) {
      this.processing = true;
      
      const payment = {
        methodId: this.paymentForm.value.methodId,
        notes: this.paymentForm.value.notes,
        amount: this.invoice.amount,
        currency: this.invoice.currency
      };

      this.billingService.createPayment(
        this.invoice.companyId,
        this.invoice.id,
        payment
      ).subscribe({
        next: () => {
          this.activeModal.close('paid');
        },
        error: (error) => {
          console.error('Payment failed:', error);
          this.processing = false;
          // TODO: Show error message to user
        }
      });
    }
  }
}
