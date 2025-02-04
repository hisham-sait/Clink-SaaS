import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Invoice } from '../settings.types';

@Component({
  selector: 'app-invoice-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Invoice #{{ invoice.number }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Company Details -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="text-muted mb-3">From</h6>
          <p class="mb-1">Bradán Accountants</p>
          <p class="mb-1">123 Business Park</p>
          <p class="mb-1">Dublin, Ireland</p>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted mb-3">To</h6>
          <p class="mb-1">{{ invoice.company?.legalName }}</p>
          <ng-container *ngIf="getAddress() as address">
            <p class="mb-1">{{ address.street }}</p>
            <p class="mb-1">
              {{ address.city }}, 
              {{ address.state }}<br>
              {{ address.country }} 
              {{ address.postalCode }}
            </p>
          </ng-container>
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="row mb-4">
        <div class="col-md-6">
          <dl class="row">
            <dt class="col-sm-4">Invoice Date</dt>
            <dd class="col-sm-8">{{ invoice.createdAt | date }}</dd>

            <dt class="col-sm-4">Due Date</dt>
            <dd class="col-sm-8">{{ invoice.dueDate | date }}</dd>

            <dt class="col-sm-4">Status</dt>
            <dd class="col-sm-8">
              <span class="badge" [ngClass]="getStatusBadgeClass(invoice.status)">
                {{ invoice.status }}
              </span>
            </dd>
          </dl>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="table-responsive mb-4">
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-end">Quantity</th>
              <th class="text-end">Unit Price</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of invoice.items.items">
              <td>{{ item.description }}</td>
              <td class="text-end">{{ item.quantity }}</td>
              <td class="text-end">{{ item.unitPrice | currency:invoice.currency }}</td>
              <td class="text-end">{{ item.total | currency:invoice.currency }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-end">Subtotal</td>
              <td class="text-end">{{ invoice.items.subtotal | currency:invoice.currency }}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-end">Tax</td>
              <td class="text-end">{{ invoice.items.tax | currency:invoice.currency }}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-end"><strong>Total</strong></td>
              <td class="text-end"><strong>{{ invoice.items.total | currency:invoice.currency }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Payment History -->
      <div *ngIf="invoice.payments && invoice.payments.length > 0">
        <h6 class="mb-3">Payment History</h6>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of invoice.payments">
                <td>{{ payment.createdAt | date }}</td>
                <td>{{ payment.method }}</td>
                <td>{{ payment.amount | currency:payment.currency }}</td>
                <td>
                  <span class="badge" [ngClass]="getPaymentStatusBadgeClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notes -->
      <div *ngIf="invoice.notes" class="mt-4">
        <h6 class="mb-3">Notes</h6>
        <p class="mb-0">{{ invoice.notes }}</p>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Close</button>
      <button 
        *ngIf="invoice.status === 'Pending'"
        type="button" 
        class="btn btn-primary"
        (click)="payInvoice()">
        Pay Now
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .badge {
      font-size: 0.875em;
    }
  `]
})
export class InvoiceViewerComponent {
  @Input() invoice!: Invoice;

  constructor(public activeModal: NgbActiveModal) {}

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

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Failed':
        return 'bg-danger';
      case 'Refunded':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getAddress() {
    if (!this.invoice.company?.address) {
      return null;
    }
    return typeof this.invoice.company.address === 'string'
      ? JSON.parse(this.invoice.company.address)
      : this.invoice.company.address;
  }

  payInvoice() {
    this.activeModal.close('pay');
  }
}
