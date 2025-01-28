import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Milestone } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Milestone</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="milestoneForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="milestoneForm.get('companyId')?.touched && milestoneForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="milestoneForm.get('title')?.touched && milestoneForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="milestoneForm.get('description')?.touched && milestoneForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Timeline -->
        <div class="mb-3">
          <label class="form-label">Due Date</label>
          <input type="date" class="form-control" formControlName="dueDate">
          <div class="form-text text-danger" *ngIf="milestoneForm.get('dueDate')?.touched && milestoneForm.get('dueDate')?.errors?.['required']">
            Due date is required
          </div>
        </div>

        <!-- Assignment -->
        <div class="mb-3">
          <label class="form-label">Owner</label>
          <input type="text" class="form-control" formControlName="owner">
          <div class="form-text text-danger" *ngIf="milestoneForm.get('owner')?.touched && milestoneForm.get('owner')?.errors?.['required']">
            Owner is required
          </div>
        </div>

        <!-- Deliverables -->
        <div class="mb-3">
          <label class="form-label">Deliverables</label>
          <input type="text" class="form-control" formControlName="deliverables">
          <div class="form-text text-muted">Enter deliverables separated by commas</div>
          <div class="form-text text-danger" *ngIf="milestoneForm.get('deliverables')?.touched && milestoneForm.get('deliverables')?.errors?.['required']">
            At least one deliverable is required
          </div>
        </div>

        <!-- Dependencies -->
        <div class="mb-3">
          <label class="form-label">Dependencies</label>
          <input type="text" class="form-control" formControlName="dependencies">
          <div class="form-text text-muted">Enter dependencies separated by commas</div>
        </div>

        <!-- Notes -->
        <div class="mb-3">
          <label class="form-label">Additional Notes</label>
          <textarea class="form-control" rows="3" formControlName="notes"></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!milestoneForm.valid">
          Add Milestone
        </button>
      </div>
    </form>
  `
})
export class CreateMilestoneModalComponent {
  @Input() companies: Company[] = [];
  @Input() trackingItemId?: string;

  milestoneForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.milestoneForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      owner: ['', Validators.required],
      deliverables: ['', Validators.required],
      dependencies: [''],
      notes: [''],
      status: ['Not Started'],
      progress: [0],
      trackingItemId: [null]
    });

    if (this.trackingItemId) {
      this.milestoneForm.patchValue({ trackingItemId: this.trackingItemId });
    }
  }

  onSubmit(): void {
    if (this.milestoneForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.milestoneForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert comma-separated strings to arrays
        const deliverables = this.milestoneForm.get('deliverables')?.value
          ? this.milestoneForm.get('deliverables')?.value.split(',').map((d: string) => d.trim())
          : [];
        const dependencies = this.milestoneForm.get('dependencies')?.value
          ? this.milestoneForm.get('dependencies')?.value.split(',').map((d: string) => d.trim())
          : [];
        const notes = this.milestoneForm.get('notes')?.value
          ? [{ text: this.milestoneForm.get('notes')?.value, date: new Date().toISOString() }]
          : [];

        const result = {
          company: selectedCompany,
          milestone: {
            ...this.milestoneForm.value,
            deliverables,
            dependencies,
            notes
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
