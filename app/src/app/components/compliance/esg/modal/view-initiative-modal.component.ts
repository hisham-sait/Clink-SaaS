import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ESGInitiative } from './../../compliance.types';

@Component({
  selector: 'app-view-initiative-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View ESG Initiative Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Title</label>
            <p class="mb-0">{{ initiative.title }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ initiative.description }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Category</label>
            <p class="mb-0">{{ initiative.category }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Status</label>
            <div>
              <span [class]="'badge ' + getStatusClass(initiative.status)">
                {{ initiative.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Timeline</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Start Date</label>
            <p class="mb-0">{{ formatDate(initiative.startDate) }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">End Date</label>
            <p class="mb-0">{{ formatDate(initiative.endDate) }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Duration</label>
            <p class="mb-0">{{ calculateDuration(initiative.startDate, initiative.endDate) }}</p>
          </div>
        </div>
      </div>

      <!-- Budget -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Budget</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-muted small">Total Budget</label>
            <p class="mb-0">{{ formatCurrency(initiative.budget) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Spent</label>
            <p class="mb-0">{{ formatCurrency(initiative.spent) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Remaining</label>
            <p class="mb-0">{{ formatCurrency(initiative.budget - initiative.spent) }}</p>
          </div>

          <div class="col-12">
            <div class="progress" style="height: 20px;">
              <div class="progress-bar" role="progressbar"
                [class]="'bg-' + getBudgetProgressClass(initiative.spent / initiative.budget)"
                [style.width.%]="calculateBudgetProgress(initiative.spent, initiative.budget)"
                [attr.aria-valuenow]="calculateBudgetProgress(initiative.spent, initiative.budget)"
                aria-valuemin="0"
                aria-valuemax="100">
                {{ calculateBudgetProgress(initiative.spent, initiative.budget) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Impact -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Impact</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Expected Impact</label>
            <p class="mb-0">{{ initiative.impact }}</p>
          </div>
        </div>
      </div>

      <!-- Stakeholders -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Stakeholders</h6>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let stakeholder of initiative.stakeholders">
            <i class="bi bi-person-fill text-primary me-2"></i>
            {{ stakeholder }}
          </div>
          <div class="list-group-item text-muted" *ngIf="!initiative.stakeholders?.length">
            No stakeholders identified
          </div>
        </div>
      </div>

      <!-- Related Metrics -->
      <div>
        <h6 class="text-primary mb-3">Related Metrics</h6>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let metric of initiative.metrics">
            <i class="bi bi-graph-up text-primary me-2"></i>
            {{ metric }}
          </div>
          <div class="list-group-item text-muted" *ngIf="!initiative.metrics?.length">
            No related metrics
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">Edit</button>
    </div>
  `
})
export class ViewInitiativeModalComponent {
  @Input() initiative!: ESGInitiative;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Planned': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'On Hold': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  calculateBudgetProgress(spent: number, budget: number): number {
    if (budget === 0) return 0;
    const progress = (spent / budget) * 100;
    return Math.min(Math.round(progress), 100);
  }

  getBudgetProgressClass(ratio: number): string {
    if (ratio >= 1) return 'danger';
    if (ratio >= 0.75) return 'warning';
    return 'success';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', initiative: this.initiative });
  }
}
