import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordModalComponent } from './modal/change-password-modal.component';
import { SettingsService, SecuritySettings } from '../../../services/settings/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings-security',
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Security Settings</h1>
          <p class="text-muted mb-0">Manage your password and security settings</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openChangePasswordModal()">
            <i class="bi bi-key"></i>
            <span>Change Password</span>
          </button>
        </div>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="card mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Two-Factor Authentication</h5>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-0">{{ security?.twoFactorEnabled ? 'Enabled' : 'Disabled' }}</p>
              <small class="text-muted">Last updated: {{ security?.lastPasswordChange | date:'medium' }}</small>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" [checked]="security?.twoFactorEnabled" (change)="toggleTwoFactor($event)">
            </div>
          </div>
        </div>
      </div>

      <!-- Session Settings -->
      <div class="card mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Session Settings</h5>
        </div>
        <div class="card-body">
          <div class="mb-4">
            <label class="text-uppercase small fw-semibold text-secondary mb-2">Session Timeout</label>
            <p class="mb-0">{{ security?.sessionTimeout }} minutes</p>
          </div>
        </div>
      </div>

      <!-- Login History -->
      <div class="card">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Login History</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>IP Address</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let login of security?.loginHistory">
                  <td>{{ login.date | date:'medium' }}</td>
                  <td>{{ login.ip }}</td>
                  <td>{{ login.device }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, ChangePasswordModalComponent]
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
  security: SecuritySettings | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSecuritySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((security: SecuritySettings) => {
        this.security = security;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openChangePasswordModal(): void {
    const modalRef = this.modalService.open(ChangePasswordModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: { currentPassword: string; newPassword: string }) => {
        if (result) {
          // TODO: Implement password change
          console.log('Password change requested:', result);
        }
      },
      (reason: string) => {
        console.log('Modal dismissed');
      }
    );
  }

  toggleTwoFactor(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    if (this.security) {
      this.settingsService.updateSecuritySettings({
        ...this.security,
        twoFactorEnabled: enabled
      }).subscribe(
        (updated: SecuritySettings) => {
          this.security = updated;
        }
      );
    }
  }
}
