import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryService } from '../../../services/compliance/regulatory.service';
import { 
  RegulatoryRequirement, 
  RiskLevel, 
  ComplianceStatus,
  Status,
  FilterOptions
} from '../compliance.types';
import { CreateRequirementModalComponent } from './modal/create-requirement-modal.component';
import { EditRequirementModalComponent } from './modal/edit-requirement-modal.component';
import { ViewRequirementModalComponent } from './modal/view-requirement-modal.component';
import { ConfirmRequirementModalComponent } from './modal/confirm-requirement-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth/auth.service';
import { forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-regulatory',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0">Regulatory Requirements</h4>
        <small class="text-muted">Manage regulatory compliance requirements</small>
      </div>
      <div class="d-flex gap-2">
        <div class="btn-group">
          <button class="btn btn-outline-secondary" (click)="exportRequirements('xlsx')">
            <i class="bi bi-download me-2"></i>Export
          </button>
          <button class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
            <span class="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" (click)="$event.preventDefault(); exportRequirements('xlsx')">Excel</a></li>
            <li><a class="dropdown-item" href="#" (click)="$event.preventDefault(); exportRequirements('csv')">CSV</a></li>
          </ul>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="bi bi-plus-lg me-2"></i>Add Requirement
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-md-4">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search requirements..."
              [(ngModel)]="filters.search"
              (ngModelChange)="applyFilters()"
            >
          </div>

          <!-- Status -->
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Superseded">Superseded</option>
              <option value="Repealed">Repealed</option>
            </select>
          </div>

          <!-- Risk Level -->
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="filters.riskLevel" (ngModelChange)="applyFilters()">
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <!-- Compliance Status -->
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="filters.complianceStatus" (ngModelChange)="applyFilters()">
              <option value="">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Partially Compliant">Partially Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
              <i class="bi bi-x-lg me-2"></i>Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Requirements Table -->
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 40px">
                <input 
                  type="checkbox" 
                  class="form-check-input"
                  [checked]="isAllSelected()"
                  (change)="toggleSelectAll()"
                >
              </th>
              <th>Title</th>
              <th>Authority</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Compliance</th>
              <th>Due Date</th>
              <th style="width: 100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let requirement of filteredRequirements">
              <td>
                <input 
                  type="checkbox" 
                  class="form-check-input"
                  [checked]="isSelected(requirement)"
                  (change)="toggleSelect(requirement)"
                >
              </td>
              <td>
                <div class="d-flex flex-column">
                  <a href="#" class="text-decoration-none" (click)="$event.preventDefault(); openViewModal(requirement)">
                    {{ requirement.title }}
                  </a>
                  <small class="text-muted">{{ requirement.category }}</small>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span>{{ requirement.authority }}</span>
                  <small class="text-muted">{{ requirement.jurisdiction }}</small>
                </div>
              </td>
              <td>
                <span [class]="'badge ' + getStatusClass(requirement.status)">
                  {{ requirement.status }}
                </span>
              </td>
              <td>
                <span [class]="'badge ' + getRiskClass(requirement.riskLevel)">
                  {{ requirement.riskLevel }}
                </span>
              </td>
              <td>
                <span [class]="'badge ' + getComplianceClass(requirement.complianceStatus)">
                  {{ requirement.complianceStatus }}
                </span>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span>{{ formatDate(requirement.nextReviewDate) }}</span>
                  <small class="text-muted">{{ requirement.updateFrequency }}</small>
                </div>
              </td>
              <td>
                <div class="dropdown">
                  <button class="btn btn-link btn-sm p-0 text-muted" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); openViewModal(requirement)">
                        <i class="bi bi-eye me-2"></i>View
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); openEditModal(requirement)">
                        <i class="bi bi-pencil me-2"></i>Edit
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" (click)="$event.preventDefault(); openDeleteModal(requirement)">
                        <i class="bi bi-trash me-2"></i>Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr *ngIf="!filteredRequirements.length">
              <td colspan="8" class="text-center py-4">
                <div class="text-muted">
                  <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                  <p class="mb-0">No requirements found</p>
                  <small>Try adjusting your filters or add a new requirement</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div class="card-footer d-flex justify-content-between align-items-center" *ngIf="selectedRequirements.length">
        <div>
          <span class="text-muted">{{ selectedRequirements.length }} selected</span>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" (click)="openBulkStatusModal()">
            Update Status
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="openBulkAssignModal()">
            Assign Owner
          </button>
          <button class="btn btn-outline-danger btn-sm" (click)="openBulkDeleteModal()">
            Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class RegulatoryComponent implements OnInit {
  requirements: RegulatoryRequirement[] = [];
  filteredRequirements: RegulatoryRequirement[] = [];
  selectedRequirements: RegulatoryRequirement[] = [];

  filters: FilterOptions = {
    search: '',
    status: undefined,
    riskLevel: undefined,
    complianceStatus: undefined
  };

  constructor(
    private regulatoryService: RegulatoryService,
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequirements();
  }

  loadRequirements(): void {
    this.authService.currentUser.pipe(
      take(1),
      map(user => user?.companyId)
    ).subscribe(companyId => {
      if (companyId) {
        this.regulatoryService.getRequirements(companyId).subscribe(
          requirements => {
            this.requirements = requirements;
            this.applyFilters();
          },
          error => {
            console.error('Error loading requirements:', error);
            // Handle error (show toast, etc.)
          }
        );
      }
    });
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateRequirementModalComponent, { size: 'lg' });
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user?.companyId) {
        modalRef.componentInstance.companies = [{ id: user.companyId }];
        
        modalRef.result.then(
          result => {
            if (result) {
              this.regulatoryService.createRequirement(result.requirement).subscribe(
                newRequirement => {
                  this.requirements.push(newRequirement);
                  this.applyFilters();
                  // Show success toast
                },
                error => {
                  console.error('Error creating requirement:', error);
                  // Show error toast
                }
              );
            }
          },
          () => {} // Modal dismissed
        );
      }
    });
  }

  openEditModal(requirement: RegulatoryRequirement): void {
    const modalRef = this.modalService.open(EditRequirementModalComponent, { size: 'lg' });
    modalRef.componentInstance.requirement = requirement;
    
    modalRef.result.then(
      result => {
        if (result) {
          this.regulatoryService.updateRequirement(requirement.id, result.requirement).subscribe(
            updatedRequirement => {
              const index = this.requirements.findIndex(r => r.id === requirement.id);
              if (index !== -1) {
                this.requirements[index] = updatedRequirement;
                this.applyFilters();
              }
              // Show success toast
            },
            error => {
              console.error('Error updating requirement:', error);
              // Show error toast
            }
          );
        }
      },
      () => {} // Modal dismissed
    );
  }

  openViewModal(requirement: RegulatoryRequirement): void {
    const modalRef = this.modalService.open(ViewRequirementModalComponent, { size: 'lg' });
    modalRef.componentInstance.requirement = requirement;
    
    modalRef.result.then(
      result => {
        if (result?.action === 'edit') {
          this.openEditModal(requirement);
        }
      },
      () => {} // Modal dismissed
    );
  }

  openDeleteModal(requirement: RegulatoryRequirement): void {
    const modalRef = this.modalService.open(ConfirmRequirementModalComponent);
    modalRef.componentInstance.title = 'Delete Requirement';
    modalRef.componentInstance.message = `Are you sure you want to delete "${requirement.title}"?`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'danger';
    modalRef.componentInstance.requirement = requirement;
    modalRef.componentInstance.showActiveWarning = requirement.status === 'Active';
    modalRef.componentInstance.showDependenciesWarning = true;
    modalRef.componentInstance.showImpactInfo = true;
    
    modalRef.result.then(
      confirmed => {
        if (confirmed) {
          this.regulatoryService.deleteRequirement(requirement.id).subscribe(
            () => {
              this.requirements = this.requirements.filter(r => r.id !== requirement.id);
              this.selectedRequirements = this.selectedRequirements.filter(r => r.id !== requirement.id);
              this.applyFilters();
              // Show success toast
            },
            error => {
              console.error('Error deleting requirement:', error);
              // Show error toast
            }
          );
        }
      },
      () => {} // Modal dismissed
    );
  }

  openBulkStatusModal(): void {
    const modalRef = this.modalService.open(ConfirmRequirementModalComponent);
    modalRef.componentInstance.title = 'Update Status';
    modalRef.componentInstance.message = `Update status for ${this.selectedRequirements.length} requirements?`;
    modalRef.componentInstance.confirmButtonText = 'Update';
    modalRef.componentInstance.showStatusSelect = true;
    
    modalRef.result.then(
      result => {
        if (result?.status) {
          const ids = this.selectedRequirements.map(r => r.id);
          this.regulatoryService.bulkUpdateStatus(ids, result.status).subscribe(
            () => {
              this.loadRequirements();
              this.selectedRequirements = [];
              // Show success toast
            },
            error => {
              console.error('Error updating status:', error);
              // Show error toast
            }
          );
        }
      },
      () => {} // Modal dismissed
    );
  }

  openBulkAssignModal(): void {
    const modalRef = this.modalService.open(ConfirmRequirementModalComponent);
    modalRef.componentInstance.title = 'Assign Owner';
    modalRef.componentInstance.message = `Assign owner for ${this.selectedRequirements.length} requirements?`;
    modalRef.componentInstance.confirmButtonText = 'Assign';
    modalRef.componentInstance.showOwnerSelect = true;
    
    modalRef.result.then(
      result => {
        if (result?.owner) {
          const ids = this.selectedRequirements.map(r => r.id);
          this.regulatoryService.bulkAssignOwner(ids, result.owner).subscribe(
            () => {
              this.loadRequirements();
              this.selectedRequirements = [];
              // Show success toast
            },
            error => {
              console.error('Error assigning owner:', error);
              // Show error toast
            }
          );
        }
      },
      () => {} // Modal dismissed
    );
  }

  openBulkDeleteModal(): void {
    const modalRef = this.modalService.open(ConfirmRequirementModalComponent);
    modalRef.componentInstance.title = 'Delete Requirements';
    modalRef.componentInstance.message = `Are you sure you want to delete ${this.selectedRequirements.length} requirements?`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'danger';
    modalRef.componentInstance.showActiveWarning = this.selectedRequirements.some(r => r.status === 'Active');
    modalRef.componentInstance.showDependenciesWarning = true;
    modalRef.componentInstance.showImpactInfo = true;
    
    modalRef.result.then(
      confirmed => {
        if (confirmed) {
          const deleteObservables = this.selectedRequirements.map(r => 
            this.regulatoryService.deleteRequirement(r.id)
          );
          
          forkJoin(deleteObservables).subscribe(
            () => {
              this.requirements = this.requirements.filter(r => !this.selectedRequirements.includes(r));
              this.selectedRequirements = [];
              this.applyFilters();
              // Show success toast
            },
            error => {
              console.error('Error deleting requirements:', error);
              // Show error toast
            }
          );
        }
      },
      () => {} // Modal dismissed
    );
  }

  exportRequirements(format: 'csv' | 'xlsx'): void {
    this.authService.currentUser.pipe(take(1)).subscribe(user => {
      if (user?.companyId) {
        this.regulatoryService.exportRequirements(user.companyId, format).subscribe(
          blob => {
            const fileName = `regulatory-requirements.${format}`;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error => {
            console.error('Error exporting requirements:', error);
            // Show error toast
          }
        );
      }
    });
  }

  // Selection Methods
  isSelected(requirement: RegulatoryRequirement): boolean {
    return this.selectedRequirements.includes(requirement);
  }

  toggleSelect(requirement: RegulatoryRequirement): void {
    const index = this.selectedRequirements.indexOf(requirement);
    if (index === -1) {
      this.selectedRequirements.push(requirement);
    } else {
      this.selectedRequirements.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.filteredRequirements.length > 0 && 
           this.filteredRequirements.every(r => this.selectedRequirements.includes(r));
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedRequirements = this.selectedRequirements.filter(
        r => !this.filteredRequirements.includes(r)
      );
    } else {
      this.selectedRequirements = [
        ...new Set([...this.selectedRequirements, ...this.filteredRequirements])
      ];
    }
  }

  // Utility Methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusClass(status: Status): string {
    const classes: { [key: string]: string } = {
      'Active': 'bg-success',
      'Pending': 'bg-warning',
      'Under Review': 'bg-info',
      'Superseded': 'bg-secondary',
      'Repealed': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getRiskClass(risk: RiskLevel): string {
    const classes: { [key: string]: string } = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-danger'
    };
    return classes[risk] || 'bg-secondary';
  }

  getComplianceClass(status: ComplianceStatus): string {
    const classes: { [key: string]: string } = {
      'Compliant': 'bg-success',
      'Partially Compliant': 'bg-warning',
      'Non-Compliant': 'bg-danger',
      'Not Applicable': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  applyFilters(): void {
    let filtered = [...this.requirements];

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(search) ||
        req.description.toLowerCase().includes(search) ||
        req.authority.toLowerCase().includes(search) ||
        req.jurisdiction.toLowerCase().includes(search)
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter(req => req.status === this.filters.status);
    }

    if (this.filters.riskLevel) {
      filtered = filtered.filter(req => req.riskLevel === this.filters.riskLevel);
    }

    if (this.filters.complianceStatus) {
      filtered = filtered.filter(req => req.complianceStatus === this.filters.complianceStatus);
    }

    this.filteredRequirements = filtered;
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      status: undefined,
      riskLevel: undefined,
      complianceStatus: undefined
    };
    this.applyFilters();
  }
}
