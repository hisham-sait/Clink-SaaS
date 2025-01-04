import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileModalComponent } from './modal/edit-profile-modal.component';
import { SettingsService, UserProfile } from '../../../services/settings/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings-profile',
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Profile Settings</h1>
          <p class="text-muted mb-0">Manage your personal information and preferences</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openEditModal()">
            <i class="bi bi-pencil"></i>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="card mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Personal Information</h5>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">First Name</label>
                <p class="mb-0">{{ profile?.firstName }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Last Name</label>
                <p class="mb-0">{{ profile?.lastName }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Email</label>
                <p class="mb-0">{{ profile?.email }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Phone</label>
                <p class="mb-0">{{ profile?.phone || 'Not provided' }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Job Title</label>
                <p class="mb-0">{{ profile?.jobTitle || 'Not provided' }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Department</label>
                <p class="mb-0">{{ profile?.department || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="card">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Bio</h5>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ profile?.bio || 'No bio provided' }}</p>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, EditProfileModalComponent]
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile: UserProfile) => {
        this.profile = profile;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openEditModal(): void {
    if (!this.profile) return;

    const modalRef = this.modalService.open(EditProfileModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.profile = { ...this.profile };

    modalRef.result.then(
      (result: UserProfile) => {
        if (result) {
          this.settingsService.updateProfile(result).subscribe(
            (updated: UserProfile) => {
              this.profile = updated;
            }
          );
        }
      },
      (reason: string) => {
        console.log('Modal dismissed');
      }
    );
  }
}
