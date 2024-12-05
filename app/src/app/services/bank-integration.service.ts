import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
}

export interface BankConnection {
  id: string;
  institutionId: string;
  institutionName: string;
  logo: string;
  provider: 'plaid' | 'yodlee';
  status: 'connected' | 'connecting' | 'error';
  lastSynced: Date;
  accounts: BankAccount[];
}

export interface PlaidLinkConfig {
  token: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: (error?: any) => void;
  onEvent: (eventName: string, metadata: any) => void;
}

export interface YodleeFastLinkConfig {
  fastLinkUrl: string;
  token: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onExit: () => void;
}

export interface PlaidMetadata {
  institutionId: string;
  institutionName: string;
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class BankIntegrationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConnectedBanks(): Observable<BankConnection[]> {
    return this.http.get<BankConnection[]>(`${this.apiUrl}/banking/connections`);
  }

  initializePlaidLink(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/banking/plaid/create-link-token`, {});
  }

  exchangePlaidToken(publicToken: string, metadata: PlaidMetadata): Observable<any> {
    return this.http.post(`${this.apiUrl}/banking/plaid/exchange-token`, { publicToken, ...metadata });
  }

  getYodleeFastLinkToken(): Observable<{ token: string; fastLinkUrl: string }> {
    return this.http.post<{ token: string; fastLinkUrl: string }>(`${this.apiUrl}/banking/yodlee/get-fastlink-token`, {});
  }

  syncBank(connectionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/banking/connections/${connectionId}/sync`, {});
  }

  syncAllBanks(): Observable<any> {
    return this.http.post(`${this.apiUrl}/banking/connections/sync-all`, {});
  }

  disconnectBank(connectionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banking/connections/${connectionId}`);
  }

  getBankTransactions(connectionId: string, params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/banking/connections/${connectionId}/transactions`, { params });
  }

  getBankBalances(connectionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/banking/connections/${connectionId}/balances`);
  }

  getBankAccounts(connectionId: string): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/banking/connections/${connectionId}/accounts`);
  }

  updateBankConnection(connectionId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/banking/connections/${connectionId}`, data);
  }
}
