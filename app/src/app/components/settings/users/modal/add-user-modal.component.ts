import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Role } from '../../settings.types';
import { RoleService } from '../../../../services/settings/role.service';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Add User</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="addForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="title" class="form-label">Title</label>
            <input
              type="text"
              class="form-control"
              id="title"
              formControlName="title"
              placeholder="e.g. Mr., Ms., Dr."
            />
          </div>

          <div class="col-md-4">
            <label for="firstName" class="form-label">First Name</label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              formControlName="firstName"
              placeholder="Enter first name"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('firstName')?.errors?.['required'] && addForm.get('firstName')?.touched">
              First name is required
            </div>
          </div>

          <div class="col-md-4">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              formControlName="lastName"
              placeholder="Enter last name"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('lastName')?.errors?.['required'] && addForm.get('lastName')?.touched">
              Last name is required
            </div>
          </div>

          <div class="col-md-6">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              class="form-control"
              id="email"
              formControlName="email"
              placeholder="Enter email address"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('email')?.errors?.['required'] && addForm.get('email')?.touched">
              Email is required
            </div>
            <div class="form-text text-danger" *ngIf="addForm.get('email')?.errors?.['email'] && addForm.get('email')?.touched">
              Please enter a valid email address
            </div>
          </div>

          <div class="col-md-6">
            <label for="phone" class="form-label">Phone Number</label>
            <input
              type="tel"
              class="form-control"
              id="phone"
              formControlName="phone"
              placeholder="Enter phone number"
            />
          </div>

          <div class="col-md-6">
            <label for="role" class="form-label">Role</label>
            <select class="form-select" id="role" formControlName="role">
              <option value="">Select a role</option>
              <option *ngFor="let role of availableRoles" [ngValue]="role">
                {{ role.name }}
              </option>
            </select>
            <div class="form-text text-danger" *ngIf="addForm.get('role')?.errors?.['required'] && addForm.get('role')?.touched">
              Role is required
            </div>
          </div>

          <div class="col-md-6">
            <label for="department" class="form-label">Department</label>
            <input
              type="text"
              class="form-control"
              id="department"
              formControlName="department"
              placeholder="Enter department"
            />
          </div>

          <div class="col-12">
            <label for="jobTitle" class="form-label">Job Title</label>
            <input
              type="text"
              class="form-control"
              id="jobTitle"
              formControlName="jobTitle"
              placeholder="Enter job title"
            />
          </div>

          <div class="col-md-6">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              formControlName="password"
              placeholder="Enter password"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('password')?.errors?.['required'] && addForm.get('password')?.touched">
              Password is required
            </div>
            <div class="form-text text-danger" *ngIf="addForm.get('password')?.errors?.['minlength'] && addForm.get('password')?.touched">
              Password must be at least 8 characters
            </div>
          </div>

          <div class="col-md-6">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              type="password"
              class="form-control"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm password"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('confirmPassword')?.errors?.['required'] && addForm.get('confirmPassword')?.touched">
              Please confirm password
            </div>
            <div class="form-text text-danger" *ngIf="addForm.errors?.['passwordMismatch'] && addForm.get('confirmPassword')?.touched">
              Passwords do not match
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!addForm.valid">
          Add User
        </button>
      </div>
    </form>
  `
})
export class AddUserModalComponent implements OnInit {
  addForm: FormGroup;
  availableRoles: Role[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.addForm = this.fb.group({
      title: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', Validators.required],
      department: [''],
      jobTitle: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Load available roles
    this.roleService.getRoles().subscribe(roles => {
      // Filter for active roles only
      this.availableRoles = roles.filter(role => role.status === 'Active');
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;
      const selectedRole = formValue.role;
      
      // Create user data with role object
      const userData = {
        ...formValue,
        roles: [selectedRole] // Use the actual role object
      };
      delete userData.role;
      delete userData.confirmPassword;

      this.activeModal.close(userData);
    }
  }
}
