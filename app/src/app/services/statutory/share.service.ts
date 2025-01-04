import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Share } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private apiUrl = `${environment.apiUrl}/statutory/shares`;

  constructor(private http: HttpClient) {}

  getShares(companyId: string): Observable<Share[]> {
    return this.http.get<Share[]>(`${this.apiUrl}/${companyId}`);
  }

  getShare(companyId: string, id: string): Observable<Share> {
    return this.http.get<Share>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createShare(companyId: string, share: Omit<Share, 'id'>): Observable<Share> {
    return this.http.post<Share>(`${this.apiUrl}/${companyId}`, share);
  }

  updateShare(companyId: string, id: string, share: Share): Observable<Share> {
    return this.http.put<Share>(`${this.apiUrl}/${companyId}/${id}`, share);
  }

  deleteShare(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to shares
  getShareClasses(companyId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${companyId}/classes`);
  }

  getTotalIssued(companyId: string, shareClass: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${companyId}/total-issued/${shareClass}`);
  }
}
