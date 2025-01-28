import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Audit } from './../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-audit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Schedule New Audit</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="auditForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="auditForm.get('companyId')?.touched && auditForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="auditForm.get('title')?.touched && auditForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="auditForm.get('description')?.touched && auditForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Audit Type</label>
          <select class="form-select" formControlName="type">
            <option value="">Select Type</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
            <option value="Regulatory">Regulatory</option>
            <option value="Compliance">Compliance</option>
          </select>
          <div class="form-text text-danger" *ngIf="auditForm.get('type')?.touched && auditForm.get('type')?.errors?.['required']">
            Audit type is required
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Start Date</label>
            <input type="date" class="form-control" formControlName="startDate">
            <div class="form-text text-danger" *ngIf="auditForm.get('startDate')?.touched && auditForm.get('startDate')?.errors?.['required']">
              Start date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">End Date</label>
            <input type="date" class="form-control" formControlName="endDate">
            <div class="form-text text-danger" *ngIf="auditForm.get('endDate')?.touched && auditForm.get('endDate')?.errors?.['required']">
              End date is required
            </div>
          </div>
        </div>

        <!-- Audit Details -->
        <div class="mb-3">
          <label class="form-label">Department</label>
          <select class="form-select" formControlName="department">
            <option value="">Select Department</option>
            <option value="IT Security">IT Security</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Legal">Legal</option>
            <option value="HR">HR</option>
          </select>
          <div class="form-text text-danger" *ngIf="auditForm.get('department')?.touched && auditForm.get('department')?.errors?.['required']">
            Department is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Auditor</label>
          <input type="text" class="form-control" formControlName="auditor">
          <div class="form-text text-danger" *ngIf="auditForm.get('auditor')?.touched && auditForm.get('auditor')?.errors?.['required']">
            Auditor is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Scope</label>
          <textarea class="form-control" rows="3" formControlName="scope"></textarea>
          <div class="form-text text-danger" *ngIf="auditForm.get('scope')?.touched && auditForm.get('scope')?.errors?.['required']">
            Scope is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Methodology</label>
          <textarea class="form-control" rows="3" formControlName="methodology"></textarea>
          <div class="form-text text-danger" *ngIf="auditForm.get('methodology')?.touched && auditForm.get('methodology')?.errors?.['required']">
            Methodology is required
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!auditForm.valid">
          Schedule Audit
        </button>
      </div>
    </form>
  `
})
export class CreateAuditModalComponent {
  @Input() companies: Company[] = [];

  auditForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.auditForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      auditor: ['', Validators.required],
      department: ['', Validators.required],
      scope: ['', Validators.required],
      methodology: ['', Validators.required],
      status: ['Scheduled'],
      findings: [[]],
      recommendations: [[]],
      attachments: [[]]
    });
  }

  onSubmit(): void {
    if (this.auditForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.auditForm.get('companyId')?.value);
      if (selectedCompany) {
        const result = {
          company: selectedCompany,
          audit: this.auditForm.value
        };
        this.activeModal.close(result);
      }
    }
  }
}
