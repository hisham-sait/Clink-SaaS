import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing } from './../../compliance.types';

@Component({
  selector: 'app-add-reminder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Reminder</h5>
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

        <!-- Reminder Type -->
        <div class="mb-3">
          <label class="form-label">Reminder Type</label>
          <select class="form-select" formControlName="type" (change)="onTypeChange()">
            <option value="">Select Type</option>
            <option value="Due Date">Due Date Reminder</option>
            <option value="Review">Review Required</option>
            <option value="Document">Document Required</option>
            <option value="Submission">Submission Deadline</option>
            <option value="Follow-up">Follow-up Required</option>
            <option value="Custom">Custom Reminder</option>
          </select>
          <div class="form-text text-danger" *ngIf="reminderForm.get('type')?.touched && reminderForm.get('type')?.errors?.['required']">
            Reminder type is required
          </div>
        </div>

        <!-- Reminder Details -->
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
        </div>

        <!-- Timing -->
        <div class="row">
          <div class="col-md-6 mb-3">
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

          <div class="col-md-6 mb-3">
            <label class="form-label">Time</label>
            <input 
              type="time" 
              class="form-control" 
              formControlName="time"
            >
            <div class="form-text text-danger" *ngIf="reminderForm.get('time')?.touched && reminderForm.get('time')?.errors?.['required']">
              Time is required
            </div>
          </div>
        </div>

        <!-- Reminder Schedule -->
        <div class="mb-3">
          <label class="form-label">Reminder Schedule</label>
          <select class="form-select" formControlName="schedule">
            <option value="once">One-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom Schedule</option>
          </select>
        </div>

        <!-- Advanced Reminders -->
        <div class="mb-3">
          <label class="form-label">Advanced Reminders</label>
          <div class="form-check mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="advancedReminder1"
              id="advancedReminder1"
            >
            <label class="form-check-label" for="advancedReminder1">
              1 week before
            </label>
          </div>
          <div class="form-check mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="advancedReminder2"
              id="advancedReminder2"
            >
            <label class="form-check-label" for="advancedReminder2">
              3 days before
            </label>
          </div>
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="advancedReminder3"
              id="advancedReminder3"
            >
            <label class="form-check-label" for="advancedReminder3">
              1 day before
            </label>
          </div>
        </div>

        <!-- Notification Methods -->
        <div class="mb-3">
          <label class="form-label">Notification Methods</label>
          <div class="form-check mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="emailNotification"
              id="emailCheck"
            >
            <label class="form-check-label" for="emailCheck">
              Email Notification
            </label>
          </div>
          <div class="form-check mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="systemNotification"
              id="systemCheck"
            >
            <label class="form-check-label" for="systemCheck">
              System Notification
            </label>
          </div>
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="calendarEvent"
              id="calendarCheck"
            >
            <label class="form-check-label" for="calendarCheck">
              Add to Calendar
            </label>
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
        </div>

        <!-- Priority -->
        <div class="mb-3">
          <label class="form-label">Priority</label>
          <select class="form-select" formControlName="priority">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!reminderForm.valid">
          Add Reminder
        </button>
      </div>
    </form>
  `
})
export class AddReminderModalComponent {
  @Input() filing!: Filing;

  reminderForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.reminderForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      time: ['09:00', Validators.required],
      schedule: ['once'],
      advancedReminder1: [false],
      advancedReminder2: [false],
      advancedReminder3: [false],
      emailNotification: [true],
      systemNotification: [true],
      calendarEvent: [false],
      recipients: [[]],
      priority: ['Medium'],
      status: ['Active'],
      createdBy: [''], // Will be set from current user
      createdAt: [new Date().toISOString()],
      filingId: [''] // Will be set from input filing
    });
  }

  ngOnInit(): void {
    if (this.filing) {
      this.reminderForm.patchValue({
        filingId: this.filing.id,
        dueDate: new Date(this.filing.dueDate).toISOString().split('T')[0]
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

  onTypeChange(): void {
    const type = this.reminderForm.get('type')?.value;
    let title = '';

    switch (type) {
      case 'Due Date':
        title = `${this.filing.title} - Due Date Reminder`;
        break;
      case 'Review':
        title = `${this.filing.title} - Review Required`;
        break;
      case 'Document':
        title = `${this.filing.title} - Document Required`;
        break;
      case 'Submission':
        title = `${this.filing.title} - Submission Deadline`;
        break;
      case 'Follow-up':
        title = `${this.filing.title} - Follow-up Required`;
        break;
    }

    if (title) {
      this.reminderForm.patchValue({ title });
    }
  }

  onSubmit(): void {
    if (this.reminderForm.valid) {
      const result = {
        filing: this.filing,
        reminder: this.reminderForm.value
      };
      this.activeModal.close(result);
    }
  }
}
