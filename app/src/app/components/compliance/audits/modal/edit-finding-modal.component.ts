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
          <input type="text" class="form-control" formControlName="title">
          <div class="form-text text-danger" *ngIf="findingForm.get('title')?.touched && findingForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" formControlName="description"></textarea>
          <div class="form-text text-danger" *ngIf="findingForm.get('description')?.touched && findingForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

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
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <div class="form-text text-danger" *ngIf="findingForm.get('status')?.touched && findingForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Identified Date</label>
            <input type="date" class="form-control" formControlName="identifiedDate">
            <div class="form-text text-danger" *ngIf="findingForm.get('identifiedDate')?.touched && findingForm.get('identifiedDate')?.errors?.['required']">
              Identified date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Target Resolution Date</label>
            <input type="date" class="form-control" formControlName="targetResolutionDate">
            <div class="form-text text-danger" *ngIf="findingForm.get('targetResolutionDate')?.touched && findingForm.get('targetResolutionDate')?.errors?.['required']">
              Target resolution date is required
            </div>
          </div>
        </div>

        <!-- Resolution -->
        <div class="row" *ngIf="findingForm.get('status')?.value === 'Resolved' || findingForm.get('status')?.value === 'Closed'">
          <div class="col-12 mb-3">
            <label class="form-label">Actual Resolution Date</label>
            <input type="date" class="form-control" formControlName="actualResolutionDate">
          </div>
        </div>

        <!-- Assignment -->
        <div class="mb-3">
          <label class="form-label">Assigned To</label>
          <input type="text" class="form-control" formControlName="assignedTo">
          <div class="form-text text-danger" *ngIf="findingForm.get('assignedTo')?.touched && findingForm.get('assignedTo')?.errors?.['required']">
            Assignee is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Remediation Plan</label>
          <textarea class="form-control" rows="3" formControlName="remediation"></textarea>
          <div class="form-text text-danger" *ngIf="findingForm.get('remediation')?.touched && findingForm.get('remediation')?.errors?.['required']">
            Remediation plan is required
          </div>
        </div>

        <!-- Evidence -->
        <div class="mb-3">
          <label class="form-label">Evidence</label>
          <textarea class="form-control" rows="2" formControlName="evidence" 
            placeholder="Enter evidence details (one per line)"></textarea>
          <small class="form-text text-muted">
            Enter each piece of evidence on a new line
          </small>
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
      targetResolutionDate: ['', Validators.required],
      actualResolutionDate: [''],
      assignedTo: ['', Validators.required],
      remediation: ['', Validators.required],
      evidence: [''],
      auditId: ['']
    });
  }

  ngOnInit(): void {
    if (this.finding) {
      // Format dates for input[type="date"]
      const identifiedDate = new Date(this.finding.identifiedDate).toISOString().split('T')[0];
      const targetResolutionDate = new Date(this.finding.targetResolutionDate).toISOString().split('T')[0];
      const actualResolutionDate = this.finding.actualResolutionDate ? 
        new Date(this.finding.actualResolutionDate).toISOString().split('T')[0] : '';

      // Convert evidence array to string for textarea
      const evidence = this.finding.evidence ? this.finding.evidence.join('\n') : '';

      this.findingForm.patchValue({
        ...this.finding,
        identifiedDate,
        targetResolutionDate,
        actualResolutionDate,
        evidence
      });
    }
  }

  onSubmit(): void {
    if (this.findingForm.valid) {
      // Convert evidence text area to array
      const evidenceText = this.findingForm.get('evidence')?.value;
      const evidence = evidenceText ? 
        evidenceText.split('\n').filter((item: string) => item.trim().length > 0) : 
        [];

      const updatedFinding: Finding = {
        ...this.finding,
        ...this.findingForm.value,
        evidence
      };

      this.activeModal.close(updatedFinding);
    }
  }
}
