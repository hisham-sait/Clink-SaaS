import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CompanyType, CompanyTag, Currency, CompanyStatus, Address, Company } from '../../settings.types';
import { CompanyService } from '../../../../services/settings/company.service';

@Component({
  selector: 'app-add-company-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Add Company</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <form [formGroup]="addForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <div class="text-muted small mb-3">Fields marked with an asterisk (*) are required</div>
        <div class="row g-3">
          <!-- Basic Information -->
          <div class="col-12">
            <h6 class="text-muted mb-3">Basic Information</h6>
          </div>

          <div class="col-md-6">
            <label for="name" class="form-label">Company Name *</label>
            <input
              type="text"
              class="form-control"
              id="name"
              formControlName="name"
              placeholder="Enter company name"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('name')?.errors?.['required'] && addForm.get('name')?.touched">
              Company name is required
            </div>
          </div>

          <div class="col-md-6">
            <label for="legalName" class="form-label">Legal Name *</label>
            <input
              type="text"
              class="form-control"
              id="legalName"
              formControlName="legalName"
              placeholder="Enter legal name"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('legalName')?.errors?.['required'] && addForm.get('legalName')?.touched">
              Legal name is required
            </div>
          </div>

          <div class="col-md-6">
            <label for="registrationNumber" class="form-label">Registration Number *</label>
            <input
              type="text"
              class="form-control"
              id="registrationNumber"
              formControlName="registrationNumber"
              placeholder="Enter registration number"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('registrationNumber')?.errors?.['required'] && addForm.get('registrationNumber')?.touched">
              Registration number is required
            </div>
          </div>

          <div class="col-md-6">
            <label for="vatNumber" class="form-label">VAT Number</label>
            <input
              type="text"
              class="form-control"
              id="vatNumber"
              formControlName="vatNumber"
              placeholder="Enter VAT number"
            />
          </div>

          <!-- Contact Information -->
          <div class="col-12">
            <h6 class="text-muted mb-3 mt-2">Contact Information</h6>
          </div>

          <div class="col-md-6">
            <label for="email" class="form-label">Email Address *</label>
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
            <label for="phone" class="form-label">Phone Number *</label>
            <input
              type="tel"
              class="form-control"
              id="phone"
              formControlName="phone"
              placeholder="Enter phone number"
            />
            <div class="form-text text-danger" *ngIf="addForm.get('phone')?.errors?.['required'] && addForm.get('phone')?.touched">
              Phone number is required
            </div>
          </div>

          <div class="col-12">
            <label for="website" class="form-label">Website</label>
            <input
              type="url"
              class="form-control"
              id="website"
              formControlName="website"
              placeholder="Enter website URL"
            />
          </div>

          <!-- Address -->
          <div class="col-12">
            <h6 class="text-muted mb-3 mt-2">Address</h6>
          </div>

          <div class="col-12">
            <label for="street" class="form-label">Street Address</label>
            <input
              type="text"
              class="form-control"
              id="street"
              formControlName="street"
              placeholder="Enter street address"
            />
          </div>

          <div class="col-md-6">
            <label for="city" class="form-label">City</label>
            <input
              type="text"
              class="form-control"
              id="city"
              formControlName="city"
              placeholder="Enter city"
            />
          </div>

          <div class="col-md-6">
            <label for="state" class="form-label">State/Province</label>
            <input
              type="text"
              class="form-control"
              id="state"
              formControlName="state"
              placeholder="Enter state/province"
            />
          </div>

          <div class="col-md-6">
            <label for="postalCode" class="form-label">Postal Code</label>
            <input
              type="text"
              class="form-control"
              id="postalCode"
              formControlName="postalCode"
              placeholder="Enter postal code"
            />
          </div>

          <div class="col-md-6">
            <label for="country" class="form-label">Country</label>
            <input
              type="text"
              class="form-control"
              id="country"
              formControlName="country"
              placeholder="Enter country"
            />
          </div>

          <!-- Business Details -->
          <div class="col-12">
            <h6 class="text-muted mb-3 mt-2">Business Details</h6>
          </div>

          <div class="col-md-6">
            <label for="industry" class="form-label">Industry</label>
            <input
              type="text"
              class="form-control"
              id="industry"
              formControlName="industry"
              placeholder="Enter industry"
            />
          </div>

          <div class="col-md-6">
            <label for="size" class="form-label">Company Size</label>
            <select class="form-select" id="size" formControlName="size">
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1001+">1001+ employees</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="type" class="form-label">Company Type</label>
            <select class="form-select" id="type" formControlName="type">
              <option value="">Select type</option>
              <option value="Primary">Primary</option>
              <option value="Client">Client</option>
              <option value="Subsidiary">Subsidiary</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="currency" class="form-label">Currency</label>
            <select class="form-select" id="currency" formControlName="currency">
              <option value="">Select currency</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="fiscalYearEnd" class="form-label">Fiscal Year End</label>
            <input
              type="date"
              class="form-control"
              id="fiscalYearEnd"
              formControlName="fiscalYearEnd"
            />
          </div>

          <!-- Tags -->
          <div class="col-12">
            <h6 class="text-muted mb-3 mt-2">Tags</h6>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="primaryOrg" formControlName="isPrimaryOrg">
              <label class="form-check-label" for="primaryOrg">
                Set as Primary Organization
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="myOrg" formControlName="isMyOrg">
              <label class="form-check-label" for="myOrg">
                Set as My Organization
              </label>
            </div>
          </div>

          <!-- Primary Contact -->
          <div class="col-12">
            <h6 class="text-muted mb-3 mt-2">Primary Contact</h6>
          </div>

          <div class="col-md-6">
            <label for="contactName" class="form-label">Contact Name</label>
            <input
              type="text"
              class="form-control"
              id="contactName"
              formControlName="contactName"
              placeholder="Enter contact name"
            />
          </div>

          <div class="col-md-6">
            <label for="contactEmail" class="form-label">Contact Email</label>
            <input
              type="email"
              class="form-control"
              id="contactEmail"
              formControlName="contactEmail"
              placeholder="Enter contact email"
            />
          </div>

          <div class="col-md-6">
            <label for="contactPhone" class="form-label">Contact Phone</label>
            <input
              type="tel"
              class="form-control"
              id="contactPhone"
              formControlName="contactPhone"
              placeholder="Enter contact phone"
            />
          </div>

          <div class="col-md-6">
            <label for="contactRole" class="form-label">Contact Role</label>
            <input
              type="text"
              class="form-control"
              id="contactRole"
              formControlName="contactRole"
              placeholder="Enter contact role"
            />
          </div>

          <!-- Notes -->
          <div class="col-12">
            <label for="notes" class="form-label">Notes</label>
            <textarea
              class="form-control"
              id="notes"
              formControlName="notes"
              rows="3"
              placeholder="Enter any additional notes"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!addForm.valid">
          Add Company
        </button>
      </div>
    </form>
  `
})
export class AddCompanyModalComponent {
  addForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private companyService: CompanyService
  ) {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      legalName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      vatNumber: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: [''],
      street: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: [''],
      industry: [''],
      size: [''],
      type: [''],
      currency: [''],
      fiscalYearEnd: [''],
      isPrimaryOrg: [false],
      isMyOrg: [false],
      contactName: [''],
      contactEmail: [''],
      contactPhone: [''],
      contactRole: [''],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;
      
      // Prepare tags array
      const tags: CompanyTag[] = [];
      if (formValue.isPrimaryOrg) tags.push('Primary Organization');
      if (formValue.isMyOrg) tags.push('My Organization');

      // Prepare address object
      const address = {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country
      };

      // Prepare primary contact object
      const primaryContact = formValue.contactName ? {
        name: formValue.contactName,
        email: formValue.contactEmail,
        phone: formValue.contactPhone,
        role: formValue.contactRole
      } : undefined;

      // Create final company object
      const company: Partial<Company> = {
        name: formValue.name,
        legalName: formValue.legalName,
        registrationNumber: formValue.registrationNumber,
        vatNumber: formValue.vatNumber,
        email: formValue.email,
        phone: formValue.phone,
        website: formValue.website,
        address: JSON.stringify({
          street: formValue.street || '',
          city: formValue.city || '',
          state: formValue.state || '',
          postalCode: formValue.postalCode || '',
          country: formValue.country || ''
        }),
        industry: formValue.industry || '',
        size: formValue.size || '',
        type: formValue.type as CompanyType || 'Other',
        tags: tags || [],
        fiscalYearEnd: formValue.fiscalYearEnd || '',
        currency: formValue.currency as Currency || 'USD',
        notes: formValue.notes || '',
        status: 'Active' as CompanyStatus,
        isPrimary: formValue.isPrimaryOrg,
        isMyOrg: formValue.isMyOrg
      };

      // If primary contact details are provided, create it after company creation
      const hasPrimaryContact = formValue.contactName && formValue.contactEmail;

      // Save to database
      this.companyService.createCompany(company).subscribe({
        next: (createdCompany) => {
          // If primary contact details are provided, create the primary contact
          if (hasPrimaryContact) {
            const primaryContactData = {
              name: formValue.contactName,
              email: formValue.contactEmail,
              phone: formValue.contactPhone || '',
              role: formValue.contactRole || ''
            };
            
            this.companyService.updatePrimaryContact(createdCompany.id, primaryContactData).subscribe({
              next: () => {
                this.activeModal.close(createdCompany);
              },
              error: (error) => {
                console.error('Error creating primary contact:', error);
                // Still close the modal as the company was created successfully
                this.activeModal.close(createdCompany);
              }
            });
          } else {
            this.activeModal.close(createdCompany);
          }
        },
        error: (error) => {
          console.error('Error creating company:', error);
          // You might want to show an error message to the user here
        }
      });
    }
  }
}
