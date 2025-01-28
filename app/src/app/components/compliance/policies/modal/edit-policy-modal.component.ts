import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Policy } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-edit-policy-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Edit Policy</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="policyForm" (ngSubmit)="onSubmit()">
      <div class="modal-body p-3">
        <div class="row g-3">
          <!-- Company Selection -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="companyId">
              <option value="">Select Company</option>
              <option *ngFor="let company of companies" [value]="company.id">
                {{ company.name }}
              </option>
            </select>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('companyId')?.touched && policyForm.get('companyId')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Basic Information -->
          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" placeholder="Policy Title" formControlName="title">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('title')?.touched && policyForm.get('title')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" placeholder="Policy Number" formControlName="policyNumber">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('policyNumber')?.touched && policyForm.get('policyNumber')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Description" formControlName="description"></textarea>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('description')?.touched && policyForm.get('description')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Category and Version -->
          <div class="col-md-4">
            <select class="form-select form-select-sm" formControlName="category">
              <option value="">Select Category</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Compliance">Compliance</option>
              <option value="Security">Security</option>
              <option value="General">General</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('category')?.touched && policyForm.get('category')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-4">
            <input type="text" class="form-control form-control-sm" placeholder="Version (e.g., 1.0)" formControlName="version">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('version')?.touched && policyForm.get('version')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-4">
            <select class="form-select form-select-sm" formControlName="status">
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
              <option value="Superseded">Superseded</option>
            </select>
          </div>

          <!-- Purpose and Scope -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Purpose" formControlName="purpose"></textarea>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('purpose')?.touched && policyForm.get('purpose')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Scope" formControlName="scope"></textarea>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('scope')?.touched && policyForm.get('scope')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Content -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="5" placeholder="Policy Content" formControlName="content"></textarea>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('content')?.touched && policyForm.get('content')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Owner and Approver -->
          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" placeholder="Owner" formControlName="owner">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('owner')?.touched && policyForm.get('owner')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" placeholder="Approver" formControlName="approver">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('approver')?.touched && policyForm.get('approver')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Dates -->
          <div class="col-md-4">
            <input type="date" class="form-control form-control-sm" formControlName="effectiveDate">
            <div class="invalid-feedback" [class.d-block]="policyForm.get('effectiveDate')?.touched && policyForm.get('effectiveDate')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-4">
            <input type="date" class="form-control form-control-sm" formControlName="lastReviewDate">
          </div>

          <div class="col-md-4">
            <select class="form-select form-select-sm" formControlName="reviewFrequency">
              <option value="">Select Review Frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Annual">Annual</option>
              <option value="As Needed">As Needed</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="policyForm.get('reviewFrequency')?.touched && policyForm.get('reviewFrequency')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Related Policies and References -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Related Policies (comma-separated)" formControlName="relatedPolicies">
          </div>

          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="References (comma-separated)" formControlName="references">
          </div>

          <!-- Revision Note -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Revision Note" formControlName="revisionNote"></textarea>
            <small class="text-muted">Describe the changes made in this revision</small>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!policyForm.valid">
          Update Policy
        </button>
      </div>
    </form>
  `
})
export class EditPolicyModalComponent implements OnInit {
  @Input() companies: Company[] = [];
  @Input() policy!: Policy;

  policyForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.policyForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      policyNumber: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      version: ['', Validators.required],
      status: [''],
      purpose: ['', Validators.required],
      scope: ['', Validators.required],
      content: ['', Validators.required],
      owner: ['', Validators.required],
      approver: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      lastReviewDate: [''],
      reviewFrequency: ['', Validators.required],
      relatedPolicies: [''],
      references: [''],
      revisionNote: [''],
      acknowledgments: [[]],
      reviews: [[]],
      revisions: [[]]
    });

    // Calculate next review date based on frequency
    this.policyForm.get('reviewFrequency')?.valueChanges.subscribe(frequency => {
      if (frequency && this.policyForm.get('lastReviewDate')?.value) {
        const lastReview = new Date(this.policyForm.get('lastReviewDate')?.value);
        const nextReview = new Date(lastReview);
        
        switch (frequency) {
          case 'Monthly':
            nextReview.setMonth(nextReview.getMonth() + 1);
            break;
          case 'Quarterly':
            nextReview.setMonth(nextReview.getMonth() + 3);
            break;
          case 'Semi-Annual':
            nextReview.setMonth(nextReview.getMonth() + 6);
            break;
          case 'Annual':
            nextReview.setFullYear(nextReview.getFullYear() + 1);
            break;
        }

        if (frequency !== 'As Needed') {
          this.policyForm.patchValue({ nextReviewDate: nextReview.toISOString() });
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.policy) {
      this.policyForm.patchValue({
        ...this.policy,
        relatedPolicies: this.policy.relatedPolicies.join(', '),
        references: this.policy.references.join(', ')
      });
    }
  }

  onSubmit(): void {
    if (this.policyForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.policyForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert comma-separated strings to arrays
        const relatedPolicies = this.policyForm.get('relatedPolicies')?.value
          ? this.policyForm.get('relatedPolicies')?.value.split(',').map((p: string) => p.trim())
          : [];
        const references = this.policyForm.get('references')?.value
          ? this.policyForm.get('references')?.value.split(',').map((r: string) => r.trim())
          : [];

        // Add revision if note provided
        const revisions = [...(this.policy.revisions || [])];
        if (this.policyForm.get('revisionNote')?.value) {
          revisions.push({
            id: crypto.randomUUID(),
            version: this.policyForm.get('version')?.value,
            changes: [this.policyForm.get('revisionNote')?.value],
            author: this.policyForm.get('owner')?.value,
            date: new Date().toISOString(),
            approvalStatus: 'Pending',
            policyId: this.policy.id
          });
        }

        const result = {
          company: selectedCompany,
          policy: {
            ...this.policyForm.value,
            id: this.policy.id,
            relatedPolicies,
            references,
            revisions
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
