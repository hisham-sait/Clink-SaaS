import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-change-password-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Change Password</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Current Password -->
        <div class="mb-4">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" class="form-control" formControlName="currentPassword">
            <div class="form-text text-danger" *ngIf="form.get('currentPassword')?.touched && form.get('currentPassword')?.errors?.['required']">
              Current password is required
            </div>
          </div>
        </div>

        <!-- New Password -->
        <div class="mb-4">
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" formControlName="newPassword">
            <div class="form-text text-danger" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.errors?.['required']">
              New password is required
            </div>
            <div class="form-text text-danger" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.errors?.['minlength']">
              Password must be at least 8 characters
            </div>
            <div class="form-text text-danger" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.errors?.['pattern']">
              Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
            </div>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-control" formControlName="confirmPassword">
            <div class="form-text text-danger" *ngIf="form.get('confirmPassword')?.touched && form.get('confirmPassword')?.errors?.['required']">
              Password confirmation is required
            </div>
            <div class="form-text text-danger" *ngIf="form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']">
              Passwords do not match
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!form.valid">Change Password</button>
      </div>
    </form>
  `,
  styles: [`
    .form-label {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule]
})
export class ChangePasswordModalComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { currentPassword, newPassword } = this.form.value;
      this.activeModal.close({ currentPassword, newPassword });
    }
  }
}
