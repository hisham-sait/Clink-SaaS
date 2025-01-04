import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationSettings } from '../../../../services/settings/settings.service';

@Component({
  selector: 'app-edit-organization-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Edit Organization</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Organization Details -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Organization Details</h6>
          <div class="row g-3">
            <div class="col-md-12">
              <div class="form-group">
                <label class="form-label">Organization Name</label>
                <input type="text" class="form-control" formControlName="name">
                <div class="form-text text-danger" *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']">
                  Organization name is required
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email">
                <div class="form-text text-danger" *ngIf="form.get('email')?.touched && form.get('email')?.errors?.['required']">
                  Email is required
                </div>
                <div class="form-text text-danger" *ngIf="form.get('email')?.touched && form.get('email')?.errors?.['email']">
                  Please enter a valid email
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-control" formControlName="phone">
                <div class="form-text text-danger" *ngIf="form.get('phone')?.touched && form.get('phone')?.errors?.['required']">
                  Phone number is required
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Website</label>
                <input type="url" class="form-control" formControlName="website">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Industry</label>
                <select class="form-select" formControlName="industry">
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Size</label>
                <select class="form-select" formControlName="size">
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Details -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Registration Details</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Tax Number</label>
                <input type="text" class="form-control" formControlName="taxNumber">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Registration Number</label>
                <input type="text" class="form-control" formControlName="registrationNumber">
              </div>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="mb-4">
          <h6 class="text-uppercase small fw-semibold text-secondary mb-3">Address</h6>
          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea class="form-control" rows="3" formControlName="address"></textarea>
            <div class="form-text text-danger" *ngIf="form.get('address')?.touched && form.get('address')?.errors?.['required']">
              Address is required
            </div>
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
export class EditOrganizationModalComponent implements OnInit {
  @Input() organization!: OrganizationSettings;
  form!: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.organization.name, Validators.required],
      email: [this.organization.email, [Validators.required, Validators.email]],
      phone: [this.organization.phone, Validators.required],
      website: [this.organization.website],
      industry: [this.organization.industry],
      size: [this.organization.size],
      taxNumber: [this.organization.taxNumber],
      registrationNumber: [this.organization.registrationNumber],
      address: [this.organization.address, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
  }
}
