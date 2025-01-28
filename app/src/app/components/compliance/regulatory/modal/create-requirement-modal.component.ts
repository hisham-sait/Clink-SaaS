import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, RegulatoryStatus, ComplianceStatus, RiskLevel, UpdateFrequency } from './../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-requirement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Regulatory Requirement</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="requirementForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="requirementForm.get('companyId')?.touched && requirementForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="requirementForm.get('title')?.touched && requirementForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="requirementForm.get('description')?.touched && requirementForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Authority and Jurisdiction -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Authority</label>
            <input type="text" class="form-control" formControlName="authority">
            <div class="form-text text-danger" *ngIf="requirementForm.get('authority')?.touched && requirementForm.get('authority')?.errors?.['required']">
              Authority is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Jurisdiction</label>
            <input type="text" class="form-control" formControlName="jurisdiction">
            <div class="form-text text-danger" *ngIf="requirementForm.get('jurisdiction')?.touched && requirementForm.get('jurisdiction')?.errors?.['required']">
              Jurisdiction is required
            </div>
          </div>
        </div>

        <!-- Category and Status -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Category</label>
            <input type="text" class="form-control" formControlName="category">
            <div class="form-text text-danger" *ngIf="requirementForm.get('category')?.touched && requirementForm.get('category')?.errors?.['required']">
              Category is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Superseded">Superseded</option>
              <option value="Repealed">Repealed</option>
            </select>
            <div class="form-text text-danger" *ngIf="requirementForm.get('status')?.touched && requirementForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Effective Date</label>
            <input type="date" class="form-control" formControlName="effectiveDate">
            <div class="form-text text-danger" *ngIf="requirementForm.get('effectiveDate')?.touched && requirementForm.get('effectiveDate')?.errors?.['required']">
              Effective date is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Last Update Date</label>
            <input type="date" class="form-control" formControlName="lastUpdateDate">
            <div class="form-text text-danger" *ngIf="requirementForm.get('lastUpdateDate')?.touched && requirementForm.get('lastUpdateDate')?.errors?.['required']">
              Last update date is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Next Review Date</label>
            <input type="date" class="form-control" formControlName="nextReviewDate">
            <div class="form-text text-danger" *ngIf="requirementForm.get('nextReviewDate')?.touched && requirementForm.get('nextReviewDate')?.errors?.['required']">
              Next review date is required
            </div>
          </div>
        </div>

        <!-- Update Frequency and Risk Level -->
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Update Frequency</label>
            <select class="form-select" formControlName="updateFrequency">
              <option value="">Select Frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="As Needed">As Needed</option>
            </select>
            <div class="form-text text-danger" *ngIf="requirementForm.get('updateFrequency')?.touched && requirementForm.get('updateFrequency')?.errors?.['required']">
              Update frequency is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Risk Level</label>
            <select class="form-select" formControlName="riskLevel">
              <option value="">Select Risk Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <div class="form-text text-danger" *ngIf="requirementForm.get('riskLevel')?.touched && requirementForm.get('riskLevel')?.errors?.['required']">
              Risk level is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Compliance Status</label>
            <select class="form-select" formControlName="complianceStatus">
              <option value="">Select Status</option>
              <option value="Compliant">Compliant</option>
              <option value="Partially Compliant">Partially Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
            <div class="form-text text-danger" *ngIf="requirementForm.get('complianceStatus')?.touched && requirementForm.get('complianceStatus')?.errors?.['required']">
              Compliance status is required
            </div>
          </div>
        </div>

        <!-- Applicability -->
        <div class="mb-3">
          <label class="form-label">Applicability</label>
          <textarea class="form-control" rows="2" formControlName="applicability"></textarea>
          <div class="form-text text-danger" *ngIf="requirementForm.get('applicability')?.touched && requirementForm.get('applicability')?.errors?.['required']">
            Applicability is required
          </div>
        </div>

        <!-- Obligations -->
        <div class="mb-3">
          <label class="form-label d-flex justify-content-between align-items-center">
            <span>Obligations</span>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="addObligation()">
              <i class="bi bi-plus-lg"></i> Add Obligation
            </button>
          </label>
          <div formArrayName="obligations">
            <div *ngFor="let obligation of obligations.controls; let i=index" [formGroupName]="i" class="card mb-2">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-subtitle text-muted">Obligation {{ i + 1 }}</h6>
                  <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeObligation(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <div class="mb-2">
                  <input type="text" class="form-control" formControlName="title" placeholder="Title">
                </div>
                <div class="mb-2">
                  <textarea class="form-control" formControlName="description" placeholder="Description" rows="2"></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <input type="date" class="form-control" formControlName="dueDate">
                  </div>
                  <div class="col-md-6 mb-2">
                    <input type="text" class="form-control" formControlName="frequency" placeholder="Frequency">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="mb-3">
          <label class="form-label d-flex justify-content-between align-items-center">
            <span>Controls</span>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="addControl()">
              <i class="bi bi-plus-lg"></i> Add Control
            </button>
          </label>
          <div formArrayName="controls">
            <div *ngFor="let control of controls.controls; let i=index" [formGroupName]="i" class="card mb-2">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-subtitle text-muted">Control {{ i + 1 }}</h6>
                  <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeControl(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <div class="mb-2">
                  <input type="text" class="form-control" formControlName="name" placeholder="Name">
                </div>
                <div class="mb-2">
                  <textarea class="form-control" formControlName="description" placeholder="Description" rows="2"></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <input type="text" class="form-control" formControlName="type" placeholder="Type">
                  </div>
                  <div class="col-md-6 mb-2">
                    <select class="form-select" formControlName="status">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!requirementForm.valid">
          Add Requirement
        </button>
      </div>
    </form>
  `
})
export class CreateRequirementModalComponent {
  @Input() companies: Company[] = [];

  requirementForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.requirementForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      authority: ['', Validators.required],
      jurisdiction: ['', Validators.required],
      category: ['', Validators.required],
      status: ['Active', Validators.required],
      effectiveDate: ['', Validators.required],
      lastUpdateDate: [new Date().toISOString().split('T')[0], Validators.required],
      nextReviewDate: ['', Validators.required],
      updateFrequency: ['', Validators.required],
      riskLevel: ['', Validators.required],
      complianceStatus: ['', Validators.required],
      applicability: ['', Validators.required],
      obligations: this.fb.array([]),
      controls: this.fb.array([]),
      documents: [[]],
      assessments: [[]]
    });
  }

  get obligations() {
    return this.requirementForm.get('obligations') as FormArray;
  }

  get controls() {
    return this.requirementForm.get('controls') as FormArray;
  }

  addObligation() {
    const obligationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      frequency: ['', Validators.required],
      status: ['Compliant'],
      assignedTo: [''],
      evidence: [[]],
      attachments: [[]],
      comments: [[]]
    });

    this.obligations.push(obligationForm);
  }

  removeObligation(index: number) {
    this.obligations.removeAt(index);
  }

  addControl() {
    const controlForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      status: ['Active', Validators.required],
      effectiveness: ['Effective'],
      implementation: [''],
      testing: [''],
      owner: [''],
      lastTestedDate: [''],
      nextTestDate: [''],
      evidence: [[]]
    });

    this.controls.push(controlForm);
  }

  removeControl(index: number) {
    this.controls.removeAt(index);
  }

  onSubmit() {
    if (this.requirementForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.requirementForm.get('companyId')?.value);
      if (selectedCompany) {
        const result = {
          company: selectedCompany,
          requirement: this.requirementForm.value
        };
        this.activeModal.close(result);
      }
    }
  }
}
