import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ESGMetric } from './../../compliance.types';

@Component({
  selector: 'app-view-metric-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View ESG Metric Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Name</label>
            <p class="mb-0">{{ metric.name }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ metric.description }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Category</label>
            <p class="mb-0">{{ metric.category }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Unit</label>
            <p class="mb-0">{{ metric.unit }}</p>
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Performance</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-muted small">Current Value</label>
            <p class="mb-0">{{ metric.current }} {{ metric.unit }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Target Value</label>
            <p class="mb-0">{{ metric.target }} {{ metric.unit }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Status</label>
            <div>
              <span [class]="'badge ' + getStatusClass(metric.status)">
                {{ metric.status }}
              </span>
            </div>
          </div>

          <div class="col-12">
            <div class="progress" style="height: 20px;">
              <div class="progress-bar" role="progressbar"
                [class]="'bg-' + getProgressClass(metric.status)"
                [style.width.%]="calculateProgress(metric.current, metric.target)"
                [attr.aria-valuenow]="calculateProgress(metric.current, metric.target)"
                aria-valuemin="0"
                aria-valuemax="100">
                {{ calculateProgress(metric.current, metric.target) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporting Details -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Reporting Details</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Reporting Period</label>
            <p class="mb-0">{{ metric.reportingPeriod }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Last Updated</label>
            <p class="mb-0">{{ formatDate(metric.lastUpdated) }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Next Report Due</label>
            <p class="mb-0">{{ formatDate(metric.nextReportDue) }}</p>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Additional Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Methodology</label>
            <p class="mb-0">{{ metric.methodology }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Data Source</label>
            <p class="mb-0">{{ metric.dataSource }}</p>
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
export class ViewMetricModalComponent {
  @Input() metric!: ESGMetric;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'On Track': 'bg-success',
      'At Risk': 'bg-warning',
      'Off Track': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getProgressClass(status: string): string {
    const classes: { [key: string]: string } = {
      'On Track': 'success',
      'At Risk': 'warning',
      'Off Track': 'danger'
    };
    return classes[status] || 'secondary';
  }

  calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.round(progress), 100);
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', metric: this.metric });
  }
}
