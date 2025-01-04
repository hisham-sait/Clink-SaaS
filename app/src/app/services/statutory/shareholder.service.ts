import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shareholder } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShareholderService {
  private apiUrl = `${environment.apiUrl}/statutory/shareholders`;

  constructor(private http: HttpClient) {}

  getShareholders(companyId: string): Observable<Shareholder[]> {
    return this.http.get<Shareholder[]>(`${this.apiUrl}/${companyId}`);
  }

  getShareholder(companyId: string, id: string): Observable<Shareholder> {
    return this.http.get<Shareholder>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createShareholder(companyId: string, shareholder: Omit<Shareholder, 'id'>): Observable<Shareholder> {
    return this.http.post<Shareholder>(`${this.apiUrl}/${companyId}`, shareholder);
  }

  updateShareholder(companyId: string, id: string, shareholder: Shareholder): Observable<Shareholder> {
    return this.http.put<Shareholder>(`${this.apiUrl}/${companyId}/${id}`, shareholder);
  }

  deleteShareholder(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
