import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BankAccountService, BankAccount, AccountMetrics } from '../../../../services/bank-account.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

type TrendType = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-bank-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AccountsComponent implements OnInit {
  // Metrics with default values
  totalBalance = 0;
  balanceTrend: TrendType = 'neutral';
  balanceChange = '0';
  activeAccounts = 0;
  newAccounts = 0;
  pendingTransactions = 0;
  pendingTrend: TrendType = 'neutral';
  pendingChange = '0';

  // Bank accounts array
  bankAccounts: BankAccount[] = [];
  
  // Loading states
  loading = true;
  loadingMetrics = true;
  processingAction = false;

  // Error states
  error: string | null = null;
  metricsError: string | null = null;

  constructor(private bankAccountService: BankAccountService) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadMetrics();
  }

  loadAccounts() {
    this.loading = true;
    this.error = null;
    
    this.bankAccountService.getAccounts()
      .pipe(
        catchError(error => {
          console.error('Error loading accounts:', error);
          this.error = 'Failed to load bank accounts. Please try again.';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(accounts => {
        this.bankAccounts = accounts;
      });
  }

  loadMetrics() {
    this.loadingMetrics = true;
    this.metricsError = null;

    this.bankAccountService.getAccountMetrics()
      .pipe(
        catchError(error => {
          console.error('Error loading metrics:', error);
          this.metricsError = 'Failed to load account metrics.';
          return of({} as AccountMetrics);
        }),
        finalize(() => this.loadingMetrics = false)
      )
      .subscribe(metrics => {
        this.totalBalance = metrics.totalBalance;
        this.balanceTrend = metrics.balanceTrend;
        this.balanceChange = metrics.balanceChange;
        this.activeAccounts = metrics.activeAccounts;
        this.newAccounts = metrics.newAccounts;
        this.pendingTransactions = metrics.pendingTransactions;
        this.pendingTrend = metrics.pendingTrend;
        this.pendingChange = metrics.pendingChange;
      });
  }

  viewTransactions(account: BankAccount) {
    this.processingAction = true;
    // Navigate to transactions view with account ID
    // Will be implemented when transactions component is ready
    setTimeout(() => {
      alert(`Viewing transactions for ${account.name}... Feature coming soon!`);
      this.processingAction = false;
    }, 500);
  }

  editAccount(account: BankAccount) {
    this.processingAction = true;
    
    // For now, just toggle status between Active and Inactive
    const newStatus = account.status === 'Active' ? 'Inactive' : 'Active';
    
    this.bankAccountService.updateAccount(account.id, { status: newStatus })
      .pipe(
        catchError(error => {
          console.error('Error updating account:', error);
          alert('Failed to update account. Please try again.');
          return of(null);
        }),
        finalize(() => this.processingAction = false)
      )
      .subscribe(updatedAccount => {
        if (updatedAccount) {
          this.loadAccounts(); // Reload accounts to get updated data
        }
      });
  }

  removeAccount(account: BankAccount) {
    if (!confirm(`Are you sure you want to remove ${account.name}?`)) {
      return;
    }

    this.processingAction = true;
    
    this.bankAccountService.deleteAccount(account.id)
      .pipe(
        catchError(error => {
          console.error('Error removing account:', error);
          alert('Failed to remove account. Please try again.');
          return of(null);
        }),
        finalize(() => this.processingAction = false)
      )
      .subscribe(() => {
        this.loadAccounts(); // Reload accounts after successful deletion
      });
  }

  importTransactions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      this.processingAction = true;
      
      // For now, we'll just show an alert since the import endpoint is a stub
      setTimeout(() => {
        alert('Import feature coming soon!');
        this.processingAction = false;
      }, 1000);
    };

    input.click();
  }

  exportAccounts() {
    this.processingAction = true;

    this.bankAccountService.exportAccounts()
      .pipe(
        catchError(error => {
          console.error('Error exporting accounts:', error);
          alert('Failed to export accounts. Please try again.');
          return of(null);
        }),
        finalize(() => this.processingAction = false)
      )
      .subscribe(blob => {
        if (blob) {
          // Create a download link and click it
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'bank-accounts.csv';
          link.click();
          window.URL.revokeObjectURL(url);
        }
      });
  }

  connectBank() {
    this.processingAction = true;
    // This will be implemented when bank connection modal is ready
    setTimeout(() => {
      alert('Bank connection feature coming soon!');
      this.processingAction = false;
    }, 500);
  }

  // Helper methods
  getAccountIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bi bi-bank';
      case 'savings':
        return 'bi bi-piggy-bank';
      case 'credit card':
        return 'bi bi-credit-card';
      default:
        return 'bi bi-bank';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-success';
      case 'inactive':
        return 'text-danger';
      case 'pending':
        return 'text-warning';
      default:
        return '';
    }
  }

  getTrendIcon(trend: TrendType): string {
    switch (trend) {
      case 'up':
        return 'bi bi-arrow-up-circle-fill text-success';
      case 'down':
        return 'bi bi-arrow-down-circle-fill text-danger';
      default:
        return 'bi bi-dash-circle-fill text-secondary';
    }
  }
}
