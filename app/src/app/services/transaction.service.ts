import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TransactionFilter } from '../components/books/banking/transactions/transaction-filter/transaction-filter.component';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  account: string;
  category: string;
  amount: number;
  status: 'pending' | 'cleared' | 'failed';
  merchantName?: string;
  notes?: string;
  tags: string[];
}

export interface TransactionMetrics {
  totalInflow: number;
  inflowChange: string;
  totalOutflow: number;
  outflowChange: string;
  pendingTransactions: number;
  pendingTrend: 'up' | 'down';
  pendingChange: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/banking/transactions`;

  constructor(private http: HttpClient) {}

  // Get all transactions with pagination and filtering
  getTransactions(page: number = 1, limit: number = 10, filter?: TransactionFilter): Observable<PaginatedTransactions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.accountId) params = params.set('accountId', filter.accountId);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.minAmount) params = params.set('minAmount', filter.minAmount.toString());
      if (filter.maxAmount) params = params.set('maxAmount', filter.maxAmount.toString());
    }

    return this.http.get<PaginatedTransactions>(this.apiUrl, { params });
  }

  // Get transaction metrics
  getMetrics(): Observable<TransactionMetrics> {
    return this.http.get<TransactionMetrics>(`${this.apiUrl}/metrics`);
  }

  // Get a single transaction
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // Create a new transaction
  createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  // Update a transaction
  updateTransaction(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, updates);
  }

  // Delete a transaction
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import transactions
  importTransactions(accountId: string, transactions: Partial<Transaction>[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/import`, {
      accountId,
      transactions
    });
  }

  // Export transactions
  exportTransactions(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob'
    });
  }
}
