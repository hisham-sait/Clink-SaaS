import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, Assessment, Finding } from './../../compliance.types';

@Component({
  selector: 'app-edit-assessment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Assessment</h5>
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

                <div *ngIf="finding.get('status')?.value === 'Closed'" class="mb-2">
                  <input 
                    type="date" 
                    class="form-control" 
                    formControlName="closedDate"
                    placeholder="Closed date"
                  >
                </div>

                <!-- Existing Evidence -->
                <div *ngIf="finding.get('evidence')?.value?.length" class="mb-2">
                  <label class="form-label small">Evidence</label>
                  <ul class="list-group">
                    <li *ngFor="let item of finding.get('evidence')?.value; let j=index" class="list-group-item d-flex justify-content-between align-items-center">
                      <span>{{ item }}</span>
                      <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeFindingEvidence(i, j)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </li>
                  </ul>
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

        <!-- Existing Attachments -->
        <div class="mb-3" *ngIf="assessment.attachments?.length">
          <label class="form-label">Current Attachments</label>
          <ul class="list-group">
            <li *ngFor="let attachment of assessment.attachments; let i=index" class="list-group-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-paperclip me-2"></i>
                <span>{{ attachment }}</span>
              </div>
              <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeAttachment(i)">
                <i class="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>

        <!-- New Attachments -->
        <div class="mb-3">
          <label class="form-label">Add Attachments</label>
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
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditAssessmentModalComponent implements OnInit {
  @Input() requirement!: RegulatoryRequirement;
  @Input() assessment!: Assessment;

  assessmentForm: FormGroup;
  selectedFiles: File[] = [];
  removedAttachments: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.assessmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      status: ['', Validators.required],
      assessor: ['', Validators.required],
      date: ['', Validators.required],
      findings: this.fb.array([]),
      recommendations: [''],
      attachments: [[]],
      requirementId: [''] // Will be set from input requirement
    });
  }

  ngOnInit(): void {
    if (this.assessment) {
      // Format date for input[type="date"]
      const date = new Date(this.assessment.date).toISOString().split('T')[0];

      // Convert recommendations array to newline-separated string
      const recommendations = this.assessment.recommendations?.join('\n') || '';

      // Set basic form values
      this.assessmentForm.patchValue({
        ...this.assessment,
        date,
        recommendations,
        requirementId: this.requirement.id
      });

      // Set findings
      this.assessment.findings?.forEach(finding => {
        this.findings.push(this.createFindingForm(finding));
      });
    }
  }

  get findings() {
    return this.assessmentForm.get('findings') as FormArray;
  }

  createFindingForm(finding?: Finding) {
    return this.fb.group({
      id: [finding?.id || ''],
      title: [finding?.title || '', Validators.required],
      description: [finding?.description || '', Validators.required],
      severity: [finding?.severity || '', Validators.required],
      status: [finding?.status || 'Open', Validators.required],
      identifiedDate: [finding?.identifiedDate ? new Date(finding.identifiedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], Validators.required],
      remediation: [finding?.remediation || ''],
      dueDate: [finding?.dueDate ? new Date(finding.dueDate).toISOString().split('T')[0] : ''],
      assignedTo: [finding?.assignedTo || ''],
      closedDate: [finding?.closedDate ? new Date(finding.closedDate).toISOString().split('T')[0] : ''],
      evidence: [finding?.evidence || []]
    });
  }

  addFinding() {
    this.findings.push(this.createFindingForm());
  }

  removeFinding(index: number) {
    this.findings.removeAt(index);
  }

  removeFindingEvidence(findingIndex: number, evidenceIndex: number) {
    const finding = this.findings.at(findingIndex);
    const evidence = finding.get('evidence')?.value as string[];
    evidence.splice(evidenceIndex, 1);
    finding.patchValue({ evidence });
  }

  removeAttachment(index: number) {
    const attachment = this.assessment.attachments?.[index];
    if (attachment) {
      this.removedAttachments.push(attachment);
      this.assessment.attachments = this.assessment.attachments?.filter((_, i) => i !== index);
    }
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

      // Update attachments
      const currentAttachments = this.assessment.attachments?.filter(a => !this.removedAttachments.includes(a)) || [];
      const newAttachments = this.selectedFiles.map(file => file.name);
      const attachments = [...currentAttachments, ...newAttachments];

      const result = {
        requirement: this.requirement,
        assessment: {
          ...this.assessment,
          ...formValue,
          recommendations,
          attachments
        },
        files: this.selectedFiles,
        removedAttachments: this.removedAttachments
      };

      this.activeModal.close(result);
    }
  }
}
