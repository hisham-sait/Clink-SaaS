import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CompanyService } from '../../../../services/settings/company.service';
import { Director } from '../../statutory.types';
import type { Company } from '../../../../components/settings/settings.types';

@Component({
  selector: 'app-edit-director-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Director</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="directorForm" class="row g-3">
        <!-- Company Selection -->
        <div class="col-12">
          <label class="form-label">Company</label>
          <select class="form-select" formControlName="companyId">
            <option value="">Select Company</option>
            <option *ngFor="let company of companies" [value]="company.id">{{ company.name }}</option>
          </select>
          <div class="invalid-feedback" [class.d-block]="directorForm.get('companyId')?.touched && directorForm.get('companyId')?.invalid">
            Please select a company
          </div>
        </div>

        <!-- Personal Details -->
        <div class="col-md-3">
          <label class="form-label">Title</label>
          <select class="form-select" formControlName="title">
            <option value="">Select Title</option>
            <option *ngFor="let title of titles" [value]="title">{{ title }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">First Name</label>
          <input type="text" class="form-control" formControlName="firstName" placeholder="First Name">
        </div>
        <div class="col-md-5">
          <label class="form-label">Last Name</label>
          <input type="text" class="form-control" formControlName="lastName" placeholder="Last Name">
        </div>

        <div class="col-md-6">
          <label class="form-label">Date of Birth</label>
          <input type="date" class="form-control" formControlName="dateOfBirth">
        </div>
        <div class="col-md-6">
          <label class="form-label">Nationality</label>
          <input type="text" class="form-control" formControlName="nationality" placeholder="Nationality">
        </div>

        <div class="col-12">
          <label class="form-label">Address</label>
          <textarea class="form-control" formControlName="address" rows="2" placeholder="Address"></textarea>
        </div>

        <!-- Professional Details -->
        <div class="col-md-6">
          <label class="form-label">Director Type</label>
          <select class="form-select" formControlName="directorType">
            <option value="">Select Type</option>
            <option *ngFor="let type of directorTypes" [value]="type">{{ type }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Occupation</label>
          <input type="text" class="form-control" formControlName="occupation" placeholder="Occupation">
        </div>

        <div class="col-md-6">
          <label class="form-label">Appointment Date</label>
          <input type="date" class="form-control" formControlName="appointmentDate">
        </div>
        <div class="col-md-6">
          <label class="form-label">Shareholding</label>
          <input type="text" class="form-control" formControlName="shareholding" placeholder="Shareholding (optional)">
        </div>

        <div class="col-12">
          <label class="form-label">Other Directorships</label>
          <textarea class="form-control" formControlName="otherDirectorships" rows="2" placeholder="Other Directorships (optional)"></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!directorForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditDirectorModalComponent implements OnInit {
  @Input() director!: Director;
  directorForm: FormGroup;
  companies: Company[] = [];

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
    public activeModal: NgbActiveModal,
    private companyService: CompanyService
  ) {
    this.directorForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      directorType: ['', Validators.required],
      occupation: ['', Validators.required],
      otherDirectorships: [''],
      shareholding: [''],
      status: ['Active']
    });
  }

  ngOnInit(): void {
    // Load companies
    this.companyService.getCompanies().subscribe(
      companies => {
        this.companies = companies;
        
        if (this.director) {
          // Set form values including company
          this.directorForm.patchValue({
            ...this.director,
            companyId: this.director.companyId,
            dateOfBirth: new Date(this.director.dateOfBirth).toISOString().split('T')[0],
            appointmentDate: new Date(this.director.appointmentDate).toISOString().split('T')[0]
          });
        }
      }
    );
  }

  onSubmit(): void {
    if (this.directorForm.valid) {
      const formValue = this.directorForm.value;
      const company = this.companies.find(c => c.id === formValue.companyId);
      
      const updatedDirector: Director = {
        ...this.director,
        ...formValue,
        company: company
      };
      
      this.activeModal.close(updatedDirector);
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
