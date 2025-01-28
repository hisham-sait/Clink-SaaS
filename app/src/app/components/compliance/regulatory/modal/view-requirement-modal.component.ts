import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement } from './../../compliance.types';

@Component({
  selector: 'app-view-requirement-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View Regulatory Requirement</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Title</label>
            <p class="mb-0">{{ requirement.title }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ requirement.description }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Authority</label>
            <p class="mb-0">{{ requirement.authority }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Jurisdiction</label>
            <p class="mb-0">{{ requirement.jurisdiction }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Category</label>
            <p class="mb-0">{{ requirement.category }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Status</label>
            <div>
              <span [class]="'badge ' + getStatusClass(requirement.status)">
                {{ requirement.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Timeline</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-muted small">Effective Date</label>
            <p class="mb-0">{{ formatDate(requirement.effectiveDate) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Last Update</label>
            <p class="mb-0">{{ formatDate(requirement.lastUpdateDate) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Next Review</label>
            <p class="mb-0">{{ formatDate(requirement.nextReviewDate) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Update Frequency</label>
            <p class="mb-0">{{ requirement.updateFrequency }}</p>
          </div>
        </div>
      </div>

      <!-- Risk and Compliance -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Risk and Compliance</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-muted small">Risk Level</label>
            <div>
              <span [class]="'badge ' + getRiskClass(requirement.riskLevel)">
                {{ requirement.riskLevel }}
              </span>
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Compliance Status</label>
            <div>
              <span [class]="'badge ' + getComplianceClass(requirement.complianceStatus)">
                {{ requirement.complianceStatus }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Applicability -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Applicability</h6>
        <p class="mb-0">{{ requirement.applicability }}</p>
      </div>

      <!-- Obligations -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary mb-0">Obligations</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="onAddObligation()">
            <i class="bi bi-plus-lg me-1"></i>Add Obligation
          </button>
        </div>
        
        <div class="list-group">
          <div *ngFor="let obligation of requirement.obligations" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0">{{ obligation.title }}</h6>
                <small [class]="'text-' + getComplianceClass(obligation.status)">
                  {{ obligation.status }}
                </small>
              </div>
              <div class="dropdown">
                <button class="btn btn-link btn-sm p-0 text-muted" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" (click)="$event.preventDefault(); onEditObligation(obligation)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" (click)="$event.preventDefault(); onDeleteObligation(obligation)">
                      <i class="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <p class="mb-2 small">{{ obligation.description }}</p>

            <div class="d-flex gap-3 mb-2">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                Due: {{ formatDate(obligation.dueDate) }}
              </small>
              <small class="text-muted">
                <i class="bi bi-arrow-repeat me-1"></i>
                {{ obligation.frequency }}
              </small>
              <small class="text-muted">
                <i class="bi bi-person me-1"></i>
                {{ obligation.assignedTo || 'Unassigned' }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary mb-0">Controls</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="onAddControl()">
            <i class="bi bi-plus-lg me-1"></i>Add Control
          </button>
        </div>
        
        <div class="list-group">
          <div *ngFor="let control of requirement.controls" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0">{{ control.name }}</h6>
                <small [class]="'text-' + getEffectivenessClass(control.effectiveness)">
                  {{ control.effectiveness }}
                </small>
              </div>
              <div class="dropdown">
                <button class="btn btn-link btn-sm p-0 text-muted" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" (click)="$event.preventDefault(); onEditControl(control)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" (click)="$event.preventDefault(); onDeleteControl(control)">
                      <i class="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <p class="mb-2 small">{{ control.description }}</p>

            <div class="d-flex gap-3 mb-2">
              <small class="text-muted">
                <i class="bi bi-tag me-1"></i>
                {{ control.type }}
              </small>
              <small class="text-muted">
                <i class="bi bi-person me-1"></i>
                {{ control.owner || 'Unassigned' }}
              </small>
            </div>

            <div class="d-flex gap-3">
              <small class="text-muted">
                <i class="bi bi-calendar-check me-1"></i>
                Last Tested: {{ control.lastTestedDate ? formatDate(control.lastTestedDate) : 'Never' }}
              </small>
              <small class="text-muted">
                <i class="bi bi-calendar-event me-1"></i>
                Next Test: {{ control.nextTestDate ? formatDate(control.nextTestDate) : 'Not Scheduled' }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="mb-4" *ngIf="requirement.documents?.length">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary mb-0">Documents</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="onAddDocument()">
            <i class="bi bi-plus-lg me-1"></i>Add Document
          </button>
        </div>
        
        <div class="list-group">
          <div *ngFor="let doc of requirement.documents" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="d-flex align-items-center">
                  <i [class]="'bi ' + getDocumentIcon(doc.type) + ' text-primary me-2'"></i>
                  <div>
                    <h6 class="mb-0">{{ doc.title }}</h6>
                    <small class="text-muted">Version {{ doc.version }}</small>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span [class]="'badge ' + getDocumentStatusClass(doc.status)">
                  {{ doc.status }}
                </span>
                <button class="btn btn-sm btn-link text-primary" (click)="onViewDocument(doc)">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessments -->
      <div class="mb-4" *ngIf="requirement.assessments?.length">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary mb-0">Assessments</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="onAddAssessment()">
            <i class="bi bi-plus-lg me-1"></i>Add Assessment
          </button>
        </div>
        
        <div class="list-group">
          <div *ngFor="let assessment of requirement.assessments" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0">{{ assessment.title }}</h6>
                <small class="text-muted">{{ assessment.type }} Assessment</small>
              </div>
              <span [class]="'badge ' + getAssessmentStatusClass(assessment.status)">
                {{ assessment.status }}
              </span>
            </div>

            <div class="d-flex gap-3 mb-2">
              <small class="text-muted">
                <i class="bi bi-person me-1"></i>
                {{ assessment.assessor }}
              </small>
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(assessment.date) }}
              </small>
            </div>

            <div *ngIf="assessment.findings?.length" class="mt-2">
              <small class="text-muted d-block mb-2">Findings:</small>
              <div class="list-group list-group-flush">
                <div *ngFor="let finding of assessment.findings" class="list-group-item px-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ finding.title }}</h6>
                      <p class="mb-1 small">{{ finding.description }}</p>
                    </div>
                    <span [class]="'badge ' + getRiskClass(finding.severity)">
                      {{ finding.severity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
export class ViewRequirementModalComponent {
  @Input() requirement!: RegulatoryRequirement;

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
      'Active': 'bg-success',
      'Pending': 'bg-warning',
      'Under Review': 'bg-info',
      'Superseded': 'bg-secondary',
      'Repealed': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getRiskClass(risk: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-danger'
    };
    return classes[risk] || 'bg-secondary';
  }

  getComplianceClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Compliant': 'bg-success',
      'Partially Compliant': 'bg-warning',
      'Non-Compliant': 'bg-danger',
      'Not Applicable': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getEffectivenessClass(effectiveness: string): string {
    const classes: { [key: string]: string } = {
      'Effective': 'success',
      'Partially Effective': 'warning',
      'Ineffective': 'danger'
    };
    return classes[effectiveness] || 'secondary';
  }

  getDocumentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Draft': 'bg-secondary',
      'Active': 'bg-success',
      'Archived': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getAssessmentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Planned': 'bg-info',
      'In Progress': 'bg-warning',
      'Completed': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'bi-file-pdf',
      'doc': 'bi-file-word',
      'xls': 'bi-file-excel',
      'image': 'bi-file-image'
    };
    return icons[type] || 'bi-file-text';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', requirement: this.requirement });
  }

  onAddObligation(): void {
    this.activeModal.close({ action: 'add-obligation', requirement: this.requirement });
  }

  onEditObligation(obligation: any): void {
    this.activeModal.close({ action: 'edit-obligation', requirement: this.requirement, obligation });
  }

  onDeleteObligation(obligation: any): void {
    this.activeModal.close({ action: 'delete-obligation', requirement: this.requirement, obligation });
  }

  onAddControl(): void {
    this.activeModal.close({ action: 'add-control', requirement: this.requirement });
  }

  onEditControl(control: any): void {
    this.activeModal.close({ action: 'edit-control', requirement: this.requirement, control });
  }

  onDeleteControl(control: any): void {
    this.activeModal.close({ action: 'delete-control', requirement: this.requirement, control });
  }

  onAddDocument(): void {
    this.activeModal.close({ action: 'add-document', requirement: this.requirement });
  }

  onViewDocument(document: any): void {
    this.activeModal.close({ action: 'view-document', requirement: this.requirement, document });
  }

  onAddAssessment(): void {
    this.activeModal.close({ action: 'add-assessment', requirement: this.requirement });
  }
}
