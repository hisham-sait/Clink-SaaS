import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AddCompanyModalComponent } from './modal/add-company-modal.component';
import { EditCompanyModalComponent } from './modal/edit-company-modal.component';
import { ViewCompanyModalComponent } from './modal/view-company-modal.component';
import { ManageCompanyPlanModalComponent } from './modal/manage-company-plan-modal.component';
import { ConfirmModalComponent } from '../users/modal/confirm-modal.component';

import { CompanyService } from '../../../services/settings/company.service';
import { BillingService } from '../../../services/settings/billing.service';
import { Company, CompanyType, CompanyStatus, Plan } from '../settings.types';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    AddCompanyModalComponent,
    EditCompanyModalComponent,
    ViewCompanyModalComponent,
    ManageCompanyPlanModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Error Alert -->
      <div class="alert alert-danger alert-dismissible fade show" role="alert" *ngIf="error">
        {{ error }}
        <button type="button" class="btn-close" (click)="error = null"></button>
      </div>

      <!-- Loading State -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content (only show when not loading) -->
      <ng-container *ngIf="!loading">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-2">Companies</h1>
            <p class="text-muted mb-0">Manage companies and their relationships</p>
          </div>
          <div>
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddCompanyModal()">
              <i class="bi bi-building-add"></i>
              <span>Add Company</span>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Total Companies</span>
                  <i class="bi bi-buildings fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ companies.length }}</h3>
                <small class="text-muted">All registered companies</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Active Companies</span>
                  <i class="bi bi-building-check fs-4 text-success"></i>
                </div>
                <h3 class="mb-0">{{ getActiveCompaniesCount() }}</h3>
                <small class="text-muted">Currently active companies</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Primary Organization</span>
                  <i class="bi bi-building-fill-check fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getPrimaryOrganizationCount() }}</h3>
                <small class="text-muted">Primary organization</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Client Companies</span>
                  <i class="bi bi-briefcase fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getClientCompaniesCount() }}</h3>
                <small class="text-muted">Client organizations</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Companies Table -->
        <div class="card">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">All Companies</h5>
            <div class="d-flex gap-2">
              <div class="input-group">
                <span class="input-group-text border-end-0 bg-white">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  placeholder="Search companies..."
                  [(ngModel)]="searchTerm"
                >
              </div>
              <select class="form-select w-auto" [(ngModel)]="filterType">
                <option value="">All Types</option>
                <option value="Primary">Primary</option>
                <option value="Client">Client</option>
                <option value="Subsidiary">Subsidiary</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
              <select class="form-select w-auto" [(ngModel)]="filterStatus">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">Company</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Plan</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Tags</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Primary Contact</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let company of getFilteredCompanies()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-building text-secondary"></i>
                      <div>
                        <a href="#" class="text-decoration-none" (click)="viewCompany(company, $event)">
                          {{ company.name }}
                        </a>
                        <small class="d-block text-muted">{{ company.registrationNumber }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ company.type }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div *ngIf="companyPlans[company.id]">
                        <span class="fw-medium">{{ companyPlans[company.id].name }}</span>
                        <small class="d-block text-muted">
                          {{ companyPlans[company.id].price | currency }}/{{ companyPlans[company.id].billingCycle.toLowerCase() }}
                        </small>
                      </div>
                      <div *ngIf="!companyPlans[company.id]">
                        <small class="text-muted">No plan selected</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span *ngFor="let tag of company.tags" class="badge text-bg-primary me-1">{{ tag }}</span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ company.primaryContact?.name || 'Not specified' }}
                    </small>
                  </td>
                  <td>
                    <span [class]="'badge ' + getStatusClass(company.status)">
                      {{ company.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-link btn-sm text-body px-2" (click)="viewCompany(company)" title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="editCompany(company)" title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-body px-2" (click)="managePlan(company)" title="Manage Plan">
                        <i class="bi bi-box-seam"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="company.status === 'Active'"
                        (click)="archiveCompany(company)" 
                        title="Archive Company"
                      >
                        <i class="bi bi-archive"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        *ngIf="company.status === 'Archived'"
                        (click)="activateCompany(company)" 
                        title="Activate Company"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger px-2" (click)="deleteCompany(company)" title="Delete">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredCompanies().length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No companies found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  companyPlans: { [key: string]: Plan } = {};
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterType = '';
  filterStatus = '';

  constructor(
    private modalService: NgbModal,
    private companyService: CompanyService,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = null;

    this.companyService.getCompanies()
      .pipe(
        catchError(error => {
          console.error('Error loading companies:', error);
          this.error = error.error?.message || 'Failed to load companies. Please try again.';
          return of([]);
        })
      )
      .subscribe(companies => {
        this.companies = companies;
        this.loadCompanyPlans();
        this.loading = false;
      });
  }

  loadCompanyPlans(): void {
    this.companies.forEach(company => {
      this.billingService.getCurrentPlan(company.id).subscribe({
        next: (plan) => {
          this.companyPlans[company.id] = plan;
        },
        error: (error) => {
          if (error.status !== 404) {
            console.error(`Error loading plan for company ${company.id}:`, error);
          }
        }
      });
    });
  }

  getStatusClass(status: CompanyStatus): string {
    switch (status) {
      case 'Active':
        return 'text-bg-success';
      case 'Pending':
        return 'text-bg-warning';
      case 'Archived':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  getActiveCompaniesCount(): number {
    return this.companies.filter(c => c.status === 'Active').length;
  }

  getPrimaryOrganizationCount(): number {
    return this.companies.filter(c => c.tags.includes('Primary Organization')).length;
  }

  getClientCompaniesCount(): number {
    return this.companies.filter(c => c.type === 'Client' && c.status === 'Active').length;
  }

  getFilteredCompanies(): Company[] {
    return this.companies.filter(company => {
      const matchesSearch = !this.searchTerm || 
        company.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        company.registrationNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.filterType || company.type === this.filterType;
      const matchesStatus = !this.filterStatus || company.status === this.filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  openAddCompanyModal(): void {
    const modalRef = this.modalService.open(AddCompanyModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: Partial<Company>) => {
        this.companyService.createCompany(result)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to create company. Please try again.';
              console.error('Error creating company:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(company => {
            if (company) {
              this.companies.push(company);
              this.loadCompanies();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  viewCompany(company: Company, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewCompanyModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.company = {...company};
    modalRef.componentInstance.plan = this.companyPlans[company.id];
    
    modalRef.result.then(
      (result: { action: string; company: Company }) => {
        if (result?.action === 'edit') {
          this.editCompany(result.company);
        }
      },
      () => {} // Modal dismissed
    );
  }

  managePlan(company: Company): void {
    const modalRef = this.modalService.open(ManageCompanyPlanModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.company = company;
    
    modalRef.result.then(
      (plan: Plan) => {
        if (plan) {
          this.companyPlans[company.id] = plan;
        }
      },
      () => {} // Modal dismissed
    );
  }

  editCompany(company: Company): void {
    const modalRef = this.modalService.open(EditCompanyModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.company = {...company};
    
    modalRef.result.then(
      (updatedCompany: Company) => {
        this.companyService.updateCompany(company.id, updatedCompany)
          .pipe(
            catchError(error => {
              const errorMsg = error.error?.message || 'Failed to update company. Please try again.';
              console.error('Error updating company:', error);
              this.error = errorMsg;
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              const index = this.companies.findIndex(c => c.id === company.id);
              this.companies[index] = result;
              this.loadCompanies();
            }
          });
      },
      () => {} // Modal dismissed
    );
  }

  deleteCompany(company: Company): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Delete Company';
    modalRef.componentInstance.message = `Are you sure you want to delete ${company.name}? This action cannot be undone.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.companyService.deleteCompany(company.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to delete company. Please try again.';
                console.error('Error deleting company:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(() => {
              const index = this.companies.findIndex(c => c.id === company.id);
              this.companies.splice(index, 1);
              this.loadCompanies();
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  archiveCompany(company: Company): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Archive Company';
    modalRef.componentInstance.message = `Are you sure you want to archive ${company.name}?`;
    modalRef.componentInstance.confirmButtonText = 'Archive';
    modalRef.componentInstance.confirmButtonClass = 'btn-warning';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.companyService.archiveCompany(company.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to archive company. Please try again.';
                console.error('Error archiving company:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.companies.findIndex(c => c.id === company.id);
                this.companies[index] = result;
                this.loadCompanies();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }

  activateCompany(company: Company): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Activate Company';
    modalRef.componentInstance.message = `Are you sure you want to activate ${company.name}?`;
    modalRef.componentInstance.confirmButtonText = 'Activate';
    modalRef.componentInstance.confirmButtonClass = 'btn-success';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.companyService.activateCompany(company.id)
            .pipe(
              catchError(error => {
                const errorMsg = error.error?.message || 'Failed to activate company. Please try again.';
                console.error('Error activating company:', error);
                this.error = errorMsg;
                return of(null);
              })
            )
            .subscribe(result => {
              if (result) {
                const index = this.companies.findIndex(c => c.id === company.id);
                this.companies[index] = result;
                this.loadCompanies();
              }
            });
        }
      },
      () => {} // Modal dismissed
    );
  }
}
