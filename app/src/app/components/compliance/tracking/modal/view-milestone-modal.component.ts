import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Milestone } from '../../compliance.types';

@Component({
  selector: 'app-view-milestone-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Milestone Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="card-title mb-1">{{milestone.title}}</h6>
              <p class="text-muted small mb-0">{{milestone.description}}</p>
            </div>
            <span [class]="'badge ' + getStatusClass(milestone.status)">{{milestone.status}}</span>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Timeline</h6>
          <div class="mb-2">
            <small class="text-muted d-block">Due Date</small>
            <span [class]="isOverdue(milestone.dueDate) ? 'text-danger' : isDueSoon(milestone.dueDate) ? 'text-warning' : ''">
              {{milestone.dueDate | date:'mediumDate'}}
              <small class="d-block">{{calculateDaysRemaining(milestone.dueDate)}} days remaining</small>
            </span>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Progress</h6>
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="progress flex-grow-1" style="height: 6px;">
              <div class="progress-bar rounded-pill" role="progressbar" [style.width]="milestone.progress + '%'"
                   [ngClass]="{
                     'bg-success': milestone.progress >= 75,
                     'bg-warning': milestone.progress >= 25 && milestone.progress < 75,
                     'bg-danger': milestone.progress < 25
                   }">
              </div>
            </div>
            <span class="small">{{milestone.progress}}%</span>
          </div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Assignment</h6>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-person-circle text-secondary"></i>
            <span>{{milestone.owner}}</span>
          </div>
        </div>
      </div>

      <!-- Deliverables -->
      <div class="card mb-3" *ngIf="milestone.deliverables?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Deliverables</h6>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-secondary" *ngFor="let deliverable of milestone.deliverables">{{deliverable}}</span>
          </div>
        </div>
      </div>

      <!-- Dependencies -->
      <div class="card mb-3" *ngIf="milestone.dependencies?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Dependencies</h6>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-secondary" *ngFor="let dependency of milestone.dependencies">{{dependency}}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="card" *ngIf="milestone.notes?.length">
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted small">Notes</h6>
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0 py-2" *ngFor="let note of milestone.notes">
              <p class="small mb-0">{{note}}</p>
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
export class ViewMilestoneModalComponent {
  @Input() milestone!: Milestone;

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
