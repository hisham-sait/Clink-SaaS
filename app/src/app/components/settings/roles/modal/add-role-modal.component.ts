import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { RoleTemplate, Permission, RoleScope } from '../../settings.types';
import { RoleService } from '../../../../services/settings/role.service';

@Component({
  selector: 'app-add-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, NgbAccordionModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Add Role</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="addForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Creation Method -->
        <div class="mb-4">
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" name="creationMethod" id="fromScratch" 
                   [value]="'scratch'" formControlName="creationMethod">
            <label class="btn btn-outline-primary" for="fromScratch">
              <i class="bi bi-plus-circle me-2"></i>
              Create from Scratch
            </label>

            <input type="radio" class="btn-check" name="creationMethod" id="fromTemplate" 
                   [value]="'template'" formControlName="creationMethod">
            <label class="btn btn-outline-primary" for="fromTemplate">
              <i class="bi bi-file-earmark-text me-2"></i>
              Use Template
            </label>
          </div>
        </div>

        <!-- Template Selection (shown when 'Use Template' is selected) -->
        <div class="mb-4" *ngIf="addForm.get('creationMethod')?.value === 'template'">
          <label class="form-label">Select Template</label>
          <div class="list-group">
            <button type="button" *ngFor="let template of roleTemplates"
                    class="list-group-item list-group-item-action"
                    [class.active]="addForm.get('templateId')?.value === template.id"
                    (click)="selectTemplate(template)">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ template.name }}</h6>
                  <p class="mb-1 small text-muted">{{ template.description }}</p>
                </div>
                <i class="bi bi-check-lg" *ngIf="addForm.get('templateId')?.value === template.id"></i>
              </div>
            </button>
          </div>
        </div>

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
            />
            <div class="form-text text-danger" *ngIf="addForm.get('name')?.errors?.['required'] && addForm.get('name')?.touched">
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
            <div class="form-text text-danger" *ngIf="addForm.get('description')?.errors?.['required'] && addForm.get('description')?.touched">
              Description is required
            </div>
          </div>

          <div class="mb-3">
            <label for="scope" class="form-label">Scope</label>
            <select class="form-select" id="scope" formControlName="scope">
              <option value="Global">Global</option>
              <option value="Company">Company</option>
              <option value="Team">Team</option>
            </select>
          </div>
        </div>

        <!-- Permissions -->
        <div class="mb-4" *ngIf="addForm.get('creationMethod')?.value === 'scratch'">
          <h6 class="text-muted mb-3">Permissions</h6>
          
          <ngb-accordion>
            <ngb-panel *ngFor="let module of getModules()" [id]="module">
              <ng-template ngbPanelTitle>
                {{ module | titlecase }} Permissions
              </ng-template>
              <ng-template ngbPanelContent>
                <div class="list-group" formGroupName="permissions">
                  <div class="list-group-item" *ngFor="let permission of getModulePermissions(module)">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox"
                             [id]="permission.code"
                             [formControlName]="permission.code">
                      <label class="form-check-label" [for]="permission.code">
                        <div>{{ permission.name }}</div>
                        <small class="text-muted">{{ permission.description }}</small>
                      </label>
                    </div>
                  </div>
                </div>
              </ng-template>
            </ngb-panel>
          </ngb-accordion>
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
            <input class="form-check-input" type="checkbox" id="isCustom" formControlName="isCustom">
            <label class="form-check-label" for="isCustom">
              Custom Role
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!addForm.valid">
          Create Role
        </button>
      </div>
    </form>
  `
})
export class AddRoleModalComponent implements OnInit {
  addForm: FormGroup;
  roleTemplates: RoleTemplate[] = [];
  allPermissions: Permission[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    // Load all permissions first
    this.allPermissions = this.roleService.getAllPermissions();

    // Create permission controls
    const permissionControls: { [key: string]: any } = {};
    this.allPermissions.forEach(permission => {
      permissionControls[permission.code] = [false];
    });

    // Initialize form with all controls
    this.addForm = this.fb.group({
      creationMethod: ['scratch', Validators.required],
      templateId: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      scope: ['Company', Validators.required],
      maxUsers: [null],
      isCustom: [true],
      permissions: this.fb.group(permissionControls)
    });

    // Update form when creation method changes
    this.addForm.get('creationMethod')?.valueChanges.subscribe(method => {
      if (method === 'template') {
        this.addForm.get('templateId')?.setValidators(Validators.required);
      } else {
        this.addForm.get('templateId')?.clearValidators();
      }
      this.addForm.get('templateId')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Load role templates
    this.roleService.getRoleTemplates().subscribe(templates => {
      this.roleTemplates = templates;
    });
  }

  selectTemplate(template: RoleTemplate): void {
    this.addForm.patchValue({
      templateId: template.id,
      name: template.name,
      description: template.description
    });
  }

  getModules(): string[] {
    return [...new Set(this.allPermissions.map(p => p.module))];
  }

  getModulePermissions(module: string): Permission[] {
    return this.allPermissions.filter(p => p.module === module);
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;
      
      if (formValue.creationMethod === 'template') {
        // Create role from template
        this.roleService.createRoleFromTemplate(formValue.templateId)
          .subscribe(role => {
            this.activeModal.close(role);
          });
      } else {
        // Create custom role
        const selectedPermissions = this.allPermissions.filter(
          p => formValue.permissions[p.code]
        );

        const role = {
          name: formValue.name,
          description: formValue.description,
          scope: formValue.scope as RoleScope,
          permissions: selectedPermissions,
          status: 'Active',
          isCustom: formValue.isCustom,
          isSystem: false,
          metadata: {
            maxUsers: formValue.maxUsers
          }
        };

        this.activeModal.close(role);
      }
    }
  }
}
