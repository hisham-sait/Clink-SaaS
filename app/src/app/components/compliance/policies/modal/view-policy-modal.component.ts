import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Policy } from '../../compliance.types';

@Component({
  selector: 'app-view-policy-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Policy Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">{{policy.title}}</h6>
              <small class="text-muted">{{policy.policyNumber}}</small>
            </div>
            <span [class]="'badge ' + getStatusClass(policy.status)">{{policy.status}}</span>
          </div>
          <p class="text-muted small mb-0">{{policy.description}}</p>
        </div>

        <!-- Details Grid -->
        <div class="col-12">
          <div class="row g-2">
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">Category</small>
                    <span class="small">{{policy.category}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">Version</small>
                    <span class="small">{{policy.version}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Purpose and Scope -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Purpose</small>
              <p class="small mb-0">{{policy.purpose}}</p>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Scope</small>
              <p class="small mb-0">{{policy.scope}}</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Policy Content</small>
              <p class="small mb-0" style="white-space: pre-wrap;">{{policy.content}}</p>
            </div>
          </div>
        </div>

        <!-- Owner and Approver -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="row g-2">
                <div class="col-6">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Owner</small>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <span class="small">{{policy.owner}}</span>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Approver</small>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-check text-secondary"></i>
                      <span class="small">{{policy.approver}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="row g-2">
                <div class="col-md-4">
                  <small class="text-muted d-block">Effective Date</small>
                  <span class="small">{{policy.effectiveDate | date:'mediumDate'}}</span>
                </div>
                <div class="col-md-4">
                  <small class="text-muted d-block">Last Review</small>
                  <span class="small">{{policy.lastReviewDate | date:'mediumDate'}}</span>
                </div>
                <div class="col-md-4">
                  <small class="text-muted d-block">Next Review</small>
                  <span [class]="isReviewDueSoon(policy.nextReviewDate) ? 'small text-danger' : 'small'">
                    {{policy.nextReviewDate | date:'mediumDate'}}
                    <small class="d-block">{{calculateDaysUntilReview(policy.nextReviewDate)}} days remaining</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Policies -->
        <div class="col-12" *ngIf="policy.relatedPolicies?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Related Policies</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-secondary" *ngFor="let relatedPolicy of policy.relatedPolicies">{{relatedPolicy}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- References -->
        <div class="col-12" *ngIf="policy.references?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">References</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-info" *ngFor="let reference of policy.references">{{reference}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revisions -->
        <div class="col-12" *ngIf="policy.revisions?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Revision History</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let revision of policy.revisions">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <span class="small fw-medium">v{{revision.version}}</span>
                      <span [class]="'badge ' + getApprovalStatusClass(revision.approvalStatus)">{{revision.approvalStatus}}</span>
                    </div>
                    <small class="text-muted">{{revision.date | date:'mediumDate'}}</small>
                  </div>
                  <div class="small text-muted">{{revision.author}}</div>
                  <ul class="list-unstyled mb-0 mt-1">
                    <li class="small" *ngFor="let change of revision.changes">
                      <i class="bi bi-arrow-right-short"></i> {{change}}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acknowledgments -->
        <div class="col-12" *ngIf="policy.acknowledgments?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Acknowledgments</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let ack of policy.acknowledgments">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <span class="small">{{ack.userName}}</span>
                    </div>
                    <small class="text-muted">{{ack.acknowledgedDate | date:'mediumDate'}}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="col-12" *ngIf="policy.reviews?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Reviews</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let review of policy.reviews">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <span class="small">{{review.reviewer}}</span>
                    </div>
                    <small class="text-muted">{{review.completionDate || review.dueDate | date:'mediumDate'}}</small>
                  </div>
                  <div class="small mb-1">
                    <span [class]="'badge ' + getStatusClass(review.status)">{{review.status}}</span>
                  </div>
                  <ul class="list-unstyled mb-0">
                    <li class="small" *ngFor="let comment of review.comments">
                      <i class="bi bi-chat-right-text"></i> {{comment}}
                    </li>
                  </ul>
                </div>
              </div>
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
export class ViewPolicyModalComponent {
  @Input() policy!: Policy;

  constructor(public activeModal: NgbActiveModal) {}

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'bg-success',
      'Inactive': 'bg-secondary',
      'Draft': 'bg-secondary',
      'Under Review': 'bg-warning',
      'Archived': 'bg-secondary',
      'Superseded': 'bg-warning',
      'Pending': 'bg-warning',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getApprovalStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'bg-warning',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger',
      'Changes Requested': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  calculateDaysUntilReview(reviewDate: string): number {
    const today = new Date();
    const review = new Date(reviewDate);
    const diffTime = review.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isReviewDueSoon(reviewDate: string): boolean {
    return this.calculateDaysUntilReview(reviewDate) <= 30;
  }
}
