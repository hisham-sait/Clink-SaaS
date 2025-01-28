import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AddRoleModalComponent } from './modal/add-role-modal.component';
import { EditRoleModalComponent } from './modal/edit-role-modal.component';
import { ViewRoleModalComponent } from './modal/view-role-modal.component';
import { ConfirmModalComponent } from '../users/modal/confirm-modal.component';

import { RoleService } from '../../../services/settings/role.service';
import { Role } from '../settings.types';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    AddRoleModalComponent,
    EditRoleModalComponent,
    ViewRoleModalComponent,
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
            <h1 class="h3 mb-2">Roles</h1>
            <p class="text-muted mb-0">Manage roles and permissions</p>
          </div>
          <div>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddRoleModal()">
              <i class="bi bi-shield-plus"></i>
              <span>Add Role</span>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Total Roles</span>
                  <i class="bi bi-shield fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ roles.length }}</h3>
                <small class="text-muted">All roles</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Active Roles</span>
                  <i class="bi bi-shield-check fs-4 text-success"></i>
                </div>
                <h3 class="mb-0">{{ getActiveRolesCount() }}</h3>
                <small class="text-muted">Currently active roles</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Custom Roles</span>
                  <i class="bi bi-shield-plus fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getCustomRolesCount() }}</h3>
                <small class="text-muted">User-defined roles</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">System Roles</span>
                  <i class="bi bi-shield-lock fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getSystemRolesCount() }}</h3>
                <small class="text-muted">Built-in roles</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles Table -->
        <div class="card">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">All Roles</h5>
            <div class="d-flex gap-2">
              <div class="input-group">
                <span class="input-group-text border-end-0 bg-white">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  placeholder="Search roles..."
                  [(ngModel)]="searchTerm"
                >
              </div>
              <select class="form-select w-auto" [(ngModel)]="filterStatus">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deprecated">Deprecated</option>
              </select>
              <select class="form-select w-auto" [(ngModel)]="filterScope">
                <option value="">All Scopes</option>
                <option value="Global">Global</option>
                <option value="Company">Company</option>
                <option value="Team">Team</option>
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">Role</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Scope</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Permissions</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Users</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let role of getFilteredRoles()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi" [class.bi-shield-lock]="role.isSystem" [class.bi-shield]="!role.isSystem" [class.text-secondary]="!role.isSystem" [class.text-primary]="role.isSystem"></i>
                      <div>
                        <a href="#" class="text-decoration-none" (click)="viewRole(role, $event)">
                          {{ role.name }}
                        </a>
                        <small class="d-block text-muted">{{ role.description }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ role.scope }}</td>
                  <td>{{ role.permissions.length }}</td>
                  <td>
                    <span class="text-muted">
                      {{ role.userCount || 0 }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusBadgeClass(role.status)">
                      {{ role.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewRole(role)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editRole(role)" title="Edit" [disabled]="role.isSystem">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="role.status === 'Active'"
                        (click)="deprecateRole(role)" 
                        title="Deprecate Role"
                        [disabled]="role.isSystem"
                      >
                        <i class="bi bi-archive"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="role.status === 'Deprecated'"
                        (click)="activateRole(role)" 
                        title="Activate Role"
                        [disabled]="role.isSystem"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="deleteRole(role)" title="Delete" [disabled]="role.isSystem">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredRoles().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No roles found
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
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterStatus = '';
  filterScope = '';

  constructor(
    private modalService: NgbModal,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = null;

    this.roleService.getRoles()
      .pipe(
        catchError(error => {
          console.error('Error loading roles:', error);
          this.error = error.error?.message || 'Failed to load roles. Please try again.';
          return of([]);
        })
      )
      .subscribe(roles => {
        this.roles = roles;
        this.loading = false;
      });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'text-bg-success';
      case 'Inactive':
        return 'text-bg-warning';
      case 'Deprecated':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  getActiveRolesCount(): number {
    return this.roles.filter(r => r.status === 'Active').length;
  }

  getCustomRolesCount(): number {
    return this.roles.filter(r => r.isCustom).length;
  }

  getSystemRolesCount(): number {
    return this.roles.filter(r => r.isSystem).length;
  }

  getFilteredRoles(): Role[] {
    return this.roles.filter(role => {
      const matchesSearch = !this.searchTerm || 
        role.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || role.status === this.filterStatus;
      const matchesScope = !this.filterScope || role.scope === this.filterScope;

      return matchesSearch && matchesStatus && matchesScope;
    });
  }

  openAddRoleModal(): void {
    const modalRef = this.modalService.open(AddRoleModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: Partial<Role>) => {
        this.roleService.createRole(result)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create role. Please try again.';
              console.error('Error creating role:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(role => {
            if (role) {
              this.roles.push(role);
              this.loadRoles();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewRole(role: Role, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewRoleModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.role = {...role};
    
    modalRef.result.then(
      (result: { action: string; role: Role }) => {
        if (result?.action === 'edit') {
          this.editRole(result.role);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editRole(role: Role): void {
    const modalRef = this.modalService.open(EditRoleModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.role = {...role};
    
    modalRef.result.then(
      (updatedRole: Role) => {
        this.roleService.updateRole(role.id, updatedRole)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update role. Please try again.';
              console.error('Error updating role:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              const index = this.roles.findIndex(r => r.id === role.id);
              this.roles[index] = result;
              this.loadRoles();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  deleteRole(role: Role): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Delete Role';
    modalRef.componentInstance.message = `Are you sure you want to delete ${role.name}? This action cannot be undone.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.roleService.deleteRole(role.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to delete role. Please try again.';
                console.error('Error deleting role:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(() => {
              const index = this.roles.findIndex(r => r.id === role.id);
              this.roles.splice(index, 1);
              this.loadRoles();
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  deprecateRole(role: Role): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Deprecate Role';
    modalRef.componentInstance.message = `Are you sure you want to deprecate ${role.name}?`;
    modalRef.componentInstance.confirmButtonText = 'Deprecate';
    modalRef.componentInstance.confirmButtonClass = 'btn-warning';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const updatedRole = { ...role, status: 'Deprecated' as const };
          this.roleService.updateRole(role.id, updatedRole)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to deprecate role. Please try again.';
                console.error('Error deprecating role:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.roles.findIndex(r => r.id === role.id);
                this.roles[index] = result;
                this.loadRoles();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  activateRole(role: Role): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Activate Role';
    modalRef.componentInstance.message = `Are you sure you want to activate ${role.name}?`;
    modalRef.componentInstance.confirmButtonText = 'Activate';
    modalRef.componentInstance.confirmButtonClass = 'btn-success';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const updatedRole = { ...role, status: 'Active' as const };
          this.roleService.updateRole(role.id, updatedRole)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to activate role. Please try again.';
                console.error('Error activating role:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.roles.findIndex(r => r.id === role.id);
                this.roles[index] = result;
                this.loadRoles();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }
}
