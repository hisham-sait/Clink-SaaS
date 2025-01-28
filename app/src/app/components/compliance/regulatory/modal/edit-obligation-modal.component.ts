import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement, Obligation } from './../../compliance.types';

interface Comment {
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-edit-obligation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Obligation</h5>
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

        <!-- Existing Evidence -->
        <div class="mb-3" *ngIf="obligation.evidence?.length">
          <label class="form-label">Current Evidence</label>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of obligation.evidence">
              <span>{{ item }}</span>
              <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeEvidence(item)">
                <i class="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>

        <!-- Existing Attachments -->
        <div class="mb-3" *ngIf="obligation.attachments?.length">
          <label class="form-label">Current Attachments</label>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let attachment of obligation.attachments">
              <div class="d-flex align-items-center">
                <i class="bi bi-paperclip me-2"></i>
                <span>{{ attachment }}</span>
              </div>
              <button type="button" class="btn btn-sm btn-link text-danger" (click)="removeAttachment(attachment)">
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

        <!-- Comments -->
        <div class="mb-3">
          <label class="form-label">Add Comment</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="newComment"
            placeholder="Add a new comment"
          ></textarea>
        </div>

        <!-- Existing Comments -->
        <div class="mb-3" *ngIf="obligation.comments?.length">
          <label class="form-label">Comment History</label>
          <div class="list-group">
            <div class="list-group-item" *ngFor="let comment of obligation.comments">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
              </div>
              <p class="mb-0">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!obligationForm.valid">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditObligationModalComponent implements OnInit {
  @Input() requirement!: RegulatoryRequirement;
  @Input() obligation!: Obligation & { comments?: Comment[] };

  obligationForm: FormGroup;
  selectedFiles: File[] = [];
  removedEvidence: string[] = [];
  removedAttachments: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.obligationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      frequency: ['', Validators.required],
      status: ['', Validators.required],
      assignedTo: [''],
      evidence: [''],
      newComment: [''],
      attachments: [[]]
    });
  }

  ngOnInit(): void {
    if (this.obligation) {
      // Format date for input[type="date"]
      const dueDate = new Date(this.obligation.dueDate).toISOString().split('T')[0];

      // Convert evidence array to newline-separated string
      const evidence = this.obligation.evidence?.join('\n') || '';

      this.obligationForm.patchValue({
        ...this.obligation,
        dueDate,
        evidence
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  removeEvidence(item: string): void {
    this.removedEvidence.push(item);
    const currentEvidence = this.obligation.evidence?.filter(e => e !== item) || [];
    this.obligationForm.patchValue({
      evidence: currentEvidence.join('\n')
    });
  }

  removeAttachment(attachment: string): void {
    this.removedAttachments.push(attachment);
    const currentAttachments = this.obligation.attachments?.filter(a => a !== attachment) || [];
    this.obligation = {
      ...this.obligation,
      attachments: currentAttachments
    };
  }

  onSubmit(): void {
    if (this.obligationForm.valid) {
      const formValue = this.obligationForm.value;
      
      // Convert evidence and comments to arrays
      const newEvidence = formValue.evidence ? formValue.evidence.split('\n').filter((e: string) => e.trim()) : [];
      const currentEvidence = this.obligation.evidence?.filter(e => !this.removedEvidence.includes(e)) || [];
      const evidence = [...new Set([...currentEvidence, ...newEvidence])];

      const currentComments = this.obligation.comments || [];
      const comments = formValue.newComment ? 
        [...currentComments, { content: formValue.newComment, createdAt: new Date().toISOString() }] : 
        currentComments;

      const currentAttachments = this.obligation.attachments?.filter(a => !this.removedAttachments.includes(a)) || [];
      const newAttachments = this.selectedFiles.map(file => file.name);
      const attachments = [...currentAttachments, ...newAttachments];

      const result = {
        requirement: this.requirement,
        obligation: {
          ...this.obligation,
          ...formValue,
          evidence,
          comments,
          attachments
        },
        files: this.selectedFiles,
        removedAttachments: this.removedAttachments
      };

      delete result.obligation.newComment;
      this.activeModal.close(result);
    }
  }
}
