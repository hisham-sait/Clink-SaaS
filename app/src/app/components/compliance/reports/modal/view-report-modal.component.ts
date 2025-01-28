import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../compliance.types';

@Component({
  selector: 'app-view-report-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Report Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="fw-bold mb-0">{{report.title}}</h6>
            <span [class]="'badge ' + getStatusClass(report.status)">{{report.status}}</span>
          </div>
          <p class="text-muted small mb-0">{{report.description}}</p>
        </div>

        <!-- Details Grid -->
        <div class="col-12">
          <div class="row g-2">
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">Category</small>
                    <span class="small">{{report.category}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">Frequency</small>
                    <span class="small">{{report.frequency}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Period -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Reporting Period</small>
              <div class="row g-2">
                <div class="col-6">
                  <div class="d-flex justify-content-between">
                    <small>Start Date</small>
                    <span class="small">{{report.period.start | date:'mediumDate'}}</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="d-flex justify-content-between">
                    <small>End Date</small>
                    <span class="small">{{report.period.end | date:'mediumDate'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Author and Reviewers -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Author</small>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-person-circle text-secondary"></i>
                  <span class="small">{{report.author}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviewers -->
        <div class="col-12" *ngIf="report.reviewers?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Reviewers</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-secondary" *ngFor="let reviewer of report.reviewers">{{reviewer}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribution -->
        <div class="col-12" *ngIf="report.distribution?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Distribution List</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-info" *ngFor="let recipient of report.distribution">{{recipient}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="col-12" *ngIf="report.tags?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Tags</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-secondary" *ngFor="let tag of report.tags">{{tag}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics -->
        <div class="col-12" *ngIf="report.metrics?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Metrics</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-1" *ngFor="let metric of report.metrics">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small">{{metric.name}}</span>
                    <span [class]="'badge ' + getMetricStatusClass(metric.status)">{{metric.value}} {{metric.unit}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Findings -->
        <div class="col-12" *ngIf="report.findings?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Findings</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-1" *ngFor="let finding of report.findings">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small">{{finding.title}}</span>
                    <span [class]="'badge ' + getFindingStatusClass(finding.status)">{{finding.status}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="col-12" *ngIf="report.recommendations?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Recommendations</small>
              <ul class="list-unstyled mb-0">
                <li class="small" *ngFor="let recommendation of report.recommendations">
                  <i class="bi bi-arrow-right-short"></i> {{recommendation}}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class ViewReportModalComponent {
  @Input() report!: Report;

  constructor(public activeModal: NgbActiveModal) {}

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Draft': 'bg-secondary',
      'Under Review': 'bg-warning',
      'Final': 'bg-success',
      'Published': 'bg-primary',
      'Archived': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getMetricStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Above Target': 'bg-success',
      'On Target': 'bg-info',
      'Below Target': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getFindingStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Open': 'bg-danger',
      'In Progress': 'bg-warning',
      'Resolved': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }
}
