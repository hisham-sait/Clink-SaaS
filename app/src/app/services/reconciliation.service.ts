import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reconciliation {
  id: string;
  accountId: string;
  startDate: Date;
  endDate: Date;
  startBalance: number;
  endBalance: number;
  status: 'in_progress' | 'completed' | 'discrepancy';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'pending' | 'posted';
  isReconciled: boolean;
  category?: string;
  notes?: string;
}

export interface ReconciliationSummary {
  totalTransactions: number;
  reconciledTransactions: number;
  unreconciledTransactions: number;
  startBalance: number;
  endBalance: number;
  calculatedEndBalance: number;
  difference: number;
  lastReconciled?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReconciliationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Reconciliation CRUD operations
  getReconciliations(params?: {
    accountId?: string;
    status?: 'in_progress' | 'completed' | 'discrepancy';
    startDate?: string;
    endDate?: string;
  }): Observable<Reconciliation[]> {
    return this.http.get<Reconciliation[]>(`${this.apiUrl}/banking/reconciliations`, { params });
  }

  getReconciliation(id: string): Observable<Reconciliation> {
    return this.http.get<Reconciliation>(`${this.apiUrl}/banking/reconciliations/${id}`);
  }

  createReconciliation(reconciliation: Partial<Reconciliation>): Observable<Reconciliation> {
    return this.http.post<Reconciliation>(`${this.apiUrl}/banking/reconciliations`, reconciliation);
  }

  updateReconciliation(id: string, reconciliation: Partial<Reconciliation>): Observable<Reconciliation> {
    return this.http.patch<Reconciliation>(`${this.apiUrl}/banking/reconciliations/${id}`, reconciliation);
  }

  deleteReconciliation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banking/reconciliations/${id}`);
  }

  // Transaction reconciliation
  getReconciliationTransactions(reconciliationId: string): Observable<ReconciliationTransaction[]> {
    return this.http.get<ReconciliationTransaction[]>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/transactions`
    );
  }

  reconcileTransaction(reconciliationId: string, transactionId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/transactions/${transactionId}/reconcile`,
      {}
    );
  }

  unreconcileTransaction(reconciliationId: string, transactionId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/transactions/${transactionId}/unreconcile`,
      {}
    );
  }

  bulkReconcileTransactions(reconciliationId: string, transactionIds: string[]): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/transactions/bulk-reconcile`,
      { transactionIds }
    );
  }

  // Reconciliation summary and status
  getReconciliationSummary(reconciliationId: string): Observable<ReconciliationSummary> {
    return this.http.get<ReconciliationSummary>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/summary`
    );
  }

  completeReconciliation(reconciliationId: string, notes?: string): Observable<Reconciliation> {
    return this.http.post<Reconciliation>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/complete`,
      { notes }
    );
  }

  reopenReconciliation(reconciliationId: string): Observable<Reconciliation> {
    return this.http.post<Reconciliation>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/reopen`,
      {}
    );
  }

  // Statement import and matching
  importStatement(reconciliationId: string, file: File): Observable<{
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
  }> {
    const formData = new FormData();
    formData.append('statement', file);

    return this.http.post<any>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/import-statement`,
      formData
    );
  }

  matchTransactions(reconciliationId: string, matches: Array<{
    statementTransactionId: string;
    bankTransactionId: string;
  }>): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/match-transactions`,
      { matches }
    );
  }

  // Reconciliation suggestions
  getSuggestedMatches(reconciliationId: string, statementTransactionId: string): Observable<ReconciliationTransaction[]> {
    return this.http.get<ReconciliationTransaction[]>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/transactions/${statementTransactionId}/suggestions`
    );
  }

  // Reconciliation reports
  getReconciliationReport(reconciliationId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/report`,
      { responseType: 'blob' }
    );
  }

  // Auto-reconciliation
  autoReconcile(reconciliationId: string, params: {
    matchCriteria: Array<'amount' | 'date' | 'description'>;
    dateThreshold?: number;
    descriptionSimilarity?: number;
  }): Observable<{
    matchedTransactions: number;
    totalTransactions: number;
  }> {
    return this.http.post<any>(
      `${this.apiUrl}/banking/reconciliations/${reconciliationId}/auto-reconcile`,
      params
    );
  }

  // Reconciliation history
  getReconciliationHistory(accountId: string): Observable<{
    date: Date;
    startBalance: number;
    endBalance: number;
    transactionsCount: number;
    status: string;
  }[]> {
    return this.http.get<any>(`${this.apiUrl}/banking/accounts/${accountId}/reconciliation-history`);
  }
}
