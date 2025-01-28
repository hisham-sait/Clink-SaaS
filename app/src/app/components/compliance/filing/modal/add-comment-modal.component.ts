import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing } from './../../compliance.types';

@Component({
  selector: 'app-add-comment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Comment</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="commentForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Filing Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Filing</label>
          <p class="mb-0">{{ filing.title }}</p>
          <small class="text-muted">
            {{ filing.type }} | {{ filing.authority }} | Ref: {{ filing.referenceNumber || 'Not assigned' }}
          </small>
        </div>

        <!-- Comment Type -->
        <div class="mb-3">
          <label class="form-label">Comment Type</label>
          <select class="form-select" formControlName="type">
            <option value="">Select Type</option>
            <option value="General">General Note</option>
            <option value="Update">Status Update</option>
            <option value="Question">Question</option>
            <option value="Communication">External Communication</option>
            <option value="Internal">Internal Discussion</option>
            <option value="Review">Review Comment</option>
            <option value="Action">Action Required</option>
          </select>
          <div class="form-text text-danger" *ngIf="commentForm.get('type')?.touched && commentForm.get('type')?.errors?.['required']">
            Comment type is required
          </div>
        </div>

        <!-- Comment Content -->
        <div class="mb-3">
          <label class="form-label">Comment</label>
          <textarea 
            class="form-control" 
            rows="4" 
            formControlName="content"
            placeholder="Enter your comment here..."
          ></textarea>
          <div class="form-text text-danger" *ngIf="commentForm.get('content')?.touched && commentForm.get('content')?.errors?.['required']">
            Comment content is required
          </div>
        </div>

        <!-- Visibility -->
        <div class="mb-3">
          <label class="form-label">Visibility</label>
          <select class="form-select" formControlName="visibility">
            <option value="All">Visible to All</option>
            <option value="Internal">Internal Only</option>
            <option value="Reviewers">Reviewers Only</option>
            <option value="Assignee">Assignee Only</option>
          </select>
          <div class="form-text text-danger" *ngIf="commentForm.get('visibility')?.touched && commentForm.get('visibility')?.errors?.['required']">
            Visibility setting is required
          </div>
        </div>

        <!-- Priority -->
        <div class="mb-3">
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="isHighPriority"
              id="priorityCheck"
            >
            <label class="form-check-label" for="priorityCheck">
              Mark as High Priority
            </label>
          </div>
          <small class="form-text text-muted">
            High priority comments will be highlighted and may trigger notifications
          </small>
        </div>

        <!-- Notify -->
        <div class="mb-3">
          <label class="form-label">Notify</label>
          <select class="form-select" formControlName="notify" multiple>
            <option value="assignee">Assignee</option>
            <option value="reviewer">Reviewer</option>
            <option value="manager">Manager</option>
            <option value="team">Team</option>
          </select>
          <small class="form-text text-muted">
            Selected users will receive a notification about this comment
          </small>
        </div>

        <!-- Follow-up -->
        <div class="mb-3">
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="requiresFollowup"
              id="followupCheck"
              (change)="onFollowupChange($event)"
            >
            <label class="form-check-label" for="followupCheck">
              Requires Follow-up
            </label>
          </div>
        </div>

        <!-- Follow-up Date -->
        <div class="mb-3" *ngIf="commentForm.get('requiresFollowup')?.value">
          <label class="form-label">Follow-up Date</label>
          <input 
            type="date" 
            class="form-control" 
            formControlName="followupDate"
          >
          <div class="form-text text-danger" *ngIf="commentForm.get('followupDate')?.touched && commentForm.get('followupDate')?.errors?.['required']">
            Follow-up date is required when follow-up is enabled
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!commentForm.valid">
          Add Comment
        </button>
      </div>
    </form>
  `
})
export class AddCommentModalComponent {
  @Input() filing!: Filing;

  commentForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      type: ['', Validators.required],
      content: ['', Validators.required],
      visibility: ['All', Validators.required],
      isHighPriority: [false],
      notify: [[]],
      requiresFollowup: [false],
      followupDate: [''],
      createdBy: [''], // Will be set from current user
      createdAt: [new Date().toISOString()],
      filingId: [''] // Will be set from input filing
    });
  }

  ngOnInit(): void {
    if (this.filing) {
      this.commentForm.patchValue({
        filingId: this.filing.id
      });
    }

    // Add conditional validation for followupDate
    this.commentForm.get('requiresFollowup')?.valueChanges.subscribe(requiresFollowup => {
      const followupDateControl = this.commentForm.get('followupDate');
      if (requiresFollowup) {
        followupDateControl?.setValidators([Validators.required]);
      } else {
        followupDateControl?.clearValidators();
      }
      followupDateControl?.updateValueAndValidity();
    });
  }

  onFollowupChange(event: any): void {
    if (!event.target.checked) {
      this.commentForm.patchValue({
        followupDate: ''
      });
    }
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      const result = {
        filing: this.filing,
        comment: this.commentForm.value
      };
      this.activeModal.close(result);
    }
  }
}
