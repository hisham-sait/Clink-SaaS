import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardMinute, Discussion, ActionItem, Resolution } from '../../components/statutory/statutory.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoardMinuteService {
  private apiUrl = `${environment.apiUrl}/statutory/board-minutes`;

  constructor(private http: HttpClient) {}

  getBoardMinutes(companyId: string, status?: 'Draft' | 'Final' | 'Signed'): Observable<BoardMinute[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<BoardMinute[]>(`${this.apiUrl}/${companyId}`, { params });
  }

  getBoardMinute(companyId: string, id: string): Observable<BoardMinute> {
    return this.http.get<BoardMinute>(`${this.apiUrl}/${companyId}/${id}`);
  }

  createBoardMinute(companyId: string, minute: Omit<BoardMinute, 'id'>): Observable<BoardMinute> {
    return this.http.post<BoardMinute>(`${this.apiUrl}/${companyId}`, minute);
  }

  updateBoardMinute(companyId: string, id: string, minute: BoardMinute): Observable<BoardMinute> {
    return this.http.put<BoardMinute>(`${this.apiUrl}/${companyId}/${id}`, minute);
  }

  deleteBoardMinute(companyId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}/${id}`);
  }

  // Discussion methods
  addDiscussion(companyId: string, minuteId: string, discussion: Discussion): Observable<Discussion> {
    return this.http.post<Discussion>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions`,
      discussion
    );
  }

  updateDiscussion(
    companyId: string,
    minuteId: string,
    discussionId: string,
    discussion: Discussion
  ): Observable<Discussion> {
    return this.http.put<Discussion>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions/${discussionId}`,
      discussion
    );
  }

  deleteDiscussion(companyId: string, minuteId: string, discussionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions/${discussionId}`
    );
  }

  // Action item methods
  addActionItem(
    companyId: string,
    minuteId: string,
    discussionId: string,
    actionItem: ActionItem
  ): Observable<ActionItem> {
    return this.http.post<ActionItem>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions/${discussionId}/action-items`,
      actionItem
    );
  }

  updateActionItem(
    companyId: string,
    minuteId: string,
    discussionId: string,
    actionItemId: string,
    actionItem: ActionItem
  ): Observable<ActionItem> {
    return this.http.put<ActionItem>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions/${discussionId}/action-items/${actionItemId}`,
      actionItem
    );
  }

  deleteActionItem(
    companyId: string,
    minuteId: string,
    discussionId: string,
    actionItemId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${companyId}/${minuteId}/discussions/${discussionId}/action-items/${actionItemId}`
    );
  }

  // Resolution methods
  addResolution(companyId: string, minuteId: string, resolution: Resolution): Observable<Resolution> {
    return this.http.post<Resolution>(
      `${this.apiUrl}/${companyId}/${minuteId}/resolutions`,
      resolution
    );
  }

  updateResolution(
    companyId: string,
    minuteId: string,
    resolutionId: string,
    resolution: Resolution
  ): Observable<Resolution> {
    return this.http.put<Resolution>(
      `${this.apiUrl}/${companyId}/${minuteId}/resolutions/${resolutionId}`,
      resolution
    );
  }

  deleteResolution(companyId: string, minuteId: string, resolutionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${companyId}/${minuteId}/resolutions/${resolutionId}`
    );
  }

  // Additional methods
  finalizeBoardMinute(companyId: string, id: string, minutes: string): Observable<BoardMinute> {
    return this.http.post<BoardMinute>(
      `${this.apiUrl}/${companyId}/${id}/finalize`,
      { minutes }
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

  getBoardMinutesByYear(companyId: string, year: number): Observable<BoardMinute[]> {
    return this.http.get<BoardMinute[]>(`${this.apiUrl}/${companyId}/year/${year}`);
  }

  getBoardMinuteStatistics(companyId: string): Observable<{
    totalMinutes: number;
    totalDiscussions: number;
    totalActionItems: number;
    completedActionItems: number;
    pendingActionItems: number;
    averageAttendance: number;
    resolutionsPassed: number;
  }> {
    return this.http.get<{
      totalMinutes: number;
      totalDiscussions: number;
      totalActionItems: number;
      completedActionItems: number;
      pendingActionItems: number;
      averageAttendance: number;
      resolutionsPassed: number;
    }>(`${this.apiUrl}/${companyId}/statistics`);
  }

  // Import board minutes from file - Preview step
  previewImport(companyId: string, formData: FormData): Observable<{ data: Partial<BoardMinute>[] }> {
    return this.http.post<{ data: Partial<BoardMinute>[] }>(
      `${this.apiUrl}/${companyId}/import/preview`,
      formData
    );
  }

  // Import board minutes from file - Confirm step
  confirmImport(companyId: string): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(
      `${this.apiUrl}/${companyId}/import/confirm`,
      {}
    );
  }
}
