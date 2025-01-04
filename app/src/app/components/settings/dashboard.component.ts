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

      <!-- Quick Actions -->
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

        <!-- Organization -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <i class="bi bi-building fs-4 me-2 text-primary"></i>
                <h5 class="card-title mb-0">Organization</h5>
              </div>
              <p class="card-text text-muted">Configure your organization details</p>
              <a [routerLink]="['/settings/organization']" class="btn btn-outline-primary">
                View Organization
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
