import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ESGMetric, ESGCategory, MetricStatus, ReportingPeriod } from './../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-metric-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New ESG Metric</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="metricForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="metricForm.get('companyId')?.touched && metricForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input type="text" class="form-control" formControlName="name">
          <div class="form-text text-danger" *ngIf="metricForm.get('name')?.touched && metricForm.get('name')?.errors?.['required']">
            Name is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="metricForm.get('description')?.touched && metricForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Category</label>
            <select class="form-select" formControlName="category">
              <option value="">Select Category</option>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
            <div class="form-text text-danger" *ngIf="metricForm.get('category')?.touched && metricForm.get('category')?.errors?.['required']">
              Category is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Unit</label>
            <input type="text" class="form-control" formControlName="unit">
            <div class="form-text text-danger" *ngIf="metricForm.get('unit')?.touched && metricForm.get('unit')?.errors?.['required']">
              Unit is required
            </div>
          </div>
        </div>

        <!-- Targets and Values -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Current Value</label>
            <input type="number" class="form-control" formControlName="current">
            <div class="form-text text-danger" *ngIf="metricForm.get('current')?.touched && metricForm.get('current')?.errors?.['required']">
              Current value is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Target Value</label>
            <input type="number" class="form-control" formControlName="target">
            <div class="form-text text-danger" *ngIf="metricForm.get('target')?.touched && metricForm.get('target')?.errors?.['required']">
              Target value is required
            </div>
          </div>
        </div>

        <!-- Reporting Details -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Reporting Period</label>
            <select class="form-select" formControlName="reportingPeriod">
              <option value="">Select Period</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Annual">Annual</option>
            </select>
            <div class="form-text text-danger" *ngIf="metricForm.get('reportingPeriod')?.touched && metricForm.get('reportingPeriod')?.errors?.['required']">
              Reporting period is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Next Report Due</label>
            <input type="date" class="form-control" formControlName="nextReportDue">
            <div class="form-text text-danger" *ngIf="metricForm.get('nextReportDue')?.touched && metricForm.get('nextReportDue')?.errors?.['required']">
              Next report due date is required
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="mb-3">
          <label class="form-label">Methodology</label>
          <textarea class="form-control" rows="3" formControlName="methodology"></textarea>
          <div class="form-text text-danger" *ngIf="metricForm.get('methodology')?.touched && metricForm.get('methodology')?.errors?.['required']">
            Methodology is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Data Source</label>
          <input type="text" class="form-control" formControlName="dataSource">
          <div class="form-text text-danger" *ngIf="metricForm.get('dataSource')?.touched && metricForm.get('dataSource')?.errors?.['required']">
            Data source is required
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!metricForm.valid">
          Add Metric
        </button>
      </div>
    </form>
  `
})
export class CreateMetricModalComponent {
  @Input() companies: Company[] = [];

  metricForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.metricForm = this.fb.group({
      companyId: ['', Validators.required],
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      unit: ['', Validators.required],
      target: [0, Validators.required],
      current: [0, Validators.required],
      status: ['On Track'],
      reportingPeriod: ['', Validators.required],
      lastUpdated: [new Date().toISOString()],
      nextReportDue: ['', Validators.required],
      methodology: ['', Validators.required],
      dataSource: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.metricForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.metricForm.get('companyId')?.value);
      if (selectedCompany) {
        const result = {
          company: selectedCompany,
          metric: this.metricForm.value
        };
        this.activeModal.close(result);
      }
    }
  }
}
