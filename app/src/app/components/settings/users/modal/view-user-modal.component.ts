import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../settings.types';

@Component({
  selector: 'app-view-user-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">User Details</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="text-center mb-4">
        <div class="avatar-placeholder mb-2">
          <i class="bi bi-person-circle fs-1 text-secondary"></i>
        </div>
        <h5 class="mb-1">{{ getFullName() }}</h5>
        <p class="text-muted mb-0">{{ user.roles.length > 0 ? user.roles[0].name : 'No Role' }}</p>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Personal Information</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Title</small>
                <span>{{ user.title || 'Not specified' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Email</small>
                <span>{{ user.email }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Phone</small>
                <span>{{ user.phone || 'Not specified' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Work Information</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Department</small>
                <span>{{ user.department || 'Not specified' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Job Title</small>
                <span>{{ user.jobTitle || 'Not specified' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Status</small>
                <span [class]="'badge ' + getStatusClass()">{{ user.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-3 text-muted">Account Information</h6>
              
              <div class="mb-2">
                <small class="text-muted d-block">Last Login</small>
                <span>{{ user.lastLogin ? (user.lastLogin | date:'medium') : 'Never' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Invited By</small>
                <span>{{ user.invitedBy || 'Not available' }}</span>
              </div>
              
              <div class="mb-2">
                <small class="text-muted d-block">Joined</small>
                <span>{{ user.joinedAt ? (user.joinedAt | date:'mediumDate') : 'Not joined yet' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">Edit User</button>
    </div>
  `,
  styles: [`
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 50%;
    }
  `]
})
export class ViewUserModalComponent {
  @Input() user!: User;

  constructor(public activeModal: NgbActiveModal) {}

  getFullName(): string {
    return [this.user.title, this.user.firstName, this.user.lastName]
      .filter(Boolean)
      .join(' ');
  }

  getStatusClass(): string {
    switch (this.user.status) {
      case 'Active':
        return 'text-bg-success';
      case 'Pending':
        return 'text-bg-warning';
      case 'Suspended':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', user: this.user });
  }
}
