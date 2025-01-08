import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Role, Permission, RoleScope } from '../../settings.types';
import { RoleService } from '../../../../services/settings/role.service';

@Component({
  selector: 'app-edit-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Edit Role</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Basic Information -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Basic Information</h6>
          
          <div class="mb-3">
            <label for="name" class="form-label">Role Name</label>
            <input
              type="text"
              class="form-control"
              id="name"
              formControlName="name"
              placeholder="Enter role name"
              [readonly]="role.isSystem"
            />
            <div class="form-text text-danger" *ngIf="editForm.get('name')?.errors?.['required'] && editForm.get('name')?.touched">
              Role name is required
            </div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea
              class="form-control"
              id="description"
              formControlName="description"
              rows="3"
              placeholder="Enter role description"
            ></textarea>
            <div class="form-text text-danger" *ngIf="editForm.get('description')?.errors?.['required'] && editForm.get('description')?.touched">
              Description is required
            </div>
          </div>

          <div class="mb-3">
            <label for="scope" class="form-label">Scope</label>
            <select class="form-select" id="scope" formControlName="scope" [disabled]="role.isSystem">
              <option value="Global">Global</option>
              <option value="Company">Company</option>
              <option value="Team">Team</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="status" class="form-label">Status</label>
            <select class="form-select" id="status" formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Deprecated">Deprecated</option>
            </select>
          </div>
        </div>

        <!-- Permissions -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-muted mb-0">Permissions</h6>
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-primary" (click)="selectAllPermissions()">
                Select All
              </button>
              <button type="button" class="btn btn-outline-primary" (click)="clearAllPermissions()">
                Clear All
              </button>
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
                      {{ getSelectedPermissionCount(module) }}/{{ getModulePermissions(module).length }}
                    </small>
                  </div>
                </button>
              </h2>
              <div [id]="module + 'Collapse'" class="accordion-collapse collapse" 
                   [attr.data-bs-parent]="'#permissionsAccordion'">
                <div class="accordion-body">
                  <div class="list-group">
                    <div class="list-group-item" *ngFor="let permission of getModulePermissions(module)">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox"
                               [id]="permission.id"
                               [formControlName]="permission.id"
                               [disabled]="role.isSystem">
                        <label class="form-check-label" [for]="permission.id">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <div>{{ permission.name }}</div>
                              <small class="text-muted">{{ permission.description }}</small>
                            </div>
                            <span class="badge" [class]="getAccessLevelBadgeClass(permission.accessLevel)">
                              {{ permission.accessLevel }}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">Additional Settings</h6>
          
          <div class="mb-3">
            <label for="maxUsers" class="form-label">Maximum Users</label>
            <input
              type="number"
              class="form-control"
              id="maxUsers"
              formControlName="maxUsers"
              placeholder="Enter maximum number of users"
            />
          </div>

          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="isCustom" formControlName="isCustom" [disabled]="role.isSystem">
            <label class="form-check-label" for="isCustom">
              Custom Role
            </label>
          </div>
        </div>

        <!-- Usage Stats -->
        <div class="mb-4" *ngIf="roleStats">
          <h6 class="text-muted mb-3">Usage Statistics</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted">Total Users</small>
                      <h5 class="mb-0">{{ roleStats.totalUsers }}</h5>
                    </div>
                    <i class="bi bi-people fs-4 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted">Active Users</small>
                      <h5 class="mb-0">{{ roleStats.activeUsers }}</h5>
                    </div>
                    <i class="bi bi-person-check fs-4 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted">Last Assigned</small>
                      <h5 class="mb-0">{{ roleStats.lastAssigned | date:'shortDate' }}</h5>
                    </div>
                    <i class="bi bi-calendar-check fs-4 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!editForm.valid || role.isSystem">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditRoleModalComponent implements OnInit {
  @Input() role!: Role;
  editForm: FormGroup;
  allPermissions: Permission[] = [];
  roleStats?: {
    totalUsers: number;
    activeUsers: number;
    lastAssigned: string;
  };

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      scope: ['Company', Validators.required],
      status: ['Active', Validators.required],
      maxUsers: [null],
      isCustom: [true],
      // Permission controls will be added dynamically
    });
  }

  ngOnInit(): void {
    // Load all permissions and create form controls
    this.allPermissions = this.roleService.getAllPermissions();
    const permissionControls: { [key: string]: any } = {};
    this.allPermissions.forEach(permission => {
      permissionControls[permission.id] = [false];
    });
    this.editForm.addControl('permissions', this.fb.group(permissionControls));

    // Load role stats
    this.roleService.getRoleUsageStats(this.role.id).subscribe(stats => {
      this.roleStats = stats;
    });

    // Populate form with role data
    this.editForm.patchValue({
      name: this.role.name,
      description: this.role.description,
      scope: this.role.scope,
      status: this.role.status,
      isCustom: this.role.isCustom,
      maxUsers: this.role.metadata?.maxUsers
    });

    // Set permission checkboxes
    const permissions = this.fb.group({});
    this.allPermissions.forEach(permission => {
      permissions.addControl(
        permission.id,
        this.fb.control(this.role.permissions.some(p => p.id === permission.id))
      );
    });
    this.editForm.setControl('permissions', permissions);
  }

  getModules(): string[] {
    return [...new Set(this.allPermissions.map(p => p.module))];
  }

  getModulePermissions(module: string): Permission[] {
    return this.allPermissions.filter(p => p.module === module);
  }

  getSelectedPermissionCount(module: string): number {
    return this.getModulePermissions(module).filter(
      p => this.editForm.get('permissions')?.get(p.id)?.value
    ).length;
  }

  selectAllPermissions(): void {
    const permissions = this.editForm.get('permissions');
    if (permissions) {
      Object.keys(permissions.value).forEach(key => {
        permissions.get(key)?.setValue(true);
      });
    }
  }

  clearAllPermissions(): void {
    const permissions = this.editForm.get('permissions');
    if (permissions) {
      Object.keys(permissions.value).forEach(key => {
        permissions.get(key)?.setValue(false);
      });
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

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      
      // Get selected permissions
      const selectedPermissions = this.allPermissions.filter(
        p => formValue.permissions[p.id]
      );

      const updatedRole = {
        ...this.role,
        name: formValue.name,
        description: formValue.description,
        scope: formValue.scope as RoleScope,
        status: formValue.status,
        permissions: selectedPermissions,
        isCustom: formValue.isCustom,
        metadata: {
          ...this.role.metadata,
          maxUsers: formValue.maxUsers
        }
      };

      this.activeModal.close(updatedRole);
    }
  }
}
