import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting, Resolution } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/statutory/meetings`;

  constructor(private http: HttpClient) {}

  getMeetings(companyId: string): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/${companyId}`);
  }

  getMeeting(companyId: string, id: string): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createMeeting(companyId: string, meeting: Omit<Meeting, 'id'>): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.apiUrl}/${companyId}`, meeting);
  }

  updateMeeting(companyId: string, id: string, meeting: Meeting): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.apiUrl}/${companyId}/${id}`, meeting);
  }

  deleteMeeting(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to meetings
  finalizeMeeting(companyId: string, id: string, minutes: string): Observable<Meeting> {
    return this.http.post<Meeting>(
      `${this.apiUrl}/${companyId}/${id}/finalize`,
      { minutes }
    );
  }

  addResolution(companyId: string, meetingId: string, resolution: Resolution): Observable<Resolution> {
    return this.http.post<Resolution>(
      `${this.apiUrl}/${companyId}/${meetingId}/resolutions`,
      resolution
    );
  }

  updateResolution(
    companyId: string,
    meetingId: string,
    resolutionId: string,
    resolution: Resolution
  ): Observable<Resolution> {
    return this.http.put<Resolution>(
      `${this.apiUrl}/${companyId}/${meetingId}/resolutions/${resolutionId}`,
      resolution
    );
  }

  deleteResolution(companyId: string, meetingId: string, resolutionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${companyId}/${meetingId}/resolutions/${resolutionId}`
    );
  }

  addAttachment(companyId: string, id: string, file: File): Observable<string[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string[]>(
      `${this.apiUrl}/${companyId}/${id}/attachments`,
      formData
    );
  }

  removeAttachment(companyId: string, id: string, filename: string): Observable<string[]> {
    return this.http.delete<string[]>(
      `${this.apiUrl}/${companyId}/${id}/attachments/${filename}`
    );
  }

  getMeetingsByType(companyId: string, type: 'AGM' | 'EGM' | 'Class Meeting'): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/${companyId}/type/${type}`);
  }

  getMeetingsByYear(companyId: string, year: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/${companyId}/year/${year}`);
  }

  getMeetingStatistics(companyId: string): Observable<{
    totalMeetings: number;
    agmCount: number;
    egmCount: number;
    classMeetingCount: number;
    averageAttendance: number;
    resolutionsPassed: number;
    resolutionsRejected: number;
  }> {
    return this.http.get<{
      totalMeetings: number;
      agmCount: number;
      egmCount: number;
      classMeetingCount: number;
      averageAttendance: number;
      resolutionsPassed: number;
      resolutionsRejected: number;
    }>(`${this.apiUrl}/${companyId}/statistics`);
  }
}
