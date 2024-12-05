import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction, PaginatedTransactions } from '../../../../services/transaction.service';
import { BankAccountService } from '../../../../services/bank-account.service';
import { CategoryService } from '../../../../services/category.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CreateTransactionModalComponent } from './create-transaction-modal/create-transaction-modal.component';
import { TransactionFilterComponent, TransactionFilter } from './transaction-filter/transaction-filter.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, CreateTransactionModalComponent, TransactionFilterComponent]
})
export class TransactionsComponent implements OnInit {
  // Make Math available to template
  protected readonly Math = Math;

  totalInflow = 892650.00;
  inflowChange = '+15.8% from last month';
  totalOutflow = 458920.00;
  outflowChange = '-3.2% from last month';
  pendingTransactions = 8;
  pendingTrend = 'down';
  pendingChange = '-3 from last week';

  transactions: Transaction[] = [];
  loading = false;
  loadingMetrics = false;
  error: string | null = null;
  processingAction = false;
  showCreateModal = false;
  showFilterModal = false;

  accounts: { id: string; name: string; }[] = [];
  categories: { id: string; name: string; }[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtering
  currentFilter: TransactionFilter = {};

  constructor(
    private transactionService: TransactionService,
    private bankAccountService: BankAccountService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadMetrics();
    this.loadAccounts();
    this.loadCategories();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    this.transactionService.getTransactions(this.currentPage, this.pageSize, this.currentFilter)
      .pipe(
        catchError(error => {
          console.error('Error loading transactions:', error);
          this.error = 'Failed to load transactions. Please try again.';
          return of({ transactions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((response: PaginatedTransactions) => {
        this.transactions = response.transactions;
        this.currentPage = response.pagination.page;
        this.pageSize = response.pagination.limit;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
      });
  }

  loadMetrics(): void {
    this.loadingMetrics = true;

    this.transactionService.getMetrics()
      .pipe(
        catchError(error => {
          console.error('Error loading metrics:', error);
          return of({
            totalInflow: this.totalInflow,
            inflowChange: this.inflowChange,
            totalOutflow: this.totalOutflow,
            outflowChange: this.outflowChange,
            pendingTransactions: this.pendingTransactions,
            pendingTrend: this.pendingTrend as 'up' | 'down',
            pendingChange: this.pendingChange
          });
        }),
        finalize(() => this.loadingMetrics = false)
      )
      .subscribe(metrics => {
        this.totalInflow = metrics.totalInflow;
        this.inflowChange = metrics.inflowChange;
        this.totalOutflow = metrics.totalOutflow;
        this.outflowChange = metrics.outflowChange;
        this.pendingTransactions = metrics.pendingTransactions;
        this.pendingTrend = metrics.pendingTrend;
        this.pendingChange = metrics.pendingChange;
      });
  }

  loadAccounts(): void {
    this.bankAccountService.getAccounts()
      .pipe(
        catchError(error => {
          console.error('Error loading accounts:', error);
          return of([]);
        })
      )
      .subscribe(accounts => {
        this.accounts = accounts.map(account => ({
          id: account.id,
          name: account.name
        }));
      });
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(
        catchError(error => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      )
      .subscribe(categories => {
        this.categories = categories.map(category => ({
          id: category.id,
          name: category.name
        }));
      });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  onTransactionCreated(): void {
    this.showCreateModal = false;
    this.loadTransactions();
    this.loadMetrics();
  }

  onCreateModalCancelled(): void {
    this.showCreateModal = false;
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  onFilterApplied(filter: TransactionFilter): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
    this.showFilterModal = false;
    this.loadTransactions();
  }

  onFilterCleared(): void {
    this.currentFilter = {};
    this.currentPage = 1;
    this.showFilterModal = false;
    this.loadTransactions();
  }

  onFilterCancelled(): void {
    this.showFilterModal = false;
  }

  viewTransaction(transaction: Transaction): void {
    // TODO: Implement view transaction modal
    console.log('Viewing transaction:', transaction);
  }

  editTransaction(transaction: Transaction): void {
    // TODO: Implement edit transaction modal
    console.log('Editing transaction:', transaction);
  }

  deleteTransaction(transaction: Transaction): void {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    this.processingAction = true;
    this.transactionService.deleteTransaction(transaction.id)
      .pipe(
        catchError(error => {
          console.error('Error deleting transaction:', error);
          this.error = 'Failed to delete transaction. Please try again.';
          return of(null);
        }),
        finalize(() => this.processingAction = false)
      )
      .subscribe(() => {
        this.loadTransactions();
        this.loadMetrics();
      });
  }

  importTransactions(): void {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';

    // Handle file selection
    fileInput.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Read the CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Skip header row and parse transactions
        const transactions = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const [date, description, accountName, category, amount, status, merchantName, notes, tags] = line.split(',');
            return {
              date,
              description,
              accountId: this.accounts.find(a => a.name === accountName)?.id,
              categoryId: this.categories.find(c => c.name === category)?.id,
              amount: parseFloat(amount),
              status: status as 'pending' | 'cleared' | 'failed',
              merchantName,
              notes,
              tags: tags ? tags.split(';') : []
            };
          })
          .filter(t => t.accountId); // Only import transactions with valid account IDs

        if (transactions.length === 0) {
          this.error = 'No valid transactions found in the CSV file';
          return;
        }

        // Import transactions
        this.processingAction = true;
        this.transactionService.importTransactions(transactions[0].accountId!, transactions)
          .pipe(
            catchError(error => {
              console.error('Error importing transactions:', error);
              this.error = 'Failed to import transactions. Please try again.';
              return of(null);
            }),
            finalize(() => this.processingAction = false)
          )
          .subscribe(result => {
            if (result) {
              this.loadTransactions();
              this.loadMetrics();
            }
          });
      };

      reader.readAsText(file);
    };

    // Trigger file selection
    fileInput.click();
  }

  reconcileTransactions(): void {
    // TODO: Implement reconciliation feature
    console.log('Reconciling transactions...');
  }

  exportTransactions(): void {
    this.processingAction = true;
    this.transactionService.exportTransactions()
      .pipe(
        catchError(error => {
          console.error('Error exporting transactions:', error);
          this.error = 'Failed to export transactions. Please try again.';
          return of(null);
        }),
        finalize(() => this.processingAction = false)
      )
      .subscribe(blob => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'transactions.csv';
          link.click();
          window.URL.revokeObjectURL(url);
        }
      });
  }

  generateReport(): void {
    // TODO: Implement report generation feature
    console.log('Generating report...');
  }

  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
