import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Charge } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  private apiUrl = `${environment.apiUrl}/statutory/charges`;

  constructor(private http: HttpClient) {}

  getCharges(companyId: string, status?: string): Observable<Charge[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Charge[]>(`${this.apiUrl}/${companyId}`, { params });
  }

  getCharge(companyId: string, id: string): Observable<Charge> {
    return this.http.get<Charge>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createCharge(companyId: string, charge: Omit<Charge, 'id'>): Observable<Charge> {
    return this.http.post<Charge>(`${this.apiUrl}/${companyId}`, charge);
  }

  updateCharge(companyId: string, id: string, charge: Charge): Observable<Charge> {
    return this.http.put<Charge>(`${this.apiUrl}/${companyId}/${id}`, charge);
  }

  deleteCharge(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to charges
  satisfyCharge(companyId: string, id: string, satisfactionDate: string): Observable<Charge> {
    return this.http.post<Charge>(`${this.apiUrl}/${companyId}/${id}/satisfy`, { satisfactionDate });
  }

  releaseCharge(companyId: string, id: string, releaseDate: string): Observable<Charge> {
    return this.http.post<Charge>(`${this.apiUrl}/${companyId}/${id}/release`, { releaseDate });
  }

  getTotalCharges(companyId: string): Observable<{
    totalAmount: number;
    currency: string;
    activeCharges: number;
  }> {
    return this.http.get<{
      totalAmount: number;
      currency: string;
      activeCharges: number;
    }>(`${this.apiUrl}/${companyId}/total`);
  }

  getChargesByType(companyId: string, chargeType: string): Observable<Charge[]> {
    return this.http.get<Charge[]>(`${this.apiUrl}/${companyId}/type/${chargeType}`);
  }
}
