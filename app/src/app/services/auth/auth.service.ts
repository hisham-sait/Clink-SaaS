import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  companyId?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const ROLE_MAPPINGS: { [key: string]: string } = {
  'Super Admin': 'super-admin',
  'Platform Admin': 'platform-admin',
  'Company Admin': 'company-admin',
  'Company Manager': 'company-manager',
  'Accountant': 'accountant',
  'Viewer': 'viewer',
  'Auditor': 'external-auditor',
  'Tax Advisor': 'tax-advisor',
  'Legal Advisor': 'legal-advisor',
  'Consultant': 'external-consultant'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenRefreshTimeout: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Setup token refresh if user exists
    if (this.currentUserValue) {
      this.setupTokenRefresh();
    }
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  private setupTokenRefresh(): void {
    const token = this.token;
    if (!token) return;

    const expiration = this.getTokenExpiration(token);
    if (!expiration) return;

    // Clear any existing refresh timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Calculate time until token needs refresh (5 minutes before expiration)
    const timeUntilRefresh = expiration.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (timeUntilRefresh <= 0) {
      // Token is already expired or close to expiring, logout user
      this.logout();
      return;
    }

    // Set timeout to refresh token
    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, timeUntilRefresh);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('token');
  }

  public getUserRole(): string | null {
    const user = this.currentUserValue;
    if (user && user.roles.length > 0) {
      const role = user.roles[0];
      return ROLE_MAPPINGS[role] || null;
    }
    return null;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      );

      if (response?.token && response?.user) {
        this.setSession(response);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(companyData: any, adminData: any): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
          company: companyData,
          admin: adminData
        })
      );

      if (response?.token && response?.user) {
        this.setSession(response);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.apiUrl}/forgot-password`, { email })
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.apiUrl}/reset-password`, { token, password })
      );
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {
          token: this.token
        })
      );

      if (response?.token && response?.user) {
        this.setSession(response);
      }
    } catch {
      // If token refresh fails, log the user out
      this.logout();
    }
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('currentUser', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
    this.setupTokenRefresh();
  }

  logout(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.token;
    if (!token) return false;

    const expiration = this.getTokenExpiration(token);
    if (!expiration) return false;

    return expiration.getTime() > Date.now();
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.currentUserValue?.roles.some(role => roles.includes(role)) || false;
  }

  isPlatformLevel(): boolean {
    return this.hasAnyRole(['Super Admin', 'Platform Admin']);
  }

  isCompanyLevel(): boolean {
    return this.hasAnyRole(['Company Admin', 'Company Manager', 'Accountant', 'Viewer']);
  }

  isThirdParty(): boolean {
    return this.hasAnyRole(['Auditor', 'Tax Advisor', 'Legal Advisor', 'Consultant']);
  }
}
