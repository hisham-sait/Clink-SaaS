import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from '../../services/settings/settings.service';

@Component({
  selector: 'app-settings-dashboard',
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="h3 mb-2">Settings Dashboard</h1>
        <p class="text-muted mb-0">Overview of your account and application settings</p>
      </div>

      <!-- Access Management Section -->
      <div class="mb-4">
        <h2 class="h5 mb-3">Access Management</h2>
        <div class="row g-4">
          <!-- Users -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-people fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Users</h5>
                </div>
                <p class="card-text text-muted">Manage users and their access permissions</p>
                <a [routerLink]="['/settings/users']" class="btn btn-outline-primary">
                  Manage Users
                </a>
              </div>
            </div>
          </div>

          <!-- Roles -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-shield fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Roles</h5>
                </div>
                <p class="card-text text-muted">Manage roles and their permissions</p>
                <a [routerLink]="['/settings/roles']" class="btn btn-outline-primary">
                  Manage Roles
                </a>
              </div>
            </div>
          </div>

          <!-- Companies -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-buildings fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Companies</h5>
                </div>
                <p class="card-text text-muted">Manage companies and their relationships</p>
                <a [routerLink]="['/settings/companies']" class="btn btn-outline-primary">
                  Manage Companies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- General Settings Section -->
      <div class="mb-4">
        <h2 class="h5 mb-3">General Settings</h2>
        <div class="row g-4">
          <!-- Profile -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-person fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Profile</h5>
                </div>
                <p class="card-text text-muted">Manage your personal information and preferences</p>
                <a [routerLink]="['/settings/profile']" class="btn btn-outline-primary">
                  View Profile
                </a>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-shield-lock fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Security</h5>
                </div>
                <p class="card-text text-muted">Manage your password and security settings</p>
                <a [routerLink]="['/settings/security']" class="btn btn-outline-primary">
                  View Security
                </a>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-gear fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Preferences</h5>
                </div>
                <p class="card-text text-muted">Customize your application experience</p>
                <a [routerLink]="['/settings/preferences']" class="btn btn-outline-primary">
                  View Preferences
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings Section -->
      <div>
        <h2 class="h5 mb-3">System Settings</h2>
        <div class="row g-4">
          <!-- Integrations -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-plug fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Integrations</h5>
                </div>
                <p class="card-text text-muted">Manage your app integrations</p>
                <a [routerLink]="['/settings/integrations']" class="btn btn-outline-primary">
                  View Integrations
                </a>
              </div>
            </div>
          </div>

          <!-- Billing -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-credit-card fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Billing</h5>
                </div>
                <p class="card-text text-muted">Manage your subscription and payments</p>
                <a [routerLink]="['/settings/billing']" class="btn btn-outline-primary">
                  View Billing
                </a>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-bell fs-4 me-2 text-primary"></i>
                  <h5 class="card-title mb-0">Notifications</h5>
                </div>
                <p class="card-text text-muted">Configure your notification preferences</p>
                <a [routerLink]="['/settings/notifications']" class="btn btn-outline-primary">
                  View Notifications
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .card:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      transition: box-shadow 0.3s ease-in-out;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule]
})
export class SettingsDashboardComponent {}
