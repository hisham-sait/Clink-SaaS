import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role } from '../../components/settings/settings.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/settings/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      params: {
        include: 'roles,plan,billingCompany'
      }
    });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      params: {
        include: 'roles,plan,billingCompany'
      }
    });
  }

  createUser(user: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  inviteUser(email: string, roleId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/invite`, { email, roleId });
  }

  resendInvite(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/resend-invite`, {});
  }

  suspendUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/suspend`, {});
  }

  activateUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/activate`, {});
  }
}
