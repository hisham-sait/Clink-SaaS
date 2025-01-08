import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InviteUserModalComponent } from './modal/invite-user-modal.component';
import { AddUserModalComponent } from './modal/add-user-modal.component';
import { EditUserModalComponent } from './modal/edit-user-modal.component';
import { ViewUserModalComponent } from './modal/view-user-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { UserService } from '../../../services/settings/user.service';
import { User, Role, UserStatus } from '../settings.types';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    InviteUserModalComponent,
    AddUserModalComponent,
    EditUserModalComponent,
    ViewUserModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Error Alert -->
      <div class="alert alert-danger alert-dismissible fade show" role="alert" *ngIf="error">
        {{ error }}
        <button type="button" class="btn-close" (click)="error = null"></button>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content (only show when not loading) -->
      <ng-container *ngIf="!loading">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-2">Users</h1>
            <p class="text-muted mb-0">Manage users and their access permissions</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="openAddUserModal()">
              <i class="bi bi-person-plus"></i>
              <span>Add User</span>
            </button>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openInviteUserModal()">
              <i class="bi bi-envelope-plus"></i>
              <span>Invite User</span>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Total Users</span>
                  <i class="bi bi-people fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ users.length }}</h3>
                <small class="text-muted">All registered users</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Active Users</span>
                  <i class="bi bi-person-check fs-4 text-success"></i>
                </div>
                <h3 class="mb-0">{{ getActiveUsersCount() }}</h3>
                <small class="text-muted">Currently active users</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Pending Invites</span>
                  <i class="bi bi-envelope fs-4 text-warning"></i>
                </div>
                <h3 class="mb-0">{{ getPendingInvitesCount() }}</h3>
                <small class="text-muted">Awaiting acceptance</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Admins</span>
                  <i class="bi bi-shield-lock fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getAdminsCount() }}</h3>
                <small class="text-muted">Users with admin access</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">All Users</h5>
            <div class="d-flex gap-2">
              <div class="input-group">
                <span class="input-group-text border-end-0 bg-white">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  placeholder="Search users..."
                  [(ngModel)]="searchTerm"
                >
              </div>
              <select class="form-select w-auto" [(ngModel)]="filterRole">
                <option value="">All Roles</option>
                <option value="Super Administrator">Super Administrator</option>
                <option value="Administrator">Administrator</option>
                <option value="Billing Administrator">Billing Administrator</option>
                <option value="User Manager">User Manager</option>
              </select>
              <select class="form-select w-auto" [(ngModel)]="filterStatus">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">User</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Role</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Department</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Last Login</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of getFilteredUsers()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <div>
                        <a href="#" class="text-decoration-none" (click)="viewUser(user, $event)">
                          {{ getFullName(user) }}
                        </a>
                        <small class="d-block text-muted">{{ user.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.roles.length > 0 ? user.roles[0].name : 'No Role' }}</td>
                  <td>{{ user.department || 'Not assigned' }}</td>
                  <td>
                    <small class="text-muted">
                      {{ user.lastLogin ? (user.lastLogin | date:'medium') : 'Never' }}
                    </small>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusClass(user.status)">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewUser(user)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editUser(user)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="user.status === 'Active'"
                        (click)="suspendUser(user)" 
                        title="Suspend User"
                      >
                        <i class="bi bi-pause-circle"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="user.status === 'Suspended'"
                        (click)="activateUser(user)" 
                        title="Activate User"
                      >
                        <i class="bi bi-play-circle"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="user.status === 'Pending'"
                        (click)="resendInvite(user)" 
                        title="Resend Invite"
                      >
                        <i class="bi bi-envelope"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="deleteUser(user)" title="Delete">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredUsers().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No users found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  constructor(
    private modalService: NgbModal,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers()
      .pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          this.error = error.error?.message || 'Failed to load users. Please try again.';
          return of([]);
        })
      )
      .subscribe(users => {
        this.users = users;
        this.loading = false;
      });
  }

  getFullName(user: User): string {
    return [user.title, user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
  }

  getStatusClass(status: UserStatus): string {
    switch (status) {
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

  getActiveUsersCount(): number {
    return this.users.filter(u => u.status === 'Active').length;
  }

  getPendingInvitesCount(): number {
    return this.users.filter(u => u.status === 'Pending').length;
  }

  getAdminsCount(): number {
    return this.users.filter(u => u.roles.some(r => r.name === 'Super Administrator')).length;
  }

  getFilteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        this.getFullName(user).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.filterRole || user.roles.some(r => r.name === this.filterRole);
      const matchesStatus = !this.filterStatus || user.status === this.filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  openAddUserModal(): void {
    const modalRef = this.modalService.open(AddUserModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: Partial<User> & { password: string }) => {
        this.userService.createUser(result)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create user. Please try again.';
              console.error('Error creating user:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(user => {
            if (user) {
              this.users.push(user);
              this.loadUsers();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  openInviteUserModal(): void {
    const modalRef = this.modalService.open(InviteUserModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: { email: string; role: Role; department?: string; jobTitle?: string }) => {
        this.userService.inviteUser(result.email, result.role.id)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to invite user. Please try again.';
              console.error('Error inviting user:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(user => {
            if (user) {
              this.users.push(user);
              this.loadUsers();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewUser(user: User, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewUserModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.user = {...user};
    
    modalRef.result.then(
      (result: { action: string; user: User }) => {
        if (result?.action === 'edit') {
          this.editUser(result.user);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editUser(user: User): void {
    const modalRef = this.modalService.open(EditUserModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.user = {...user};
    
    modalRef.result.then(
      (updatedUser: User) => {
        this.userService.updateUser(user.id, updatedUser)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update user. Please try again.';
              console.error('Error updating user:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              const index = this.users.findIndex(u => u.id === user.id);
              this.users[index] = result;
              this.loadUsers();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Delete User';
    modalRef.componentInstance.message = `Are you sure you want to delete ${this.getFullName(user)}? This action cannot be undone.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.userService.deleteUser(user.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to delete user. Please try again.';
                console.error('Error deleting user:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(() => {
              const index = this.users.findIndex(u => u.id === user.id);
              this.users.splice(index, 1);
              this.loadUsers();
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  suspendUser(user: User): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Suspend User';
    modalRef.componentInstance.message = `Are you sure you want to suspend ${this.getFullName(user)}?`;
    modalRef.componentInstance.confirmButtonText = 'Suspend';
    modalRef.componentInstance.confirmButtonClass = 'btn-warning';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.userService.suspendUser(user.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to suspend user. Please try again.';
                console.error('Error suspending user:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.users.findIndex(u => u.id === user.id);
                this.users[index] = result;
                this.loadUsers();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  activateUser(user: User): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Activate User';
    modalRef.componentInstance.message = `Are you sure you want to activate ${this.getFullName(user)}?`;
    modalRef.componentInstance.confirmButtonText = 'Activate';
    modalRef.componentInstance.confirmButtonClass = 'btn-success';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.userService.activateUser(user.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to activate user. Please try again.';
                console.error('Error activating user:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.users.findIndex(u => u.id === user.id);
                this.users[index] = result;
                this.loadUsers();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  resendInvite(user: User): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Resend Invitation';
    modalRef.componentInstance.message = `Are you sure you want to resend the invitation to ${this.getFullName(user)}?`;
    modalRef.componentInstance.confirmButtonText = 'Resend';
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.userService.resendInvite(user.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to resend invitation. Please try again.';
                console.error('Error resending invitation:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(() => {
              this.loadUsers();
            });
        }
      },
      () => {} // Modal dismissed
    );
  }
}
