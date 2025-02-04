import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BeneficialOwner } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BeneficialOwnerService {
  private apiUrl = `${environment.apiUrl}/statutory/beneficial-owners`;

  constructor(private http: HttpClient) {}

  getBeneficialOwners(companyId: string, status?: string): Observable<BeneficialOwner[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<BeneficialOwner[]>(`${this.apiUrl}/${companyId}`, { params });
  }

  getBeneficialOwner(companyId: string, id: string): Observable<BeneficialOwner> {
    return this.http.get<BeneficialOwner>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createBeneficialOwner(companyId: string, owner: Omit<BeneficialOwner, 'id'>): Observable<BeneficialOwner> {
    return this.http.post<BeneficialOwner>(`${this.apiUrl}/${companyId}`, owner);
  }

  updateBeneficialOwner(companyId: string, id: string, owner: BeneficialOwner): Observable<BeneficialOwner> {
    return this.http.put<BeneficialOwner>(`${this.apiUrl}/${companyId}/${id}`, owner);
  }

  deleteBeneficialOwner(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to beneficial owners
  getOwnershipStructure(companyId: string): Observable<{
    ownershipPercentage: number;
    ownerName: string;
    natureOfControl: string[];
  }[]> {
    return this.http.get<{
      ownershipPercentage: number;
      ownerName: string;
      natureOfControl: string[];
    }[]>(`${this.apiUrl}/${companyId}/ownership-structure`);
  }

  getTotalOwnershipPercentage(companyId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${companyId}/total-ownership`);
  }

  // Import beneficial owners from file - Preview step
  previewImport(companyId: string, formData: FormData): Observable<{ data: Partial<BeneficialOwner>[] }> {
    return this.http.post<{ data: Partial<BeneficialOwner>[] }>(
      `${this.apiUrl}/${companyId}/import/preview`,
      formData
    );
  }

  // Import beneficial owners from file - Confirm step
  confirmImport(companyId: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(
      `${this.apiUrl}/${companyId}/import/confirm`,
      {}
    );
  }
}
