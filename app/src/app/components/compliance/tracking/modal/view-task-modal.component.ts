import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrackingItem } from '../../compliance.types';

@Component({
  selector: 'app-view-task-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Task Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="card-title mb-1">{{task.title}}</h6>
              <p class="text-muted small mb-0">{{task.description}}</p>
            </div>
            <span [class]="'badge ' + getStatusClass(task.status)">{{task.status}}</span>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted small">Category</h6>
              <p class="card-text">{{task.category}}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted small">Priority</h6>
              <p class="card-text" [class]="getPriorityClass(task.priority)">{{task.priority}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Timeline</h6>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Start Date</small>
                <span>{{task.startDate | date:'mediumDate'}}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Due Date</small>
                <span [class]="isOverdue(task.dueDate) ? 'text-danger' : isDueSoon(task.dueDate) ? 'text-warning' : ''">
                  {{task.dueDate | date:'mediumDate'}}
                  <small class="d-block">{{calculateDaysRemaining(task.dueDate)}} days remaining</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Progress</h6>
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="progress flex-grow-1" style="height: 6px;">
              <div class="progress-bar rounded-pill" role="progressbar" [style.width]="task.progress + '%'"
                   [ngClass]="{
                     'bg-success': task.progress >= 75,
                     'bg-warning': task.progress >= 25 && task.progress < 75,
                     'bg-danger': task.progress < 25
                   }">
              </div>
            </div>
            <span class="small">{{task.progress}}%</span>
          </div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Assignment</h6>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-person-circle text-secondary"></i>
            <span>{{task.owner}}</span>
          </div>
        </div>
      </div>

      <!-- Dependencies -->
      <div class="card mb-3" *ngIf="task.dependencies?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Dependencies</h6>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-secondary" *ngFor="let dep of task.dependencies">{{dep}}</span>
          </div>
        </div>
      </div>

      <!-- Milestones -->
      <div class="card mb-3" *ngIf="task.milestones?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Milestones</h6>
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0 py-2" *ngFor="let milestone of task.milestones">
              <div class="d-flex justify-content-between align-items-center">
                <span class="small">{{milestone.title}}</span>
                <span class="badge" [ngClass]="getStatusClass(milestone.status)">{{milestone.status}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="card" *ngIf="task.alerts?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Risk Alerts</h6>
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0 py-2" *ngFor="let alert of task.alerts">
              <div class="d-flex justify-content-between align-items-center">
                <span class="small">{{alert.title}}</span>
                <span [class]="'badge ' + getAlertClass(alert.type)">{{alert.type}}</span>
              </div>
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
export class ViewTaskModalComponent {
  @Input() task!: TrackingItem;

  constructor(public activeModal: NgbActiveModal) {}

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'On Track': 'bg-success',
      'At Risk': 'bg-warning',
      'Off Track': 'bg-danger',
      'Completed': 'bg-success',
      'Not Started': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Critical': 'text-danger fw-bold',
      'High': 'text-danger',
      'Medium': 'text-warning',
      'Low': 'text-info'
    };
    return classes[priority] || '';
  }

  getAlertClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Critical': 'bg-danger',
      'Warning': 'bg-warning',
      'Info': 'bg-info'
    };
    return classes[type] || 'bg-secondary';
  }

  calculateDaysRemaining(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string): boolean {
    return this.calculateDaysRemaining(dueDate) < 0;
  }

  isDueSoon(dueDate: string): boolean {
    const daysRemaining = this.calculateDaysRemaining(dueDate);
    return daysRemaining >= 0 && daysRemaining <= 7;
  }
}
