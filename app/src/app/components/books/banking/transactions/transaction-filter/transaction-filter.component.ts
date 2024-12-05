import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  status?: 'pending' | 'cleared' | 'failed';
  minAmount?: number;
  maxAmount?: number;
}

@Component({
  selector: 'app-transaction-filter',
  template: `
    <div class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Filter Transactions</h5>
            <button type="button" class="btn-close" (click)="cancel()"></button>
          </div>
          <div class="modal-body">
            <form #form="ngForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filter.startDate" name="startDate">
                </div>
                <div class="col-md-6">
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filter.endDate" name="endDate">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Account</label>
                  <select class="form-select" [(ngModel)]="filter.accountId" name="accountId">
                    <option value="">All Accounts</option>
                    <option [value]="account.id" *ngFor="let account of accounts">{{ account.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category</label>
                  <select class="form-select" [(ngModel)]="filter.categoryId" name="categoryId">
                    <option value="">All Categories</option>
                    <option [value]="category.id" *ngFor="let category of categories">{{ category.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select class="form-select" [(ngModel)]="filter.status" name="status">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Amount Range</label>
                  <div class="input-group">
                    <input type="number" class="form-control" placeholder="Min" [(ngModel)]="filter.minAmount" name="minAmount">
                    <span class="input-group-text">to</span>
                    <input type="number" class="form-control" placeholder="Max" [(ngModel)]="filter.maxAmount" name="maxAmount">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-link" (click)="clearFilter()">Clear Filter</button>
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="apply()">Apply Filter</button>
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
export class TransactionFilterComponent {
  @Input() accounts: { id: string; name: string; }[] = [];
  @Input() categories: { id: string; name: string; }[] = [];
  @Input() currentFilter: TransactionFilter = {};
  @Output() filterApplied = new EventEmitter<TransactionFilter>();
  @Output() filterCleared = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  filter: TransactionFilter = {};

  ngOnInit() {
    this.filter = { ...this.currentFilter };
  }

  apply(): void {
    this.filterApplied.emit(this.filter);
  }

  clearFilter(): void {
    this.filter = {};
    this.filterCleared.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
