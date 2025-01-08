import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Activity } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/statutory/activities`;

  constructor(private http: HttpClient) {}

  getActivities(companyId: string, params?: {
    entityType?: string;
    entityId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Observable<{
    activities: Activity[];
    total: number;
  }> {
    return this.http.get<{
      activities: Activity[];
      total: number;
    }>(`${this.apiUrl}/${companyId}`, { params });
  }

  getActivity(companyId: string, id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createActivity(companyId: string, activity: Omit<Activity, 'id'>): Observable<Activity> {
    return this.http.post<Activity>(`${this.apiUrl}/${companyId}`, activity);
  }

  // Get activities for a specific entity (e.g., director, shareholder)
  getEntityActivities(
    companyId: string,
    entityType: string,
    entityId: string,
    params?: {
      type?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Observable<{
    activities: Activity[];
    total: number;
  }> {
    return this.http.get<{
      activities: Activity[];
      total: number;
    }>(`${this.apiUrl}/${companyId}/entity/${entityType}/${entityId}`, { params });
  }

  // Get activities by type (e.g., appointment, resignation)
  getActivitiesByType(
    companyId: string,
    type: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Observable<{
    activities: Activity[];
    total: number;
  }> {
    return this.http.get<{
      activities: Activity[];
      total: number;
    }>(`${this.apiUrl}/${companyId}/type/${type}`, { params });
  }

  // Get activity statistics
  getActivityStatistics(companyId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<{
    totalActivities: number;
    activityByType: { [key: string]: number };
    activityByEntity: { [key: string]: number };
    activityByUser: { [key: string]: number };
    activityByMonth: { [key: string]: number };
  }> {
    return this.http.get<{
      totalActivities: number;
      activityByType: { [key: string]: number };
      activityByEntity: { [key: string]: number };
      activityByUser: { [key: string]: number };
      activityByMonth: { [key: string]: number };
    }>(`${this.apiUrl}/${companyId}/statistics`, { params });
  }

  // Export activities to CSV/Excel
  exportActivities(companyId: string, format: 'csv' | 'excel', params?: {
    entityType?: string;
    entityId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${companyId}/export/${format}`,
      {
        params,
        responseType: 'blob'
      }
    );
  }
}
