import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { User, Role } from '../../settings.types';
import { RoleService } from '../../../../services/settings/role.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Edit User</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <input
            type="text"
            class="form-control"
            id="title"
            formControlName="title"
            placeholder="Enter title"
          />
        </div>

        <div class="mb-3">
          <label for="firstName" class="form-label">First Name</label>
          <input
            type="text"
            class="form-control"
            id="firstName"
            formControlName="firstName"
            placeholder="Enter first name"
          />
          <div class="form-text text-danger" *ngIf="editForm.get('firstName')?.errors?.['required'] && editForm.get('firstName')?.touched">
            First name is required
          </div>
        </div>

        <div class="mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            type="text"
            class="form-control"
            id="lastName"
            formControlName="lastName"
            placeholder="Enter last name"
          />
          <div class="form-text text-danger" *ngIf="editForm.get('lastName')?.errors?.['required'] && editForm.get('lastName')?.touched">
            Last name is required
          </div>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <input
            type="email"
            class="form-control"
            id="email"
            formControlName="email"
            placeholder="Enter email address"
            [readonly]="true"
          />
        </div>

        <div class="mb-3">
          <label for="phone" class="form-label">Phone Number</label>
          <input
            type="tel"
            class="form-control"
            id="phone"
            formControlName="phone"
            placeholder="Enter phone number"
          />
        </div>

        <div class="mb-3">
          <label for="role" class="form-label">Role</label>
          <select class="form-select" id="role" formControlName="role">
            <option value="">Select a role</option>
            <option *ngFor="let role of availableRoles" [ngValue]="role">
              {{ role.name }}
            </option>
          </select>
          <div class="form-text text-danger" *ngIf="editForm.get('role')?.errors?.['required'] && editForm.get('role')?.touched">
            Role is required
          </div>
        </div>

        <div class="mb-3">
          <label for="department" class="form-label">Department</label>
          <input
            type="text"
            class="form-control"
            id="department"
            formControlName="department"
            placeholder="Enter department"
          />
        </div>

        <div class="mb-3">
          <label for="jobTitle" class="form-label">Job Title</label>
          <input
            type="text"
            class="form-control"
            id="jobTitle"
            formControlName="jobTitle"
            placeholder="Enter job title"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!editForm.valid">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditUserModalComponent implements OnInit {
  @Input() user!: User;
  editForm: FormGroup;
  availableRoles: Role[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.editForm = this.fb.group({
      title: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      role: ['', Validators.required],
      department: [''],
      jobTitle: ['']
    });
  }

  ngOnInit(): void {
    // Load available roles
    this.roleService.getRoles().subscribe(roles => {
      // Filter for active roles only
      this.availableRoles = roles.filter(role => role.status === 'Active');
      
      // After roles are loaded, set the form values
      if (this.user) {
        // Find the matching role object from available roles
        const userRole = this.availableRoles.find(role => role.id === this.user.roles[0]?.id);
        
        this.editForm.patchValue({
          title: this.user.title,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          phone: this.user.phone,
          role: userRole || '', // Use the full role object
          department: this.user.department,
          jobTitle: this.user.jobTitle
        });
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.getRawValue();
      const selectedRole = formValue.role;

      // Create user data with role object
      const userData = {
        ...this.user,
        ...formValue,
        roles: [selectedRole] // Use the actual role object
      };
      delete userData.role;

      this.activeModal.close(userData);
    }
  }
}
