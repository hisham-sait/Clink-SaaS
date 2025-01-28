import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, ComplianceStatus } from './../../compliance.types';

@Component({
  selector: 'app-add-obligation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Obligation</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="obligationForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Requirement Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Requirement</label>
          <p class="mb-0">{{ requirement.title }}</p>
          <small class="text-muted">
            {{ requirement.authority }} | {{ requirement.jurisdiction }}
          </small>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="title"
            placeholder="Enter obligation title"
          >
          <div class="form-text text-danger" *ngIf="obligationForm.get('title')?.touched && obligationForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="description"
            placeholder="Enter obligation description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="obligationForm.get('description')?.touched && obligationForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Due Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="dueDate"
            >
            <div class="form-text text-danger" *ngIf="obligationForm.get('dueDate')?.touched && obligationForm.get('dueDate')?.errors?.['required']">
              Due date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Frequency</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="frequency"
              placeholder="e.g., Monthly, Quarterly"
            >
            <div class="form-text text-danger" *ngIf="obligationForm.get('frequency')?.touched && obligationForm.get('frequency')?.errors?.['required']">
              Frequency is required
            </div>
          </div>
        </div>

        <!-- Status and Assignment -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Compliant">Compliant</option>
              <option value="Partially Compliant">Partially Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
            <div class="form-text text-danger" *ngIf="obligationForm.get('status')?.touched && obligationForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Assigned To</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="assignedTo"
              placeholder="Enter assignee name"
            >
          </div>
        </div>

        <!-- Evidence -->
        <div class="mb-3">
          <label class="form-label">Evidence Required</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="evidence"
            placeholder="List required evidence or documentation"
          ></textarea>
          <small class="form-text text-muted">
            Enter each piece of evidence on a new line
          </small>
        </div>

        <!-- Comments -->
        <div class="mb-3">
          <label class="form-label">Initial Comments</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="comments"
            placeholder="Add any initial comments or notes"
          ></textarea>
        </div>

        <!-- Attachments -->
        <div class="mb-3">
          <label class="form-label">Attachments</label>
          <div class="input-group">
            <input 
              type="file" 
              class="form-control" 
              (change)="onFileSelected($event)"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            >
          </div>
          <small class="form-text text-muted">
            Supported formats: PDF, Word, Excel, Images (max 10MB each)
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!obligationForm.valid">
          Add Obligation
        </button>
      </div>
    </form>
  `
})
export class AddObligationModalComponent {
  @Input() requirement!: RegulatoryRequirement;

  obligationForm: FormGroup;
  selectedFiles: File[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.obligationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      frequency: ['', Validators.required],
      status: ['Compliant', Validators.required],
      assignedTo: [''],
      evidence: [''],
      comments: [''],
      attachments: [[]]
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (file.size <= maxSize) {
        this.selectedFiles.push(file);
      }
    }

    this.obligationForm.patchValue({
      attachments: this.selectedFiles.map(file => file.name)
    });
  }

  onSubmit(): void {
    if (this.obligationForm.valid) {
      const formValue = this.obligationForm.value;
      
      // Convert evidence and comments to arrays if they contain multiple lines
      const evidence = formValue.evidence ? formValue.evidence.split('\n').filter((e: string) => e.trim()) : [];
      const comments = formValue.comments ? [{ content: formValue.comments, createdAt: new Date().toISOString() }] : [];

      const result = {
        requirement: this.requirement,
        obligation: {
          ...formValue,
          evidence,
          comments,
          requirementId: this.requirement.id
        },
        files: this.selectedFiles
      };

      this.activeModal.close(result);
    }
  }
}
