import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing, FilingReminder } from './../../compliance.types';

@Component({
  selector: 'app-view-reminders-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Filing Reminders</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Filing Reference -->
      <div class="mb-4">
        <label class="form-label text-muted small">Filing</label>
        <p class="mb-0">{{ filing.title }}</p>
        <small class="text-muted">
          {{ filing.type }} | {{ filing.authority }} | Due: {{ formatDate(filing.dueDate) }}
        </small>
      </div>

      <!-- Reminders List -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary mb-0">Active Reminders</h6>
          <button class="btn btn-sm btn-primary" (click)="onAddReminder()">
            <i class="bi bi-plus-lg me-1"></i>Add Reminder
          </button>
        </div>

        <div class="list-group" *ngIf="filing.reminders?.length; else noReminders">
          <div class="list-group-item" *ngFor="let reminder of pendingReminders">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0">{{ reminder.title }}</h6>
                <small [class]="'text-' + getTypeClass(reminder.type)">
                  {{ reminder.type }} Reminder
                </small>
              </div>
              <div class="dropdown">
                <button class="btn btn-link btn-sm p-0 text-muted" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" (click)="$event.preventDefault(); onEditReminder(reminder)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" (click)="$event.preventDefault(); onAcknowledgeReminder(reminder)">
                      <i class="bi bi-check2-circle me-2"></i>Acknowledge
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" (click)="$event.preventDefault(); onDeleteReminder(reminder)">
                      <i class="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <p class="mb-2 small" *ngIf="reminder.description">{{ reminder.description }}</p>

            <div class="d-flex gap-3 mb-2">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(reminder.dueDate) }}
              </small>
              <small class="text-muted">
                <i class="bi bi-arrow-repeat me-1"></i>
                {{ reminder.frequency }}
              </small>
            </div>

            <div class="d-flex gap-2">
              <span class="badge bg-secondary" *ngFor="let recipient of reminder.recipients">
                {{ recipient }}
              </span>
            </div>
          </div>
        </div>

        <ng-template #noReminders>
          <div class="text-center py-4 text-muted">
            <i class="bi bi-bell-slash fs-2 mb-2"></i>
            <p class="mb-0">No active reminders</p>
            <small>Click the Add Reminder button to create one</small>
          </div>
        </ng-template>
      </div>

      <!-- Sent Reminders -->
      <div *ngIf="sentReminders.length">
        <h6 class="text-primary mb-3">Sent Reminders</h6>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let reminder of sentReminders">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">{{ reminder.title }}</h6>
                <small class="text-muted">Due: {{ formatDate(reminder.dueDate) }}</small>
              </div>
              <span class="badge bg-primary">{{ reminder.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Acknowledged Reminders -->
      <div *ngIf="acknowledgedReminders.length">
        <h6 class="text-primary mb-3">Acknowledged Reminders</h6>
        <div class="list-group">
          <div class="list-group-item text-muted" *ngFor="let reminder of acknowledgedReminders">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">{{ reminder.title }}</h6>
                <small>Due: {{ formatDate(reminder.dueDate) }}</small>
              </div>
              <span class="badge bg-success">Acknowledged</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class ViewRemindersModalComponent {
  @Input() filing!: Filing;

  constructor(public activeModal: NgbActiveModal) {}

  get pendingReminders(): FilingReminder[] {
    return this.filing.reminders?.filter(r => r.status === 'Pending') || [];
  }

  get sentReminders(): FilingReminder[] {
    return this.filing.reminders?.filter(r => r.status === 'Sent') || [];
  }

  get acknowledgedReminders(): FilingReminder[] {
    return this.filing.reminders?.filter(r => r.status === 'Acknowledged') || [];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Email': 'primary',
      'System': 'info',
      'SMS': 'warning'
    };
    return classes[type] || 'secondary';
  }

  onAddReminder(): void {
    this.activeModal.close({ action: 'add' });
  }

  onEditReminder(reminder: FilingReminder): void {
    this.activeModal.close({ action: 'edit', reminder });
  }

  onAcknowledgeReminder(reminder: FilingReminder): void {
    this.activeModal.close({ 
      action: 'acknowledge', 
      reminder: {
        ...reminder,
        status: 'Acknowledged'
      }
    });
  }

  onDeleteReminder(reminder: FilingReminder): void {
    this.activeModal.close({ action: 'delete', reminder });
  }
}
