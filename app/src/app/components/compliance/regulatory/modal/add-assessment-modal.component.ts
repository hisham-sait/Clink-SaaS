import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, RiskLevel } from './../../compliance.types';

@Component({
  selector: 'app-add-assessment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Assessment</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="assessmentForm" (ngSubmit)="onSubmit()">
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
            placeholder="Enter assessment title"
          >
          <div class="form-text text-danger" *ngIf="assessmentForm.get('title')?.touched && assessmentForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="description"
            placeholder="Enter assessment description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="assessmentForm.get('description')?.touched && assessmentForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Assessment Details -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Type</label>
            <select class="form-select" formControlName="type">
              <option value="">Select Type</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
              <option value="Self">Self</option>
            </select>
            <div class="form-text text-danger" *ngIf="assessmentForm.get('type')?.touched && assessmentForm.get('type')?.errors?.['required']">
              Type is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div class="form-text text-danger" *ngIf="assessmentForm.get('status')?.touched && assessmentForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>
        </div>

        <!-- Assessor and Date -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Assessor</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="assessor"
              placeholder="Enter assessor name"
            >
            <div class="form-text text-danger" *ngIf="assessmentForm.get('assessor')?.touched && assessmentForm.get('assessor')?.errors?.['required']">
              Assessor is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Assessment Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="date"
            >
            <div class="form-text text-danger" *ngIf="assessmentForm.get('date')?.touched && assessmentForm.get('date')?.errors?.['required']">
              Date is required
            </div>
          </div>
        </div>

        <!-- Findings -->
        <div class="mb-3">
          <label class="form-label d-flex justify-content-between align-items-center">
            <span>Findings</span>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="addFinding()">
              <i class="bi bi-plus-lg"></i> Add Finding
            </button>
          </label>
          <div formArrayName="findings">
            <div *ngFor="let finding of findings.controls; let i=index" [formGroupName]="i" class="card mb-2">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-subtitle text-muted">Finding {{ i + 1 }}</h6>
                  <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeFinding(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>

                <div class="mb-2">
                  <input 
                    type="text" 
                    class="form-control" 
                    formControlName="title"
                    placeholder="Finding title"
                  >
                </div>

                <div class="mb-2">
                  <textarea 
                    class="form-control" 
                    formControlName="description"
                    placeholder="Finding description"
                    rows="2"
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-2">
                    <select class="form-select" formControlName="severity">
                      <option value="">Select Severity</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-2">
                    <select class="form-select" formControlName="status">
                      <option value="">Select Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-2">
                    <input 
                      type="date" 
                      class="form-control" 
                      formControlName="dueDate"
                      placeholder="Due date"
                    >
                  </div>

                  <div class="col-md-6 mb-2">
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="assignedTo"
                      placeholder="Assigned to"
                    >
                  </div>
                </div>

                <div class="mb-2">
                  <textarea 
                    class="form-control" 
                    formControlName="remediation"
                    placeholder="Remediation plan"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="mb-3">
          <label class="form-label">Recommendations</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="recommendations"
            placeholder="Enter recommendations (one per line)"
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
        <button type="submit" class="btn btn-primary" [disabled]="!assessmentForm.valid">
          Add Assessment
        </button>
      </div>
    </form>
  `
})
export class AddAssessmentModalComponent {
  @Input() requirement!: RegulatoryRequirement;

  assessmentForm: FormGroup;
  selectedFiles: File[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.assessmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      status: ['Planned', Validators.required],
      assessor: ['', Validators.required],
      date: ['', Validators.required],
      findings: this.fb.array([]),
      recommendations: [''],
      attachments: [[]],
      requirementId: [''] // Will be set from input requirement
    });
  }

  ngOnInit(): void {
    if (this.requirement) {
      this.assessmentForm.patchValue({
        requirementId: this.requirement.id
      });
    }
  }

  get findings() {
    return this.assessmentForm.get('findings') as FormArray;
  }

  createFindingForm() {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      status: ['Open', Validators.required],
      identifiedDate: [new Date().toISOString().split('T')[0], Validators.required],
      remediation: [''],
      dueDate: [''],
      assignedTo: [''],
      closedDate: [''],
      evidence: [[]]
    });
  }

  addFinding() {
    this.findings.push(this.createFindingForm());
  }

  removeFinding(index: number) {
    this.findings.removeAt(index);
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

    this.assessmentForm.patchValue({
      attachments: this.selectedFiles.map(file => file.name)
    });
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      const formValue = this.assessmentForm.value;
      
      // Convert recommendations to array if they contain multiple lines
      const recommendations = formValue.recommendations ? 
        formValue.recommendations.split('\n').filter((r: string) => r.trim()) : 
        [];

      const result = {
        requirement: this.requirement,
        assessment: {
          ...formValue,
          recommendations
        },
        files: this.selectedFiles
      };

      this.activeModal.close(result);
    }
  }
}
