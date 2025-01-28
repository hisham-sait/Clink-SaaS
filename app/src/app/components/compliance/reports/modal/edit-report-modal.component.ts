import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-edit-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Edit Report</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
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
            <div class="invalid-feedback" [class.d-block]="reportForm.get('companyId')?.touched && reportForm.get('companyId')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Basic Information -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Report Title" formControlName="title">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('title')?.touched && reportForm.get('title')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Description" formControlName="description"></textarea>
            <div class="invalid-feedback" [class.d-block]="reportForm.get('description')?.touched && reportForm.get('description')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Category and Frequency -->
          <div class="col-md-6">
            <select class="form-select form-select-sm" formControlName="category">
              <option value="">Select Category</option>
              <option value="Compliance">Compliance</option>
              <option value="Audit">Audit</option>
              <option value="Risk">Risk</option>
              <option value="Performance">Performance</option>
              <option value="Regulatory">Regulatory</option>
              <option value="ESG">ESG</option>
              <option value="Executive">Executive</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="reportForm.get('category')?.touched && reportForm.get('category')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <select class="form-select form-select-sm" formControlName="frequency">
              <option value="">Select Frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="reportForm.get('frequency')?.touched && reportForm.get('frequency')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Period -->
          <div class="col-md-6">
            <input type="date" class="form-control form-control-sm" formControlName="periodStart">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('periodStart')?.touched && reportForm.get('periodStart')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <input type="date" class="form-control form-control-sm" formControlName="periodEnd">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('periodEnd')?.touched && reportForm.get('periodEnd')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Status -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="status">
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Final">Final</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <!-- Author and Reviewers -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Author" formControlName="author">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('author')?.touched && reportForm.get('author')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Reviewers (comma-separated)" formControlName="reviewers">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('reviewers')?.touched && reportForm.get('reviewers')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Distribution -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Distribution List (comma-separated)" formControlName="distribution">
            <div class="invalid-feedback" [class.d-block]="reportForm.get('distribution')?.touched && reportForm.get('distribution')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Tags -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Tags (comma-separated)" formControlName="tags">
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!reportForm.valid">
          Update Report
        </button>
      </div>
    </form>
  `
})
export class EditReportModalComponent implements OnInit {
  @Input() companies: Company[] = [];
  @Input() report!: Report;

  reportForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      frequency: ['', Validators.required],
      periodStart: ['', Validators.required],
      periodEnd: ['', Validators.required],
      author: ['', Validators.required],
      reviewers: ['', Validators.required],
      distribution: ['', Validators.required],
      tags: [''],
      status: ['Draft'],
      sections: [[]],
      metrics: [[]],
      findings: [[]],
      recommendations: [[]]
    });
  }

  ngOnInit(): void {
    if (this.report) {
      this.reportForm.patchValue({
        ...this.report,
        periodStart: this.report.period.start,
        periodEnd: this.report.period.end,
        reviewers: this.report.reviewers.join(', '),
        distribution: this.report.distribution.join(', '),
        tags: this.report.tags.join(', ')
      });
    }
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.reportForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert comma-separated strings to arrays
        const reviewers = this.reportForm.get('reviewers')?.value
          ? this.reportForm.get('reviewers')?.value.split(',').map((r: string) => r.trim())
          : [];
        const distribution = this.reportForm.get('distribution')?.value
          ? this.reportForm.get('distribution')?.value.split(',').map((d: string) => d.trim())
          : [];
        const tags = this.reportForm.get('tags')?.value
          ? this.reportForm.get('tags')?.value.split(',').map((t: string) => t.trim())
          : [];

        const result = {
          company: selectedCompany,
          report: {
            ...this.reportForm.value,
            id: this.report.id,
            reviewers,
            distribution,
            tags,
            period: {
              start: this.reportForm.get('periodStart')?.value,
              end: this.reportForm.get('periodEnd')?.value
            }
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
