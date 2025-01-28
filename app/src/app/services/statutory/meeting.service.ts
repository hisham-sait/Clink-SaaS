import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Meeting, Resolution } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

// API types to handle flat structure
interface ApiMeeting extends Omit<Meeting, 'quorum'> {
  quorumRequired?: number;
  quorumPresent?: number;
  quorumAchieved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/statutory/meetings`;

  constructor(private http: HttpClient) {}

  private transformToMeeting(apiMeeting: ApiMeeting): Meeting {
    const { quorumRequired, quorumPresent, quorumAchieved, ...rest } = apiMeeting;
    return {
      ...rest,
      quorum: {
        required: quorumRequired || 0,
        present: quorumPresent || 0,
        achieved: quorumAchieved || false
      }
    };
  }

  private transformToApiMeeting(meeting: Partial<Meeting>): Partial<ApiMeeting> {
    if (!meeting) return {};
    const { quorum, ...rest } = meeting;
    return {
      ...rest,
      quorumRequired: quorum?.required,
      quorumPresent: quorum?.present,
      quorumAchieved: quorum?.achieved
    };
  }

  getMeetings(companyId: string, status?: 'Draft' | 'Final' | 'Signed'): Observable<Meeting[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiMeeting[]>(`${this.apiUrl}/${companyId}`, { params })
      .pipe(map(meetings => meetings.map(m => this.transformToMeeting(m))));
  }

  getMeeting(companyId: string, id: string): Observable<Meeting> {
    return this.http.get<ApiMeeting>(`${this.apiUrl}/${companyId}/${id}`)
      .pipe(map(meeting => this.transformToMeeting(meeting)));
  }

  createMeeting(companyId: string, meeting: Omit<Meeting, 'id'>): Observable<Meeting> {
    const apiMeeting = this.transformToApiMeeting(meeting);
    return this.http.post<ApiMeeting>(`${this.apiUrl}/${companyId}`, apiMeeting)
      .pipe(map(meeting => this.transformToMeeting(meeting)));
  }

  updateMeeting(companyId: string, id: string, meeting: Meeting): Observable<Meeting> {
    const apiMeeting = this.transformToApiMeeting(meeting);
    return this.http.put<ApiMeeting>(`${this.apiUrl}/${companyId}/${id}`, apiMeeting)
      .pipe(map(meeting => this.transformToMeeting(meeting)));
  }

  deleteMeeting(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Additional methods specific to meetings
  finalizeMeeting(companyId: string, id: string, minutes: string): Observable<Meeting> {
    return this.http.post<ApiMeeting>(
      `${this.apiUrl}/${companyId}/${id}/finalize`,
      { minutes }
    ).pipe(map(meeting => this.transformToMeeting(meeting)));
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
    return this.http.get<ApiMeeting[]>(`${this.apiUrl}/${companyId}/type/${type}`)
      .pipe(map(meetings => meetings.map(m => this.transformToMeeting(m))));
  }

  getMeetingsByYear(companyId: string, year: number): Observable<Meeting[]> {
    return this.http.get<ApiMeeting[]>(`${this.apiUrl}/${companyId}/year/${year}`)
      .pipe(map(meetings => meetings.map(m => this.transformToMeeting(m))));
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
