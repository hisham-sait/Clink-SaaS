import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

interface Director {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: 'Active' | 'Resigned';
}

@Component({
  selector: 'app-create-director-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New Director</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="directorForm" class="row g-3">
        <!-- Personal Details -->
        <div class="col-md-3">
          <select class="form-select" formControlName="title">
            <option value="">Select Title</option>
            <option *ngFor="let title of titles" [value]="title">{{ title }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control" formControlName="firstName" placeholder="First Name">
        </div>
        <div class="col-md-5">
          <input type="text" class="form-control" formControlName="lastName" placeholder="Last Name">
        </div>

        <div class="col-md-6">
          <input type="date" class="form-control" formControlName="dateOfBirth" placeholder="Date of Birth">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" formControlName="nationality" placeholder="Nationality">
        </div>

        <div class="col-12">
          <textarea class="form-control" formControlName="address" rows="2" placeholder="Address"></textarea>
        </div>

        <!-- Professional Details -->
        <div class="col-md-6">
          <select class="form-select" formControlName="directorType">
            <option value="">Select Type</option>
            <option *ngFor="let type of directorTypes" [value]="type">{{ type }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" formControlName="occupation" placeholder="Occupation">
        </div>

        <div class="col-md-6">
          <input type="date" class="form-control" formControlName="appointmentDate" placeholder="Appointment Date">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control" formControlName="shareholding" placeholder="Shareholding (optional)">
        </div>

        <div class="col-12">
          <textarea class="form-control" formControlName="otherDirectorships" rows="2" placeholder="Other Directorships (optional)"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!directorForm.valid">
        Add Director
      </button>
    </div>
  `
})
export class CreateDirectorModalComponent {
  directorForm: FormGroup;

  titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];
  directorTypes = [
    'Executive Director',
    'Non-Executive Director',
    'Managing Director',
    'Independent Director',
    'Alternate Director'
  ];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.directorForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      appointmentDate: [new Date().toISOString().split('T')[0], Validators.required],
      directorType: ['', Validators.required],
      occupation: ['', Validators.required],
      otherDirectorships: [''],
      shareholding: [''],
      status: ['Active']
    });
  }

  onSubmit(): void {
    if (this.directorForm.valid) {
      this.activeModal.close(this.directorForm.value);
    } else {
      Object.keys(this.directorForm.controls).forEach(key => {
        const control = this.directorForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
