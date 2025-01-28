import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ESGInitiative, ESGCategory } from './../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-initiative-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New ESG Initiative</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="initiativeForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="initiativeForm.get('companyId')?.touched && initiativeForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="initiativeForm.get('title')?.touched && initiativeForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="initiativeForm.get('description')?.touched && initiativeForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Category</label>
          <select class="form-select" formControlName="category">
            <option value="">Select Category</option>
            <option value="Environmental">Environmental</option>
            <option value="Social">Social</option>
            <option value="Governance">Governance</option>
          </select>
          <div class="form-text text-danger" *ngIf="initiativeForm.get('category')?.touched && initiativeForm.get('category')?.errors?.['required']">
            Category is required
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Start Date</label>
            <input type="date" class="form-control" formControlName="startDate">
            <div class="form-text text-danger" *ngIf="initiativeForm.get('startDate')?.touched && initiativeForm.get('startDate')?.errors?.['required']">
              Start date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">End Date</label>
            <input type="date" class="form-control" formControlName="endDate">
            <div class="form-text text-danger" *ngIf="initiativeForm.get('endDate')?.touched && initiativeForm.get('endDate')?.errors?.['required']">
              End date is required
            </div>
          </div>
        </div>

        <!-- Status and Budget -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <div class="form-text text-danger" *ngIf="initiativeForm.get('status')?.touched && initiativeForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Budget</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input type="number" class="form-control" formControlName="budget">
            </div>
            <div class="form-text text-danger" *ngIf="initiativeForm.get('budget')?.touched && initiativeForm.get('budget')?.errors?.['required']">
              Budget is required
            </div>
          </div>
        </div>

        <!-- Impact and Stakeholders -->
        <div class="mb-3">
          <label class="form-label">Expected Impact</label>
          <textarea class="form-control" rows="3" formControlName="impact"></textarea>
          <div class="form-text text-danger" *ngIf="initiativeForm.get('impact')?.touched && initiativeForm.get('impact')?.errors?.['required']">
            Impact description is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Stakeholders</label>
          <textarea class="form-control" rows="2" formControlName="stakeholders" 
            placeholder="Enter stakeholders (one per line)"></textarea>
          <small class="form-text text-muted">
            Enter each stakeholder on a new line
          </small>
        </div>

        <!-- Related Metrics -->
        <div class="mb-3">
          <label class="form-label">Related Metrics</label>
          <textarea class="form-control" rows="2" formControlName="metrics" 
            placeholder="Enter related metric IDs (one per line)"></textarea>
          <small class="form-text text-muted">
            Enter each metric ID on a new line
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!initiativeForm.valid">
          Add Initiative
        </button>
      </div>
    </form>
  `
})
export class CreateInitiativeModalComponent {
  @Input() companies: Company[] = [];

  initiativeForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.initiativeForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['Planned', Validators.required],
      budget: [0, Validators.required],
      spent: [0],
      impact: ['', Validators.required],
      stakeholders: [''],
      metrics: [''],
      documents: [[]]
    });
  }

  onSubmit(): void {
    if (this.initiativeForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.initiativeForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert stakeholders and metrics text areas to arrays
        const stakeholdersText = this.initiativeForm.get('stakeholders')?.value;
        const metricsText = this.initiativeForm.get('metrics')?.value;

        const stakeholders = stakeholdersText ? 
          stakeholdersText.split('\n').filter((item: string) => item.trim().length > 0) : 
          [];
        const metrics = metricsText ? 
          metricsText.split('\n').filter((item: string) => item.trim().length > 0) : 
          [];

        const result = {
          company: selectedCompany,
          initiative: {
            ...this.initiativeForm.value,
            stakeholders,
            metrics
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
