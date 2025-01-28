import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Director } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {
  private apiUrl = `${environment.apiUrl}/statutory/directors`;

  constructor(private http: HttpClient) {}

  // Get all directors for a company
  getDirectors(companyId: string, status?: string): Observable<Director[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Director[]>(`${this.apiUrl}/${companyId}`, { params });
  }

  // Get a specific director
  getDirector(companyId: string, id: string): Observable<Director> {
    return this.http.get<Director>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Create a new director
  createDirector(companyId: string, director: Omit<Director, 'id'>): Observable<Director> {
    return this.http.post<Director>(`${this.apiUrl}/${companyId}`, director);
  }

  // Update a director
  updateDirector(companyId: string, id: string, director: Director): Observable<Director> {
    return this.http.put<Director>(`${this.apiUrl}/${companyId}/${id}`, director);
  }

  // Mark director as resigned
  resignDirector(companyId: string, id: string, resignationDate: string): Observable<Director> {
    return this.http.post<Director>(`${this.apiUrl}/${companyId}/${id}/resign`, { resignationDate });
  }

  // Delete a director
  deleteDirector(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }
}
