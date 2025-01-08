import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Role } from '../../settings.types';

@Component({
  selector: 'app-invite-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Invite User</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="inviteForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <input
            type="email"
            class="form-control"
            id="email"
            formControlName="email"
            placeholder="Enter email address"
          />
          <div class="form-text text-danger" *ngIf="inviteForm.get('email')?.errors?.['required'] && inviteForm.get('email')?.touched">
            Email is required
          </div>
          <div class="form-text text-danger" *ngIf="inviteForm.get('email')?.errors?.['email'] && inviteForm.get('email')?.touched">
            Please enter a valid email address
          </div>
        </div>

        <div class="mb-3">
          <label for="role" class="form-label">Role</label>
          <select class="form-select" id="role" formControlName="role">
            <option value="">Select a role</option>
            <option value="Super Administrator">Super Administrator</option>
            <option value="Administrator">Administrator</option>
            <option value="Billing Administrator">Billing Administrator</option>
            <option value="User Manager">User Manager</option>
          </select>
          <div class="form-text text-danger" *ngIf="inviteForm.get('role')?.errors?.['required'] && inviteForm.get('role')?.touched">
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
        <button type="submit" class="btn btn-primary" [disabled]="!inviteForm.valid">
          Send Invitation
        </button>
      </div>
    </form>
  `
})
export class InviteUserModalComponent {
  inviteForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: [''],
      jobTitle: ['']
    });
  }

  onSubmit(): void {
    if (this.inviteForm.valid) {
      const formValue = this.inviteForm.value;
      const selectedRole = formValue.role;

      // Create role object
      const role: Role = {
        id: selectedRole,
        name: selectedRole,
        description: '',
        scope: 'Company',
        permissions: [],
        status: 'Active',
        isCustom: false,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          allowedModules: []
        }
      };

      // Return the form data with role object
      this.activeModal.close({
        email: formValue.email,
        role,
        department: formValue.department,
        jobTitle: formValue.jobTitle
      });
    }
  }
}
