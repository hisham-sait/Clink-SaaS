import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Assessment } from './../../compliance.types';

@Component({
  selector: 'app-add-finding-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Finding</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="findingForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Assessment Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Assessment</label>
          <p class="mb-0">{{ assessment.title }}</p>
          <small class="text-muted">{{ assessment.type }} Assessment | {{ formatDate(assessment.date) }}</small>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="title"
            placeholder="Enter finding title"
          >
          <div class="form-text text-danger" *ngIf="findingForm.get('title')?.touched && findingForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="description"
            placeholder="Enter finding description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="findingForm.get('description')?.touched && findingForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Severity and Status -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Severity</label>
            <select class="form-select" formControlName="severity">
              <option value="">Select Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <div class="form-text text-danger" *ngIf="findingForm.get('severity')?.touched && findingForm.get('severity')?.errors?.['required']">
              Severity is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status" (change)="onStatusChange()">
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <div class="form-text text-danger" *ngIf="findingForm.get('status')?.touched && findingForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Due Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="dueDate"
            >
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

        <!-- Remediation -->
        <div class="mb-3">
          <label class="form-label">Remediation Plan</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="remediation"
            placeholder="Enter remediation plan"
          ></textarea>
        </div>

        <!-- Closed Date -->
        <div class="mb-3" *ngIf="findingForm.get('status')?.value === 'Closed'">
          <label class="form-label">Closed Date</label>
          <input 
            type="date" 
            class="form-control" 
            formControlName="closedDate"
          >
          <div class="form-text text-danger" *ngIf="findingForm.get('closedDate')?.touched && findingForm.get('closedDate')?.errors?.['required']">
            Closed date is required for closed findings
          </div>
        </div>

        <!-- Evidence -->
        <div class="mb-3">
          <label class="form-label">Evidence</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="evidence"
            placeholder="List evidence (one per line)"
          ></textarea>
          <small class="form-text text-muted">
            Enter each piece of evidence on a new line
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!findingForm.valid">
          Add Finding
        </button>
      </div>
    </form>
  `
})
export class AddFindingModalComponent {
  @Input() assessment!: Assessment;

  findingForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.findingForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      status: ['Open', Validators.required],
      identifiedDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: [''],
      assignedTo: [''],
      remediation: [''],
      closedDate: [''],
      evidence: [''],
      assessmentId: [''] // Will be set from input assessment
    });
  }

  ngOnInit(): void {
    if (this.assessment) {
      this.findingForm.patchValue({
        assessmentId: this.assessment.id
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  onStatusChange(): void {
    const status = this.findingForm.get('status')?.value;
    const closedDateControl = this.findingForm.get('closedDate');

    if (status === 'Closed') {
      closedDateControl?.setValidators(Validators.required);
      if (!closedDateControl?.value) {
        closedDateControl?.setValue(new Date().toISOString().split('T')[0]);
      }
    } else {
      closedDateControl?.clearValidators();
      closedDateControl?.setValue('');
    }

    closedDateControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.findingForm.valid) {
      const formValue = this.findingForm.value;
      
      // Convert evidence to array if it contains multiple lines
      const evidence = formValue.evidence ? 
        formValue.evidence.split('\n').filter((e: string) => e.trim()) : 
        [];

      const result = {
        assessment: this.assessment,
        finding: {
          ...formValue,
          evidence
        }
      };

      this.activeModal.close(result);
    }
  }
}
