import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  registeredOffice: string;
  incorporationDate: string;
  yearEnd: string;
  status: 'Active' | 'Inactive' | 'Dissolved';
  type: string;
  vatNumber?: string;
  taxNumber?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  lastAGM?: string;
  lastAnnualReturn?: string;
  nextAGMDue?: string;
  nextAnnualReturnDue?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/statutory/companies`;
  private currentCompanySubject = new BehaviorSubject<Company | null>(null);
  currentCompany$ = this.currentCompanySubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to load last selected company from localStorage
    const savedCompany = localStorage.getItem('currentCompany');
    if (savedCompany) {
      this.currentCompanySubject.next(JSON.parse(savedCompany));
    }
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  createCompany(company: Omit<Company, 'id'>): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  updateCompany(id: string, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Current company management
  setCurrentCompany(company: Company): void {
    localStorage.setItem('currentCompany', JSON.stringify(company));
    this.currentCompanySubject.next(company);
  }

  getCurrentCompany(): Company | null {
    return this.currentCompanySubject.value;
  }

  clearCurrentCompany(): void {
    localStorage.removeItem('currentCompany');
    this.currentCompanySubject.next(null);
  }

  // Company statistics and reports
  getCompanyStatistics(id: string): Observable<{
    directors: {
      total: number;
      active: number;
      resigned: number;
    };
    shareholders: {
      total: number;
      totalShares: number;
    };
    beneficialOwners: {
      total: number;
      totalOwnership: number;
    };
    charges: {
      total: number;
      totalAmount: number;
      active: number;
    };
    meetings: {
      total: number;
      agm: number;
      egm: number;
      boardMeetings: number;
    };
  }> {
    return this.http.get<{
      directors: {
        total: number;
        active: number;
        resigned: number;
      };
      shareholders: {
        total: number;
        totalShares: number;
      };
      beneficialOwners: {
        total: number;
        totalOwnership: number;
      };
      charges: {
        total: number;
        totalAmount: number;
        active: number;
      };
      meetings: {
        total: number;
        agm: number;
        egm: number;
        boardMeetings: number;
      };
    }>(`${this.apiUrl}/${id}/statistics`);
  }

  // Compliance monitoring
  getComplianceStatus(id: string): Observable<{
    agmStatus: 'Up to date' | 'Due soon' | 'Overdue';
    annualReturnStatus: 'Up to date' | 'Due soon' | 'Overdue';
    daysUntilNextAGM: number;
    daysUntilNextAnnualReturn: number;
    missingInformation: string[];
    recommendations: string[];
  }> {
    return this.http.get<{
      agmStatus: 'Up to date' | 'Due soon' | 'Overdue';
      annualReturnStatus: 'Up to date' | 'Due soon' | 'Overdue';
      daysUntilNextAGM: number;
      daysUntilNextAnnualReturn: number;
      missingInformation: string[];
      recommendations: string[];
    }>(`${this.apiUrl}/${id}/compliance`);
  }

  // Document generation
  generateCompanyReport(id: string, type: 'full' | 'summary'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/report/${type}`, {
      responseType: 'blob'
    });
  }

  generateStatutoryForms(id: string, formType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/forms/${formType}`, {
      responseType: 'blob'
    });
  }
}
