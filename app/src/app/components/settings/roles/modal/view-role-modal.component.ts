import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Role, Permission } from '../../settings.types';
import { RoleService } from '../../../../services/settings/role.service';

@Component({
  selector: 'app-view-role-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Role Details</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <ng-container *ngIf="role">
      <div class="modal-body">
        <div class="text-center mb-4">
          <div class="avatar-placeholder mb-2">
            <i class="bi bi-shield-lock fs-1 text-secondary"></i>
          </div>
          <h5 class="mb-1">{{ role.name }}</h5>
          <p class="text-muted mb-2">{{ role.description }}</p>
          <div class="d-flex justify-content-center gap-2">
            <span class="badge text-bg-primary">{{ role.scope }}</span>
            <span [class]="'badge ' + getStatusBadgeClass()">{{ role.status }}</span>
            <span class="badge text-bg-secondary" *ngIf="role.isSystem">System Role</span>
            <span class="badge text-bg-info" *ngIf="role.isCustom">Custom Role</span>
          </div>
        </div>

        <!-- Loading State -->
        <div class="text-center py-4" *ngIf="loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Usage Stats -->
        <div class="mb-4" *ngIf="!loading">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted d-block">Total Users</small>
                      <h3 class="mb-0">{{ getTotalUsers() }}</h3>
                    </div>
                    <i class="bi bi-people fs-4 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted d-block">Active Users</small>
                      <h3 class="mb-0">{{ getActiveUsers() }}</h3>
                    </div>
                    <i class="bi bi-person-check fs-4 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted d-block">Last Assigned</small>
                      <h3 class="mb-0">{{ formatLastAssigned() }}</h3>
                    </div>
                    <i class="bi bi-calendar-check fs-4 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <ng-container *ngIf="role.permissions">
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="text-muted mb-0">Permissions</h6>
              <div class="badge bg-primary">
                {{ getPermissionsCount() }} Permissions
              </div>
            </div>
            
            <div class="accordion" id="permissionsAccordion">
              <div class="accordion-item" *ngFor="let module of getModules()">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" 
                          [attr.data-bs-target]="'#' + module + 'Collapse'"
                          data-bs-toggle="collapse">
                    <div class="d-flex justify-content-between align-items-center w-100 me-3">
                      <span>{{ module | titlecase }} Permissions</span>
                      <small class="badge bg-primary">
                        {{ getModulePermissions(module).length }}
                      </small>
                    </div>
                  </button>
                </h2>
                <div [id]="module + 'Collapse'" class="accordion-collapse collapse" 
                     [attr.data-bs-parent]="'#permissionsAccordion'">
                  <div class="accordion-body">
                    <div class="list-group">
                      <div class="list-group-item" *ngFor="let permission of getModulePermissions(module)">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <div>{{ permission.name }}</div>
                            <small class="text-muted">{{ permission.description }}</small>
                          </div>
                          <span class="badge" [class]="getAccessLevelBadgeClass(permission.accessLevel)">
                            {{ permission.accessLevel }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Additional Details -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Additional Details</h6>
          
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-body">
                  <small class="text-muted d-block">Created</small>
                  <span>{{ role.createdAt | date:'medium' }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-body">
                  <small class="text-muted d-block">Last Updated</small>
                  <span>{{ role.updatedAt | date:'medium' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-3" *ngIf="getMaxUsers()">
            <div class="card">
              <div class="card-body">
                <small class="text-muted d-block">Maximum Users</small>
                <span>{{ getMaxUsers() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Close</button>
        <button type="button" class="btn btn-primary" (click)="onEdit()" [disabled]="role.isSystem">
          Edit Role
        </button>
      </div>
    </ng-container>
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
export class ViewRoleModalComponent implements OnInit {
  @Input() role!: Role;
  roleStats?: {
    totalUsers: number;
    activeUsers: number;
    lastAssigned: string;
  };
  loading = true;

  constructor(
    public activeModal: NgbActiveModal,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    // Load role stats
    this.roleService.getRoleUsageStats(this.role.id).subscribe(stats => {
      this.roleStats = stats;
      this.loading = false;
    });
  }

  getTotalUsers(): number {
    return this.roleStats?.totalUsers ?? 0;
  }

  getActiveUsers(): number {
    return this.roleStats?.activeUsers ?? 0;
  }

  formatLastAssigned(): string {
    if (!this.roleStats?.lastAssigned) {
      return 'Never';
    }
    return new Date(this.roleStats.lastAssigned).toLocaleDateString();
  }

  getPermissionsCount(): number {
    return this.role?.permissions?.length ?? 0;
  }

  getModules(): string[] {
    return [...new Set(this.role?.permissions?.map(p => p.module) ?? [])];
  }

  getModulePermissions(module: string): Permission[] {
    return this.role?.permissions?.filter(p => p.module === module) ?? [];
  }

  getMaxUsers(): number | undefined {
    return this.role?.metadata?.maxUsers;
  }

  getStatusBadgeClass(): string {
    switch (this.role?.status) {
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

  getAccessLevelBadgeClass(level: string): string {
    switch (level) {
      case 'Admin':
        return 'bg-danger';
      case 'Write':
        return 'bg-warning';
      case 'Read':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', role: this.role });
  }
}
