import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allotment } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AllotmentService {
  private apiUrl = `${environment.apiUrl}/statutory/allotments`;

  constructor(private http: HttpClient) {}

  getAllotments(companyId: string, status?: string): Observable<Allotment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Allotment[]>(`${this.apiUrl}/${companyId}`, { params });
  }

  getAllotment(companyId: string, id: string): Observable<Allotment> {
    return this.http.get<Allotment>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createAllotment(companyId: string, allotment: Omit<Allotment, 'id'>): Observable<Allotment> {
    return this.http.post<Allotment>(`${this.apiUrl}/${companyId}`, allotment);
  }

  updateAllotment(companyId: string, id: string, allotment: Allotment): Observable<Allotment> {
    return this.http.put<Allotment>(`${this.apiUrl}/${companyId}/${id}`, allotment);
  }

  deleteAllotment(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to allotments
  recordPayment(companyId: string, id: string, payment: {
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }): Observable<Allotment> {
    return this.http.post<Allotment>(
      `${this.apiUrl}/${companyId}/${id}/payment`,
      payment
    );
  }

  generateCertificate(companyId: string, id: string): Observable<{
    certificateNumber: string;
    certificateUrl: string;
  }> {
    return this.http.post<{
      certificateNumber: string;
      certificateUrl: string;
    }>(`${this.apiUrl}/${companyId}/${id}/certificate`, {});
  }

  getAllotmentsByShareClass(companyId: string, shareClass: string): Observable<Allotment[]> {
    return this.http.get<Allotment[]>(
      `${this.apiUrl}/${companyId}/share-class/${shareClass}`
    );
  }

  getAllotmentsByAllottee(companyId: string, allottee: string): Observable<Allotment[]> {
    return this.http.get<Allotment[]>(
      `${this.apiUrl}/${companyId}/allottee/${allottee}`
    );
  }

  getTotalAllotments(companyId: string): Observable<{
    totalShares: number;
    totalAmount: number;
    currency: string;
  }> {
    return this.http.get<{
      totalShares: number;
      totalAmount: number;
      currency: string;
    }>(`${this.apiUrl}/${companyId}/total`);
  }

  // Import allotments from file - Preview step
  previewImport(companyId: string, formData: FormData): Observable<{ data: Partial<Allotment>[] }> {
    return this.http.post<{ data: Partial<Allotment>[] }>(
      `${this.apiUrl}/${companyId}/import/preview`,
      formData
    );
  }

  // Import allotments from file - Confirm step
  confirmImport(companyId: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(
      `${this.apiUrl}/${companyId}/import/confirm`,
      {}
    );
  }
}
