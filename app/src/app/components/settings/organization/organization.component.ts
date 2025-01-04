import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditOrganizationModalComponent } from './modal/edit-organization-modal.component';
import { SettingsService, OrganizationSettings } from '../../../services/settings/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings-organization',
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Organization Settings</h1>
          <p class="text-muted mb-0">Configure your organization details</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openEditModal()">
            <i class="bi bi-pencil"></i>
            <span>Edit Organization</span>
          </button>
        </div>
      </div>

      <!-- Organization Details -->
      <div class="card mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Organization Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Organization Name</label>
                <p class="mb-0">{{ organization?.name }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Email</label>
                <p class="mb-0">{{ organization?.email }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Phone</label>
                <p class="mb-0">{{ organization?.phone }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Website</label>
                <p class="mb-0">{{ organization?.website || 'Not provided' }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Industry</label>
                <p class="mb-0">{{ organization?.industry || 'Not provided' }}</p>
              </div>
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Size</label>
                <p class="mb-0">{{ organization?.size || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Details -->
      <div class="card mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Registration Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Tax Number</label>
                <p class="mb-0">{{ organization?.taxNumber || 'Not provided' }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-4">
                <label class="text-uppercase small fw-semibold text-secondary mb-2">Registration Number</label>
                <p class="mb-0">{{ organization?.registrationNumber || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="card">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Address</h5>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ organization?.address || 'No address provided' }}</p>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, EditOrganizationModalComponent]
})
export class SettingsOrganizationComponent implements OnInit, OnDestroy {
  organization: OrganizationSettings | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getOrganization()
      .pipe(takeUntil(this.destroy$))
      .subscribe((organization: OrganizationSettings) => {
        this.organization = organization;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openEditModal(): void {
    if (!this.organization) return;

    const modalRef = this.modalService.open(EditOrganizationModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.organization = { ...this.organization };

    modalRef.result.then(
      (result: OrganizationSettings) => {
        if (result) {
          this.settingsService.updateOrganization(result).subscribe(
            (updated: OrganizationSettings) => {
              this.organization = updated;
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
