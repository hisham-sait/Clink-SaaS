import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing, FilingReminder } from './../../compliance.types';

@Component({
  selector: 'app-edit-reminder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Reminder</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="reminderForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Filing Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Filing</label>
          <p class="mb-0">{{ filing.title }}</p>
          <small class="text-muted">
            {{ filing.type }} | {{ filing.authority }} | Due: {{ formatDate(filing.dueDate) }}
          </small>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="title"
            placeholder="Enter reminder title"
          >
          <div class="form-text text-danger" *ngIf="reminderForm.get('title')?.touched && reminderForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="description"
            placeholder="Enter reminder description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="reminderForm.get('description')?.touched && reminderForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Reminder Details -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Type</label>
            <select class="form-select" formControlName="type">
              <option value="">Select Type</option>
              <option value="Email">Email</option>
              <option value="System">System</option>
              <option value="SMS">SMS</option>
            </select>
            <div class="form-text text-danger" *ngIf="reminderForm.get('type')?.touched && reminderForm.get('type')?.errors?.['required']">
              Type is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Frequency</label>
            <select class="form-select" formControlName="frequency">
              <option value="">Select Frequency</option>
              <option value="Once">Once</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
            <div class="form-text text-danger" *ngIf="reminderForm.get('frequency')?.touched && reminderForm.get('frequency')?.errors?.['required']">
              Frequency is required
            </div>
          </div>
        </div>

        <!-- Due Date -->
        <div class="mb-3">
          <label class="form-label">Due Date</label>
          <input 
            type="date" 
            class="form-control" 
            formControlName="dueDate"
          >
          <div class="form-text text-danger" *ngIf="reminderForm.get('dueDate')?.touched && reminderForm.get('dueDate')?.errors?.['required']">
            Due date is required
          </div>
        </div>

        <!-- Recipients -->
        <div class="mb-3">
          <label class="form-label">Recipients</label>
          <select class="form-select" formControlName="recipients" multiple>
            <option value="assignee">Assignee</option>
            <option value="reviewer">Reviewer</option>
            <option value="manager">Manager</option>
            <option value="team">Team</option>
          </select>
          <small class="form-text text-muted">
            Select who should receive this reminder
          </small>
          <div class="form-text text-danger" *ngIf="reminderForm.get('recipients')?.touched && reminderForm.get('recipients')?.errors?.['required']">
            At least one recipient is required
          </div>
        </div>

        <!-- Status -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="Pending">Pending</option>
            <option value="Sent">Sent</option>
            <option value="Acknowledged">Acknowledged</option>
          </select>
          <div class="form-text text-danger" *ngIf="reminderForm.get('status')?.touched && reminderForm.get('status')?.errors?.['required']">
            Status is required
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!reminderForm.valid">
          Save Changes
        </button>
      </div>
    </form>
  `
})
export class EditReminderModalComponent implements OnInit {
  @Input() filing!: Filing;
  @Input() reminder!: FilingReminder;

  reminderForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.reminderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      frequency: ['', Validators.required],
      dueDate: ['', Validators.required],
      recipients: [[], Validators.required],
      status: ['Pending', Validators.required],
      filingId: [''] // Will be set from input filing
    });
  }

  ngOnInit(): void {
    if (this.filing && this.reminder) {
      // Format date for input[type="date"]
      const dueDate = new Date(this.reminder.dueDate).toISOString().split('T')[0];

      this.reminderForm.patchValue({
        ...this.reminder,
        dueDate,
        filingId: this.filing.id
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

  onSubmit(): void {
    if (this.reminderForm.valid) {
      const result = {
        filing: this.filing,
        reminder: {
          ...this.reminder,
          ...this.reminderForm.value
        }
      };
      this.activeModal.close(result);
    }
  }
}
