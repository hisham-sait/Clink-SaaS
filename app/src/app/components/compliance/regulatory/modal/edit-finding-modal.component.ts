import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Finding } from './../../compliance.types';

@Component({
  selector: 'app-edit-finding-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Finding</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="findingForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
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
            <label class="form-label">Identified Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="identifiedDate"
            >
            <div class="form-text text-danger" *ngIf="findingForm.get('identifiedDate')?.touched && findingForm.get('identifiedDate')?.errors?.['required']">
              Identified date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Due Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="dueDate"
            >
          </div>
        </div>

        <!-- Assignment -->
        <div class="mb-3">
          <label class="form-label">Assigned To</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="assignedTo"
            placeholder="Enter assignee name"
          >
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

        <!-- Existing Evidence -->
        <div class="mb-3" *ngIf="finding.evidence?.length">
          <label class="form-label">Current Evidence</label>
          <ul class="list-group">
            <li *ngFor="let item of finding.evidence; let i=index" class="list-group-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-file-earmark-text me-2"></i>
                <span>{{ item }}</span>
              </div>
              <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeEvidence(i)">
                <i class="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!findingForm.valid">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditFindingModalComponent implements OnInit {
  @Input() finding!: Finding;

  findingForm: FormGroup;
  removedEvidence: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.findingForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      status: ['', Validators.required],
      identifiedDate: ['', Validators.required],
      dueDate: [''],
      assignedTo: [''],
      remediation: [''],
      closedDate: [''],
      evidence: ['']
    });
  }

  ngOnInit(): void {
    if (this.finding) {
      // Format dates for input[type="date"]
      const identifiedDate = new Date(this.finding.identifiedDate).toISOString().split('T')[0];
      const dueDate = this.finding.dueDate ? new Date(this.finding.dueDate).toISOString().split('T')[0] : '';
      const closedDate = this.finding.closedDate ? new Date(this.finding.closedDate).toISOString().split('T')[0] : '';

      // Convert evidence array to newline-separated string
      const evidence = this.finding.evidence?.join('\n') || '';

      this.findingForm.patchValue({
        ...this.finding,
        identifiedDate,
        dueDate,
        closedDate,
        evidence
      });

      // Add validator for closedDate if status is Closed
      if (this.finding.status === 'Closed') {
        this.findingForm.get('closedDate')?.setValidators(Validators.required);
        this.findingForm.get('closedDate')?.updateValueAndValidity();
      }
    }
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

  removeEvidence(index: number): void {
    const evidence = this.finding.evidence?.[index];
    if (evidence) {
      this.removedEvidence.push(evidence);
      this.finding.evidence = this.finding.evidence?.filter((_, i) => i !== index);
    }
  }

  onSubmit(): void {
    if (this.findingForm.valid) {
      const formValue = this.findingForm.value;
      
      // Convert evidence to array if it contains multiple lines
      const newEvidence = formValue.evidence ? 
        formValue.evidence.split('\n').filter((e: string) => e.trim()) : 
        [];
      const currentEvidence = this.finding.evidence?.filter(e => !this.removedEvidence.includes(e)) || [];
      const evidence = [...new Set([...currentEvidence, ...newEvidence])];

      const result = {
        finding: {
          ...this.finding,
          ...formValue,
          evidence
        }
      };

      this.activeModal.close(result);
    }
  }
}
