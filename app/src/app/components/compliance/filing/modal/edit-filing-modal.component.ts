import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing } from './../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-edit-filing-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Filing</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="filingForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="filingForm.get('companyId')?.touched && filingForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="filingForm.get('title')?.touched && filingForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="filingForm.get('description')?.touched && filingForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Authority</label>
            <input type="text" class="form-control" formControlName="authority">
            <div class="form-text text-danger" *ngIf="filingForm.get('authority')?.touched && filingForm.get('authority')?.errors?.['required']">
              Authority is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Reference Number</label>
            <input type="text" class="form-control" formControlName="referenceNumber">
          </div>
        </div>

        <!-- Filing Details -->
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Type</label>
            <input type="text" class="form-control" formControlName="type">
            <div class="form-text text-danger" *ngIf="filingForm.get('type')?.touched && filingForm.get('type')?.errors?.['required']">
              Type is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Frequency</label>
            <select class="form-select" formControlName="frequency">
              <option value="">Select Frequency</option>
              <option value="One-Time">One-Time</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Annual">Annual</option>
            </select>
            <div class="form-text text-danger" *ngIf="filingForm.get('frequency')?.touched && filingForm.get('frequency')?.errors?.['required']">
              Frequency is required
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label">Priority</label>
            <select class="form-select" formControlName="priority">
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <div class="form-text text-danger" *ngIf="filingForm.get('priority')?.touched && filingForm.get('priority')?.errors?.['required']">
              Priority is required
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="Draft">Draft</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Submitted">Submitted</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Amended">Amended</option>
          </select>
          <div class="form-text text-danger" *ngIf="filingForm.get('status')?.touched && filingForm.get('status')?.errors?.['required']">
            Status is required
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Due Date</label>
            <input type="date" class="form-control" formControlName="dueDate">
            <div class="form-text text-danger" *ngIf="filingForm.get('dueDate')?.touched && filingForm.get('dueDate')?.errors?.['required']">
              Due date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Period</label>
            <div class="row g-2">
              <div class="col-6">
                <input type="date" class="form-control" formControlName="periodStart" placeholder="Start">
              </div>
              <div class="col-6">
                <input type="date" class="form-control" formControlName="periodEnd" placeholder="End">
              </div>
            </div>
            <div class="form-text text-danger" *ngIf="(filingForm.get('periodStart')?.touched && filingForm.get('periodStart')?.errors?.['required']) || 
                                                     (filingForm.get('periodEnd')?.touched && filingForm.get('periodEnd')?.errors?.['required'])">
              Period dates are required
            </div>
          </div>
        </div>

        <!-- Assignment -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Assigned To</label>
            <input type="text" class="form-control" formControlName="assignedTo">
            <div class="form-text text-danger" *ngIf="filingForm.get('assignedTo')?.touched && filingForm.get('assignedTo')?.errors?.['required']">
              Assignee is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Reviewer</label>
            <input type="text" class="form-control" formControlName="reviewedBy">
          </div>
        </div>

        <!-- Submission Details -->
        <div class="row" *ngIf="filingForm.get('status')?.value === 'Submitted' || filingForm.get('status')?.value === 'Accepted'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Submission Date</label>
            <input type="date" class="form-control" formControlName="submissionDate">
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Acceptance Date</label>
            <input type="date" class="form-control" formControlName="acceptanceDate">
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!filingForm.valid">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditFilingModalComponent implements OnInit {
  @Input() filing!: Filing;
  @Input() companies: Company[] = [];

  filingForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.filingForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      authority: ['', Validators.required],
      referenceNumber: [''],
      type: ['', Validators.required],
      status: ['', Validators.required],
      frequency: ['', Validators.required],
      priority: ['', Validators.required],
      dueDate: ['', Validators.required],
      periodStart: ['', Validators.required],
      periodEnd: ['', Validators.required],
      assignedTo: ['', Validators.required],
      reviewedBy: [''],
      submissionDate: [''],
      acceptanceDate: [''],
      documents: [[]],
      comments: [[]],
      history: [[]],
      reminders: [[]]
    });
  }

  ngOnInit(): void {
    if (this.filing) {
      // Format dates for input[type="date"]
      const dueDate = new Date(this.filing.dueDate).toISOString().split('T')[0];
      const periodStart = new Date(this.filing.period.start).toISOString().split('T')[0];
      const periodEnd = new Date(this.filing.period.end).toISOString().split('T')[0];
      const submissionDate = this.filing.submissionDate ? 
        new Date(this.filing.submissionDate).toISOString().split('T')[0] : '';
      const acceptanceDate = this.filing.acceptanceDate ? 
        new Date(this.filing.acceptanceDate).toISOString().split('T')[0] : '';

      this.filingForm.patchValue({
        ...this.filing,
        dueDate,
        periodStart,
        periodEnd,
        submissionDate,
        acceptanceDate
      });
    }
  }

  onSubmit(): void {
    if (this.filingForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.filingForm.get('companyId')?.value);
      if (selectedCompany) {
        const formValue = this.filingForm.value;
        const result = {
          company: selectedCompany,
          filing: {
            ...this.filing,
            ...formValue,
            period: {
              start: formValue.periodStart,
              end: formValue.periodEnd
            }
          }
        };
        delete result.filing.periodStart;
        delete result.filing.periodEnd;
        
        this.activeModal.close(result);
      }
    }
  }
}
