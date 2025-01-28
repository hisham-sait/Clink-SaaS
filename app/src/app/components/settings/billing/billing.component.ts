import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Invoice, Payment, PaymentMethod, BillingDetails } from '../settings.types';
import { BillingService } from '../../../services/settings/billing.service';
import { CompanyService } from '../../../services/settings/company.service';
import { InvoiceViewerComponent } from './invoice-viewer.component';
import { PaymentFlowComponent } from './payment-flow.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Billing & Payments</h4>
          <p class="text-muted mb-0">Manage your billing information and view invoices</p>
        </div>
        <div class="d-flex gap-2">
          <button 
            *ngIf="isPlatformAdmin"
            class="btn btn-primary" 
            (click)="openCreateInvoiceModal()">
            <i class="bi bi-plus-lg me-2"></i>
            Create Invoice
          </button>
          <button 
            *ngIf="isCompanyAdmin"
            class="btn btn-outline-primary" 
            (click)="openAddPaymentMethodModal()">
            <i class="bi bi-credit-card me-2"></i>
            Add Payment Method
          </button>
        </div>
      </div>

      <!-- Billing Details -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-0">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Billing Details</h5>
            <button 
              *ngIf="isCompanyAdmin"
              class="btn btn-link p-0" 
              (click)="openEditBillingDetailsModal()">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Company Name</dt>
                <dd class="col-sm-8">{{ billingDetails?.company?.legalName }}</dd>

                <dt class="col-sm-4">Tax ID</dt>
                <dd class="col-sm-8">{{ billingDetails?.taxId }}</dd>

                <dt class="col-sm-4">Currency</dt>
                <dd class="col-sm-8">{{ billingDetails?.currency }}</dd>

                <dt class="col-sm-4">Payment Terms</dt>
                <dd class="col-sm-8">{{ billingDetails?.paymentTerms }} days</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Address</dt>
                <dd class="col-sm-8">
                  {{ billingDetails?.address }}<br>
                  {{ billingDetails?.city }}, {{ billingDetails?.state }}<br>
                  {{ billingDetails?.country }} {{ billingDetails?.postalCode }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="isCompanyAdmin">
        <div class="card-header bg-transparent border-0">
          <h5 class="mb-0">Payment Methods</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4" *ngFor="let method of paymentMethods">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <i class="bi" [class]="getPaymentIcon(method.type)"></i>
                      <span class="ms-2">•••• {{ method.lastFour }}</span>
                    </div>
                    <div class="dropdown" *ngIf="isCompanyAdmin" ngbDropdown>
                      <button class="btn btn-link p-0" ngbDropdownToggle>
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul ngbDropdownMenu>
                        <li *ngIf="!method.isDefault">
                          <a ngbDropdownItem (click)="setDefaultPaymentMethod(method)">
                            <i class="bi bi-check-circle me-2"></i>Set as Default
                          </a>
                        </li>
                        <li>
                          <a ngbDropdownItem class="text-danger" (click)="removePaymentMethod(method)">
                            <i class="bi bi-trash me-2"></i>Remove
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Expires {{ method.expiryDate | date:'MM/yy' }}</small>
                    <span class="badge bg-success" *ngIf="method.isDefault">Default</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0">
          <h5 class="mb-0">Invoices</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of invoices">
                  <td>{{ invoice.number }}</td>
                  <td>{{ invoice.createdAt | date }}</td>
                  <td>{{ invoice.dueDate | date }}</td>
                  <td>{{ invoice.amount | currency:invoice.currency }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusBadgeClass(invoice.status)">
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" (click)="viewInvoice(invoice)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        *ngIf="isCompanyAdmin && invoice.status === 'Pending'"
                        class="btn btn-sm btn-outline-success" 
                        (click)="payInvoice(invoice)">
                        <i class="bi bi-credit-card"></i>
                      </button>
                      <button 
                        *ngIf="isPlatformAdmin && invoice.status === 'Draft'"
                        class="btn btn-sm btn-outline-danger" 
                        (click)="deleteInvoice(invoice)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Invoice Modal Template -->
    <ng-template #createInvoiceModal let-modal>
      <div class="modal-header">
        <h5 class="modal-title">Create Invoice</h5>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="invoiceForm">
          <div class="mb-3">
            <label class="form-label">Company</label>
            <select class="form-select" formControlName="companyId">
              <option value="">Select Company</option>
              <option *ngFor="let company of companies" [value]="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Amount</label>
            <input type="number" class="form-control" formControlName="amount">
          </div>
          <div class="mb-3">
            <label class="form-label">Due Date</label>
            <input type="date" class="form-control" formControlName="dueDate">
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" formControlName="description" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Cancel</button>
        <button 
          type="button" 
          class="btn btn-primary"
          (click)="saveInvoice(modal)"
          [disabled]="invoiceForm.invalid">
          Create
        </button>
      </div>
    </ng-template>

    <!-- Add Payment Method Modal Template -->
    <ng-template #addPaymentMethodModal let-modal>
      <div class="modal-header">
        <h5 class="modal-title">Add Payment Method</h5>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="paymentMethodForm">
          <div class="mb-3">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-control" formControlName="cardNumber">
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Expiry Date</label>
              <input type="text" class="form-control" formControlName="expiryDate" placeholder="MM/YY">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">CVV</label>
              <input type="text" class="form-control" formControlName="cvv">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Name on Card</label>
            <input type="text" class="form-control" formControlName="nameOnCard">
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" formControlName="setDefault" id="setDefault">
            <label class="form-check-label" for="setDefault">
              Set as default payment method
            </label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Cancel</button>
        <button 
          type="button" 
          class="btn btn-primary"
          (click)="savePaymentMethod(modal)"
          [disabled]="paymentMethodForm.invalid">
          Add
        </button>
      </div>
    </ng-template>

    <!-- Edit Billing Details Modal Template -->
    <ng-template #editBillingDetailsModal let-modal>
      <div class="modal-header">
        <h5 class="modal-title">Edit Billing Details</h5>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="billingDetailsForm">
          <div class="mb-3">
            <label class="form-label">Tax ID</label>
            <input type="text" class="form-control" formControlName="taxId">
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" formControlName="address">
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">City</label>
              <input type="text" class="form-control" formControlName="city">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">State</label>
              <input type="text" class="form-control" formControlName="state">
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Country</label>
              <input type="text" class="form-control" formControlName="country">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Postal Code</label>
              <input type="text" class="form-control" formControlName="postalCode">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Currency</label>
            <select class="form-select" formControlName="currency">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Payment Terms (Days)</label>
            <input type="number" class="form-control" formControlName="paymentTerms">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Cancel</button>
        <button 
          type="button" 
          class="btn btn-primary"
          (click)="saveBillingDetails(modal)"
          [disabled]="billingDetailsForm.invalid">
          Save
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
    .badge {
      font-size: 0.875em;
    }
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .alert {
      margin-bottom: 1rem;
    }
  `]
})
export class BillingComponent implements OnInit {
  @ViewChild('createInvoiceModal') createInvoiceModal!: TemplateRef<any>;
  @ViewChild('addPaymentMethodModal') addPaymentMethodModal!: TemplateRef<any>;
  @ViewChild('editBillingDetailsModal') editBillingDetailsModal!: TemplateRef<any>;

  // Role flags
  isPlatformAdmin = false; // TODO: Get from auth service
  isCompanyAdmin = false; // TODO: Get from auth service

  // Data
  companies: any[] = [];
  billingDetails: BillingDetails | null = null;
  paymentMethods: PaymentMethod[] = [];
  invoices: Invoice[] = [];
  currentCompanyId: string = ''; // TODO: Get from auth service

  // Error handling
  error: string | null = null;

  // Forms
  invoiceForm: FormGroup;
  paymentMethodForm: FormGroup;
  billingDetailsForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private billingService: BillingService,
    private companyService: CompanyService
  ) {
    this.invoiceForm = this.formBuilder.group({
      companyId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      dueDate: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.paymentMethodForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      nameOnCard: ['', Validators.required],
      setDefault: [false]
    });

    this.billingDetailsForm = this.formBuilder.group({
      taxId: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      currency: ['EUR', Validators.required],
      paymentTerms: [30, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  private handleError(error: any) {
    console.error('Error:', error);
    if (error.status === 403) {
      this.error = 'You do not have permission to perform this action.';
    } else if (error.error?.message) {
      this.error = error.error.message;
    } else {
      this.error = 'An unexpected error occurred. Please try again later.';
    }
    setTimeout(() => this.error = null, 5000); // Clear error after 5 seconds
  }

  // Data loading
  loadData() {
    if (this.isPlatformAdmin) {
      this.loadCompanies();
      this.loadAllInvoices();
    } else {
      this.loadBillingDetails();
      this.loadPaymentMethods();
      this.loadInvoices();
    }
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => this.handleError(error)
    });
  }

  loadAllInvoices() {
    this.billingService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
      },
      error: (error) => this.handleError(error)
    });
  }

  loadBillingDetails() {
    this.billingService.getBillingDetails(this.currentCompanyId).subscribe({
      next: (details) => {
        this.billingDetails = details;
        if (details) {
          this.billingDetailsForm.patchValue({
            taxId: details.taxId,
            address: details.address,
            city: details.city,
            state: details.state,
            country: details.country,
            postalCode: details.postalCode,
            currency: details.currency,
            paymentTerms: details.paymentTerms
          });
        }
      },
      error: (error) => this.handleError(error)
    });
  }

  loadPaymentMethods() {
    this.billingService.getPaymentMethods(this.currentCompanyId).subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
      },
      error: (error) => this.handleError(error)
    });
  }

  loadInvoices() {
    this.billingService.getInvoices(this.currentCompanyId).subscribe({
      next: (invoices) => {
        this.invoices = invoices;
      },
      error: (error) => this.handleError(error)
    });
  }

  // Modal handlers
  openCreateInvoiceModal() {
    this.invoiceForm.reset({
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0]
    });
    const modalRef = this.modalService.open(this.createInvoiceModal);
  }

  openAddPaymentMethodModal() {
    this.paymentMethodForm.reset({
      setDefault: false
    });
    const modalRef = this.modalService.open(this.addPaymentMethodModal);
  }

  openEditBillingDetailsModal() {
    const modalRef = this.modalService.open(this.editBillingDetailsModal);
  }

  // Form submissions
  saveInvoice(modal: any) {
    if (this.invoiceForm.valid) {
      const invoiceData = this.invoiceForm.value;
      this.billingService.createInvoice(invoiceData.companyId, invoiceData).subscribe({
        next: () => {
          this.loadInvoices();
          modal.close();
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  savePaymentMethod(modal: any) {
    if (this.paymentMethodForm.valid) {
      const methodData = this.paymentMethodForm.value;
      this.billingService.addPaymentMethod(this.currentCompanyId, methodData).subscribe({
        next: () => {
          this.loadPaymentMethods();
          modal.close();
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  saveBillingDetails(modal: any) {
    if (this.billingDetailsForm.valid) {
      const detailsData = this.billingDetailsForm.value;
      this.billingService.updateBillingDetails(this.currentCompanyId, detailsData).subscribe({
        next: () => {
          this.loadBillingDetails();
          modal.close();
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  // Helper methods
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Overdue':
        return 'bg-danger';
      case 'Draft':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  // Actions
  setDefaultPaymentMethod(method: PaymentMethod) {
    this.billingService.setDefaultPaymentMethod(this.currentCompanyId, method.id).subscribe({
      next: () => {
        this.loadPaymentMethods();
      },
      error: (error) => this.handleError(error)
    });
  }

  removePaymentMethod(method: PaymentMethod) {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.billingService.deletePaymentMethod(this.currentCompanyId, method.id).subscribe({
        next: () => {
          this.loadPaymentMethods();
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  viewInvoice(invoice: Invoice) {
    const modalRef = this.modalService.open(InvoiceViewerComponent, { size: 'lg' });
    modalRef.componentInstance.invoice = invoice;

    modalRef.result.then((result: string) => {
      if (result === 'pay') {
        this.payInvoice(invoice);
      }
    }).catch(() => {
      // Modal dismissed
    });
  }

  payInvoice(invoice: Invoice) {
    const modalRef = this.modalService.open(PaymentFlowComponent);
    modalRef.componentInstance.invoice = invoice;

    modalRef.result.then((result: string) => {
      if (result === 'paid') {
        this.loadInvoices();
      } else if (result === 'add-payment-method') {
        modalRef.close();
        this.openAddPaymentMethodModal();
      }
    }).catch(() => {
      // Modal dismissed
    });
  }

  deleteInvoice(invoice: Invoice) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.billingService.deleteInvoice(invoice.companyId, invoice.id).subscribe({
        next: () => {
          this.loadInvoices();
        },
        error: (error) => this.handleError(error)
      });
    }
  }
}
