import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrackingItem, Priority } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Create New Task</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
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
          <div class="form-text text-danger" *ngIf="taskForm.get('companyId')?.touched && taskForm.get('companyId')?.errors?.['required']">
            Company is required
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="taskForm.get('title')?.touched && taskForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="taskForm.get('description')?.touched && taskForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Category and Priority -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Category</label>
            <select class="form-select" formControlName="category">
              <option value="">Select Category</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
              <option value="Compliance">Compliance</option>
            </select>
            <div class="form-text text-danger" *ngIf="taskForm.get('category')?.touched && taskForm.get('category')?.errors?.['required']">
              Category is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Priority</label>
            <select class="form-select" formControlName="priority">
              <option value="">Select Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div class="form-text text-danger" *ngIf="taskForm.get('priority')?.touched && taskForm.get('priority')?.errors?.['required']">
              Priority is required
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Start Date</label>
            <input type="date" class="form-control" formControlName="startDate">
            <div class="form-text text-danger" *ngIf="taskForm.get('startDate')?.touched && taskForm.get('startDate')?.errors?.['required']">
              Start date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Due Date</label>
            <input type="date" class="form-control" formControlName="dueDate">
            <div class="form-text text-danger" *ngIf="taskForm.get('dueDate')?.touched && taskForm.get('dueDate')?.errors?.['required']">
              Due date is required
            </div>
          </div>
        </div>

        <!-- Assignment -->
        <div class="mb-3">
          <label class="form-label">Task Owner</label>
          <input type="text" class="form-control" formControlName="owner">
          <div class="form-text text-danger" *ngIf="taskForm.get('owner')?.touched && taskForm.get('owner')?.errors?.['required']">
            Owner is required
          </div>
        </div>

        <!-- Dependencies -->
        <div class="mb-3">
          <label class="form-label">Dependencies</label>
          <input type="text" class="form-control" formControlName="dependencies">
          <div class="form-text text-muted">Enter dependencies separated by commas</div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!taskForm.valid">
          Create Task
        </button>
      </div>
    </form>
  `
})
export class CreateTaskModalComponent {
  @Input() companies: Company[] = [];

  taskForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['', Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      owner: ['', Validators.required],
      dependencies: [''],
      status: ['Not Started'],
      progress: [0],
      metrics: [[]],
      milestones: [[]],
      alerts: [[]]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.taskForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert comma-separated dependencies to array
        const dependencies = this.taskForm.get('dependencies')?.value
          ? this.taskForm.get('dependencies')?.value.split(',').map((d: string) => d.trim())
          : [];

        const result = {
          company: selectedCompany,
          task: {
            ...this.taskForm.value,
            dependencies
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
