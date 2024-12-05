import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BalanceAlert {
  id: string;
  accountId: string;
  connectionId: string;
  type: 'below' | 'above';
  threshold: number;
  frequency: 'once' | 'always';
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertHistory {
  alertId: string;
  triggeredAt: Date;
  balance: number;
  threshold: number;
  type: 'below' | 'above';
  accountName: string;
  bankName: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  message: string;
  status: 'unread' | 'read' | 'dismissed';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceAlertService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Alert CRUD operations
  getAlerts(params?: {
    accountId?: string;
    connectionId?: string;
    isActive?: boolean;
  }): Observable<BalanceAlert[]> {
    return this.http.get<BalanceAlert[]>(`${this.apiUrl}/banking/alerts`, { params });
  }

  createAlert(alert: Partial<BalanceAlert>): Observable<BalanceAlert> {
    return this.http.post<BalanceAlert>(`${this.apiUrl}/banking/alerts`, alert);
  }

  updateAlert(id: string, alert: Partial<BalanceAlert>): Observable<BalanceAlert> {
    return this.http.patch<BalanceAlert>(`${this.apiUrl}/banking/alerts/${id}`, alert);
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banking/alerts/${id}`);
  }

  // Alert status management
  toggleAlert(id: string, isActive: boolean): Observable<BalanceAlert> {
    return this.http.patch<BalanceAlert>(`${this.apiUrl}/banking/alerts/${id}/toggle`, { isActive });
  }

  toggleAllAlerts(accountId: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banking/alerts/toggle-all`, { accountId, isActive });
  }

  // Alert history
  getAlertHistory(params: {
    startDate?: string;
    endDate?: string;
    alertId?: string;
    accountId?: string;
  }): Observable<AlertHistory[]> {
    return this.http.get<AlertHistory[]>(`${this.apiUrl}/banking/alerts/history`, { params });
  }

  // Alert notifications
  getNotifications(params?: {
    status?: 'unread' | 'read' | 'dismissed';
    limit?: number;
  }): Observable<AlertNotification[]> {
    return this.http.get<AlertNotification[]>(`${this.apiUrl}/banking/alerts/notifications`, { params });
  }

  markNotificationAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banking/alerts/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banking/alerts/notifications/read-all`, {});
  }

  dismissNotification(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banking/alerts/notifications/${id}/dismiss`, {});
  }

  // Alert settings
  getAlertSettings(): Observable<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationSound: boolean;
    dailyDigest: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/banking/alerts/settings`);
  }

  updateAlertSettings(settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notificationSound?: boolean;
    dailyDigest?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banking/alerts/settings`, settings);
  }

  // Alert templates
  getAlertTemplates(): Observable<{
    name: string;
    description: string;
    type: 'below' | 'above';
    thresholdType: 'fixed' | 'percentage';
    defaultThreshold: number;
  }[]> {
    return this.http.get<any>(`${this.apiUrl}/banking/alerts/templates`);
  }

  // Bulk operations
  createBulkAlerts(alerts: Partial<BalanceAlert>[]): Observable<BalanceAlert[]> {
    return this.http.post<BalanceAlert[]>(`${this.apiUrl}/banking/alerts/bulk`, alerts);
  }

  deleteBulkAlerts(alertIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/alerts/bulk-delete`, { alertIds });
  }

  // Alert testing
  testAlert(alertId: string): Observable<{
    triggered: boolean;
    currentBalance: number;
    threshold: number;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/banking/alerts/${alertId}/test`, {});
  }
}
