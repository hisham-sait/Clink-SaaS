import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../../../services/transaction.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-create-transaction-modal',
  template: `
    <div class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Transaction</h5>
            <button type="button" class="btn-close" (click)="cancel()"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            
            <form #form="ngForm">
              <div class="mb-3">
                <label class="form-label">Account</label>
                <select class="form-select" [(ngModel)]="transaction.accountId" name="accountId" required>
                  <option [value]="account.id" *ngFor="let account of accounts">{{ account.name }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Amount</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" [(ngModel)]="transaction.amount" name="amount" required>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" [(ngModel)]="transaction.date" name="date" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <input type="text" class="form-control" [(ngModel)]="transaction.description" name="description" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" [(ngModel)]="transaction.categoryId" name="categoryId">
                  <option [value]="category.id" *ngFor="let category of categories">{{ category.name }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" [(ngModel)]="transaction.status" name="status" required>
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Merchant Name</label>
                <input type="text" class="form-control" [(ngModel)]="transaction.merchantName" name="merchantName">
              </div>

              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" [(ngModel)]="transaction.notes" name="notes"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="button" class="btn btn-primary" 
                    [disabled]="!form.form.valid || saving"
                    (click)="save()">
              <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1050;
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateTransactionModalComponent {
  @Input() accounts: { id: string; name: string; }[] = [];
  @Input() categories: { id: string; name: string; }[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  transaction = {
    accountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: '',
    status: 'pending' as 'pending' | 'cleared' | 'failed',
    merchantName: '',
    notes: '',
    tags: [] as string[]
  };

  saving = false;
  error: string | null = null;

  constructor(private transactionService: TransactionService) {}

  save(): void {
    this.saving = true;
    this.error = null;

    this.transactionService.createTransaction({
      ...this.transaction,
      date: new Date(this.transaction.date).toISOString()
    })
      .pipe(
        catchError(error => {
          console.error('Error creating transaction:', error);
          this.error = 'Failed to create transaction. Please try again.';
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(result => {
        if (result) {
          this.saved.emit();
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
