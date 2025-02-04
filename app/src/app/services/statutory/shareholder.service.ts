import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shareholder } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShareholderService {
  private apiUrl = `${environment.apiUrl}/statutory/shareholders`;

  constructor(private http: HttpClient) {}

  getShareholders(companyId: string, status?: string): Observable<Shareholder[]> {
    let params = new HttpParams();
    // Set status parameter even if it's an empty string (to show all)
    // Only skip if status is undefined/null
    if (status !== undefined && status !== null) {
      params = params.set('status', status);
    }
    return this.http.get<Shareholder[]>(`${this.apiUrl}/${companyId}`, { params });
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

  // Import shareholders from file - Preview step
  previewImport(companyId: string, formData: FormData): Observable<{ data: Partial<Shareholder>[] }> {
    return this.http.post<{ data: Partial<Shareholder>[] }>(
      `${this.apiUrl}/${companyId}/import/preview`,
      formData
    );
  }

  // Import shareholders from file - Confirm step
  confirmImport(companyId: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(
      `${this.apiUrl}/${companyId}/import/confirm`,
      {}
    );
  }
}
