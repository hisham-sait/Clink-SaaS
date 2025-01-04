import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfile } from '../../../../services/settings/settings.service';

@Component({
  selector: 'app-edit-profile-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Edit Profile</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Personal Information -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Personal Information</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" formControlName="firstName">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" formControlName="lastName">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-control" formControlName="phone">
              </div>
            </div>
          </div>
        </div>

        <!-- Work Information -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Work Information</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Job Title</label>
                <input type="text" class="form-control" formControlName="jobTitle">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Department</label>
                <input type="text" class="form-control" formControlName="department">
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Bio</h6>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-control" rows="3" formControlName="bio"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!form.valid">Save Changes</button>
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
export class EditProfileModalComponent implements OnInit {
  @Input() profile!: UserProfile;
  form!: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [this.profile.firstName, Validators.required],
      lastName: [this.profile.lastName, Validators.required],
      email: [this.profile.email, [Validators.required, Validators.email]],
      phone: [this.profile.phone],
      jobTitle: [this.profile.jobTitle],
      department: [this.profile.department],
      bio: [this.profile.bio]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
  }
}
