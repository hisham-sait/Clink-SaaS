import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BankAccount {
  id: string;
  name: string;
  number: string;
  type: 'Checking' | 'Savings' | 'Credit Card';
  balance: number;
  currency: string;
  lastUpdated: string;
  status: 'Active' | 'Inactive' | 'Pending';
  icon?: string;  // Added icon property
  metadata?: any;
}

export interface AccountMetrics {
  totalBalance: number;
  balanceTrend: 'up' | 'down' | 'neutral';
  balanceChange: string;
  activeAccounts: number;
  newAccounts: number;
  pendingTransactions: number;
  pendingTrend: 'up' | 'down' | 'neutral';
  pendingChange: string;
}

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private apiUrl = `${environment.apiUrl}/banking/accounts`;

  constructor(private http: HttpClient) {}

  // Get all bank accounts
  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.apiUrl);
  }

  // Get account metrics
  getAccountMetrics(): Observable<AccountMetrics> {
    return this.http.get<AccountMetrics>(`${this.apiUrl}/metrics`);
  }

  // Get a single bank account by ID
  getAccount(id: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/${id}`);
  }

  // Create a new bank account
  createAccount(account: Partial<BankAccount>): Observable<BankAccount> {
    return this.http.post<BankAccount>(this.apiUrl, account);
  }

  // Update a bank account
  updateAccount(id: string, account: Partial<BankAccount>): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.apiUrl}/${id}`, account);
  }

  // Delete a bank account
  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import transactions for an account
  importTransactions(accountId: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.apiUrl}/${accountId}/import`, formData);
  }

  // Export accounts data
  exportAccounts(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob'
    });
  }
}
