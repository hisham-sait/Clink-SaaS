import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Company } from '../../components/settings/settings.types';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/settings/companies`;
  
  private companiesSubject = new BehaviorSubject<Company[]>([]);
  companies$ = this.companiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCompanies(): Observable<Company[]> {
    return this.getCompanies().pipe(
      tap(companies => this.companiesSubject.next(companies))
    );
  }

  getAccessibleCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/accessible`);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/create`, company);
  }

  updateCompany(id: string, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setPrimaryOrganization(id: string): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/${id}/set-primary`, {});
  }

  setMyOrganization(id: string): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/${id}/set-my-org`, {});
  }

  addTag(id: string, tag: string): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/${id}/tags`, { tag });
  }

  removeTag(id: string, tag: string): Observable<Company> {
    return this.http.delete<Company>(`${this.apiUrl}/${id}/tags/${tag}`);
  }

  archiveCompany(id: string): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/${id}/archive`, {});
  }

  activateCompany(id: string): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/${id}/activate`, {});
  }

  uploadLogo(id: string, file: File): Observable<Company> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<Company>(`${this.apiUrl}/${id}/logo`, formData);
  }

  getPrimaryContact(id: string): Observable<{ name: string; email: string; phone: string; role: string }> {
    return this.http.get<{ name: string; email: string; phone: string; role: string }>(
      `${this.apiUrl}/${id}/primary-contact`
    );
  }

  updatePrimaryContact(
    id: string,
    contact: { name: string; email: string; phone: string; role: string }
  ): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}/primary-contact`, contact);
  }
}
