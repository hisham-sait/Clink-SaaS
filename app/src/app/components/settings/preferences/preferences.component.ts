import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService, AppPreferences } from '../../../services/settings/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings-preferences',
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="h3 mb-2">Preferences</h1>
        <p class="text-muted mb-0">Customize your application experience</p>
      </div>

      <form [formGroup]="preferencesForm" (ngSubmit)="onSubmit()">
        <!-- Appearance -->
        <div class="card mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Appearance</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Theme</label>
                  <select class="form-select" formControlName="theme" (change)="onThemeChange($event)">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Language</label>
                  <select class="form-select" formControlName="language">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Regional -->
        <div class="card mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Regional</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Timezone</label>
                  <select class="form-select" formControlName="timezone">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Date Format</label>
                  <select class="form-select" formControlName="dateFormat">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Time Format</label>
                  <select class="form-select" formControlName="timeFormat">
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">Currency</label>
                  <select class="form-select" formControlName="currency">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Notifications</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifications.sound">
                  <label class="form-check-label">Sound</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifications.desktop">
                  <label class="form-check-label">Desktop</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifications.email">
                  <label class="form-check-label">Email</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accessibility -->
        <div class="card mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Accessibility</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="accessibility.highContrast">
                  <label class="form-check-label">High Contrast</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="accessibility.largeText">
                  <label class="form-check-label">Large Text</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="accessibility.reducedMotion">
                  <label class="form-check-label">Reduced Motion</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Display -->
        <div class="card mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Display</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="display.compactMode">
                  <label class="form-check-label">Compact Mode</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="display.showTips">
                  <label class="form-check-label">Show Tips</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="display.sidebarCollapsed">
                  <label class="form-check-label">Collapse Sidebar</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary" [disabled]="!preferencesForm.valid">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .form-label {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule]
})
export class SettingsPreferencesComponent implements OnInit, OnDestroy {
  preferencesForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.preferencesForm = this.fb.group({
      theme: ['light'],
      language: ['en'],
      timezone: ['UTC'],
      dateFormat: ['MM/DD/YYYY'],
      timeFormat: ['12h'],
      currency: ['USD'],
      notifications: this.fb.group({
        sound: [true],
        desktop: [true],
        email: [true]
      }),
      accessibility: this.fb.group({
        highContrast: [false],
        largeText: [false],
        reducedMotion: [false]
      }),
      display: this.fb.group({
        compactMode: [false],
        showTips: [true],
        sidebarCollapsed: [false]
      })
    });

    this.settingsService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe((preferences: AppPreferences) => {
        this.preferencesForm.patchValue(preferences);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onThemeChange(event: Event): void {
    const theme = (event.target as HTMLSelectElement).value as 'light' | 'dark' | 'system';
    this.settingsService.applyTheme(theme);
  }

  onSubmit(): void {
    if (this.preferencesForm.valid) {
      this.settingsService.updatePreferences(this.preferencesForm.value);
    }
  }
}
