import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
}

export interface OrganizationSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxNumber?: string;
  registrationNumber?: string;
  industry?: string;
  size?: string;
  logo?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
  sessionTimeout: number;
  loginHistory: Array<{
    date: Date;
    ip: string;
    device: string;
  }>;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  types: {
    security: boolean;
    updates: boolean;
    marketing: boolean;
    billing: boolean;
  };
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  display: {
    compactMode: boolean;
    showTips: boolean;
    sidebarCollapsed: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private mockProfile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    jobTitle: 'Administrator',
    department: 'IT',
    bio: 'Experienced administrator with focus on system optimization.'
  };

  private mockOrganization: OrganizationSettings = {
    name: 'Example Corp',
    address: '123 Business St, Suite 100, City, State 12345',
    phone: '+1234567890',
    email: 'contact@example.com',
    website: 'www.example.com',
    taxNumber: 'TAX123456',
    registrationNumber: 'REG789012',
    industry: 'Technology',
    size: '50-100',
    logo: 'assets/images/logo.png'
  };

  private mockSecurity: SecuritySettings = {
    twoFactorEnabled: true,
    lastPasswordChange: new Date('2024-01-01'),
    sessionTimeout: 30,
    loginHistory: [
      {
        date: new Date('2024-01-15T09:30:00'),
        ip: '192.168.1.1',
        device: 'Chrome / Windows'
      }
    ]
  };

  private mockNotifications: NotificationSettings = {
    email: true,
    push: true,
    desktop: false,
    frequency: 'daily',
    types: {
      security: true,
      updates: true,
      marketing: false,
      billing: true
    }
  };

  private mockPreferences: AppPreferences = {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    notifications: {
      sound: true,
      desktop: true,
      email: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    },
    display: {
      compactMode: false,
      showTips: true,
      sidebarCollapsed: false
    }
  };

  constructor() {}

  getProfile(): Observable<UserProfile> {
    return of(this.mockProfile);
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    this.mockProfile = { ...this.mockProfile, ...profile };
    return of(this.mockProfile);
  }

  getOrganization(): Observable<OrganizationSettings> {
    return of(this.mockOrganization);
  }

  updateOrganization(settings: OrganizationSettings): Observable<OrganizationSettings> {
    this.mockOrganization = { ...this.mockOrganization, ...settings };
    return of(this.mockOrganization);
  }

  getSecuritySettings(): Observable<SecuritySettings> {
    return of(this.mockSecurity);
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<SecuritySettings> {
    this.mockSecurity = { ...this.mockSecurity, ...settings };
    return of(this.mockSecurity);
  }

  getNotificationSettings(): Observable<NotificationSettings> {
    return of(this.mockNotifications);
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    this.mockNotifications = { ...this.mockNotifications, ...settings };
    return of(this.mockNotifications);
  }

  getPreferences(): Observable<AppPreferences> {
    return of(this.mockPreferences);
  }

  updatePreferences(preferences: Partial<AppPreferences>): Observable<AppPreferences> {
    this.mockPreferences = { ...this.mockPreferences, ...preferences };
    return of(this.mockPreferences);
  }

  applyTheme(theme: 'light' | 'dark' | 'system'): void {
    // In a real app, this would apply the theme to the document
    document.documentElement.setAttribute('data-bs-theme', theme === 'system' ? 'light' : theme);
  }
}
