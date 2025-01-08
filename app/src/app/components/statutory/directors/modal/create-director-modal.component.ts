import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Director } from '../../statutory.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-director-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New Director</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="directorForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Company Selection -->
        <div class="mb-3">
          <label class="form-label">Company</label>
          <select class="form-select" formControlName="companyId">
            <option value="">Select Company</option>
            <option *ngFor="let company of companies" [value]="company.id">
              {{ company.name }}
            </option>
          </select>
          <div class="form-text text-danger" *ngIf="directorForm.get('companyId')?.touched && directorForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Personal Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <select class="form-select" formControlName="title">
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
            <option value="Prof">Prof</option>
          </select>
          <div class="form-text text-danger" *ngIf="directorForm.get('title')?.touched && directorForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" formControlName="firstName">
            <div class="form-text text-danger" *ngIf="directorForm.get('firstName')?.touched && directorForm.get('firstName')?.errors?.['required']">
              First name is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" formControlName="lastName">
            <div class="form-text text-danger" *ngIf="directorForm.get('lastName')?.touched && directorForm.get('lastName')?.errors?.['required']">
              Last name is required
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Date of Birth</label>
          <input type="date" class="form-control" formControlName="dateOfBirth">
          <div class="form-text text-danger" *ngIf="directorForm.get('dateOfBirth')?.touched && directorForm.get('dateOfBirth')?.errors?.['required']">
            Date of birth is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Nationality</label>
          <input type="text" class="form-control" formControlName="nationality">
          <div class="form-text text-danger" *ngIf="directorForm.get('nationality')?.touched && directorForm.get('nationality')?.errors?.['required']">
            Nationality is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Address</label>
          <textarea class="form-control" rows="3" formControlName="address"></textarea>
          <div class="form-text text-danger" *ngIf="directorForm.get('address')?.touched && directorForm.get('address')?.errors?.['required']">
            Address is required
          </div>
        </div>

        <!-- Professional Information -->
        <div class="mb-3">
          <label class="form-label">Director Type</label>
          <select class="form-select" formControlName="directorType">
            <option value="">Select Type</option>
            <option value="Executive Director">Executive Director</option>
            <option value="Managing Director">Managing Director</option>
            <option value="Non-Executive Director">Non-Executive Director</option>
            <option value="Independent Director">Independent Director</option>
          </select>
          <div class="form-text text-danger" *ngIf="directorForm.get('directorType')?.touched && directorForm.get('directorType')?.errors?.['required']">
            Director type is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Occupation</label>
          <input type="text" class="form-control" formControlName="occupation">
          <div class="form-text text-danger" *ngIf="directorForm.get('occupation')?.touched && directorForm.get('occupation')?.errors?.['required']">
            Occupation is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Other Directorships</label>
          <textarea class="form-control" rows="3" formControlName="otherDirectorships"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Shareholding</label>
          <input type="text" class="form-control" formControlName="shareholding">
        </div>

        <div class="mb-3">
          <label class="form-label">Appointment Date</label>
          <input type="date" class="form-control" formControlName="appointmentDate">
          <div class="form-text text-danger" *ngIf="directorForm.get('appointmentDate')?.touched && directorForm.get('appointmentDate')?.errors?.['required']">
            Appointment date is required
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!directorForm.valid">
          Add Director
        </button>
      </div>
    </form>
  `
})
export class CreateDirectorModalComponent {
  @Input() companies: Company[] = [];

  directorForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.directorForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      directorType: ['', Validators.required],
      occupation: ['', Validators.required],
      otherDirectorships: [''],
      shareholding: [''],
      appointmentDate: ['', Validators.required],
      status: ['Active']
    });
  }

  onSubmit(): void {
    if (this.directorForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.directorForm.get('companyId')?.value);
      if (selectedCompany) {
        const result = {
          company: selectedCompany,
          director: this.directorForm.value
        };
        this.activeModal.close(result);
      }
    }
  }
}
