import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Plan, Company } from '../settings.types';
import { PlanService } from '../../../services/settings/plan.service';
import { BillingService } from '../../../services/settings/billing.service';
import { AuthService } from '../../../services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AddPlanModalComponent } from './modal/add-plan-modal.component';
import { EditPlanModalComponent } from './modal/edit-plan-modal.component';
import { DeletePlanModalComponent } from './modal/delete-plan-modal.component';
import { SelectPlanModalComponent } from './modal/select-plan-modal.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule],
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
            <h1 class="h3 mb-2">Plans</h1>
            <p class="text-muted mb-0">Manage subscription plans and pricing</p>
          </div>
          <div>
            <button 
              class="btn btn-primary d-inline-flex align-items-center gap-2" 
              (click)="openCreateModal()"
              *ngIf="canManagePlans">
              <i class="bi bi-plus-lg"></i>
              <span>Add Plan</span>
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Total Plans</span>
                  <i class="bi bi-box fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ plans.length }}</h3>
                <small class="text-muted">All plans</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Active Plans</span>
                  <i class="bi bi-check-circle fs-4 text-success"></i>
                </div>
                <h3 class="mb-0">{{ getActivePlansCount() }}</h3>
                <small class="text-muted">Currently active plans</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Custom Plans</span>
                  <i class="bi bi-gear fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getCustomPlansCount() }}</h3>
                <small class="text-muted">Custom pricing plans</small>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Standard Plans</span>
                  <i class="bi bi-box-seam fs-4 text-primary"></i>
                </div>
                <h3 class="mb-0">{{ getStandardPlansCount() }}</h3>
                <small class="text-muted">Standard pricing plans</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Plans Table (Admin View) -->
        <div class="card mb-4" *ngIf="canManagePlans">
          <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 class="mb-0">Manage Plans</h5>
            <div class="d-flex gap-2">
              <div class="input-group">
                <span class="input-group-text border-end-0 bg-white">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  placeholder="Search plans..."
                  [(ngModel)]="searchTerm"
                >
              </div>
              <select class="form-select w-auto" [(ngModel)]="filterStatus">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deprecated">Deprecated</option>
              </select>
              <select class="form-select w-auto" [(ngModel)]="filterCycle">
                <option value="">All Cycles</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="text-uppercase small fw-semibold text-secondary">Plan</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Price</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Billing Cycle</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Users</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Companies</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let plan of getFilteredPlans()">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi" [class.bi-box-seam]="!plan.isCustom" [class.bi-gear]="plan.isCustom"></i>
                      <div>
                        <span class="fw-medium">{{ plan.name }}</span>
                        <small class="d-block text-muted">{{ plan.description }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ plan.price | currency }}</td>
                  <td>{{ plan.billingCycle }}</td>
                  <td>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</td>
                  <td>{{ plan.maxCompanies === -1 ? 'Unlimited' : plan.maxCompanies }}</td>
                  <td>
                    <span [class]="'badge ' + getStatusBadgeClass(plan.status)">
                      {{ plan.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button 
                        class="btn btn-link btn-sm text-body px-2" 
                        (click)="openEditModal(plan)"
                        title="Edit">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-link btn-sm text-danger px-2" 
                        (click)="openDeleteModal(plan)"
                        title="Delete">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="getFilteredPlans().length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    No plans found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Current Plan Banner -->
        <div class="card border-0 shadow-sm mb-4" *ngIf="currentPlan && canViewPlans">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">Current Plan: {{ currentPlan.name }}</h5>
                <p class="text-muted mb-0">
                  {{ currentPlan.price | currency }}/{{ currentPlan.billingCycle.toLowerCase() }}
                </p>
              </div>
              <span class="badge" [ngClass]="getStatusBadgeClass(currentPlan.status)">
                {{ currentPlan.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Plans Grid (Customer View) -->
        <div class="card" *ngIf="canViewPlans">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Available Plans</h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-3" *ngFor="let plan of getActivePlans()">
                <div class="card h-100 border-0 shadow-sm" [class.border-primary]="isCurrentPlan(plan)">
                  <!-- Plan Header -->
                  <div class="card-header bg-transparent border-0 pt-4 pb-0">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">{{ plan.name }}</h5>
                      <i class="bi" [class.bi-box-seam]="!plan.isCustom" [class.bi-gear]="plan.isCustom"></i>
                    </div>
                  </div>

                  <!-- Plan Body -->
                  <div class="card-body">
                    <div class="mb-3">
                      <h3 class="mb-0">
                        {{ plan.price | currency }}
                        <small class="text-muted fs-6">/{{ plan.billingCycle.toLowerCase() }}</small>
                      </h3>
                    </div>
                    
                    <p class="text-muted mb-4">{{ plan.description }}</p>

                    <!-- Plan Features -->
                    <ul class="list-unstyled mb-4">
                      <li class="mb-2" *ngFor="let feature of getAllowedFeatures(plan)">
                        <i class="bi bi-check2 text-success me-2"></i>
                        {{ feature }}
                      </li>
                    </ul>

                    <!-- Plan Limits -->
                    <div class="d-flex justify-content-between text-muted mb-2">
                      <span>Users</span>
                      <span>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                      <span>Companies</span>
                      <span>{{ plan.maxCompanies === -1 ? 'Unlimited' : plan.maxCompanies }}</span>
                    </div>
                  </div>

                  <!-- Plan Footer -->
                  <div class="card-footer bg-transparent border-0 pt-0 pb-4">
                    <div class="d-grid">
                      <button 
                        class="btn"
                        [class.btn-outline-primary]="!isCurrentPlan(plan)"
                        [class.btn-primary]="isCurrentPlan(plan)"
                        [disabled]="!canSelectPlan(plan)"
                        (click)="openSelectModal(plan)">
                        {{ isCurrentPlan(plan) ? 'Current Plan' : 'Select Plan' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  currentPlan: Plan | null = null;
  billingCompany: Company | null = null;
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterStatus = '';
  filterCycle = '';
  userRoles: string[] = [];

  constructor(
    private planService: PlanService,
    private billingService: BillingService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadUserRoles();
    this.loadPlans();
    this.loadCurrentPlan();
  }

  get canManagePlans(): boolean {
    return this.planService.canManagePlans(this.userRoles);
  }

  get canViewPlans(): boolean {
    return this.planService.canViewPlans(this.userRoles);
  }

  get canChangePlan(): boolean {
    return this.planService.canChangePlan(this.userRoles);
  }

  private loadUserRoles() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        if (user) {
          this.userRoles = user.roles;
        }
      },
      error: (error: HttpErrorResponse) => this.handleError(error)
    });
  }

  loadPlans() {
    if (this.canViewPlans) {
      this.loading = true;
      this.planService.getPlans().subscribe({
        next: (plans) => {
          this.plans = plans;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
          this.loading = false;
        }
      });
    }
  }

  loadCurrentPlan() {
    if (this.canViewPlans) {
      this.planService.getCurrentUserPlan().subscribe({
        next: (data) => {
          this.currentPlan = data.plan;
          this.billingCompany = data.billingCompany;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status !== 404) {
            this.handleError(error);
          }
        }
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    if (error.status === 403) {
      this.error = 'You do not have permission to perform this action.';
    } else if (error.error?.message) {
      this.error = error.error.message;
    } else {
      this.error = 'An unexpected error occurred. Please try again later.';
    }
    setTimeout(() => this.error = null, 5000);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'text-bg-success';
      case 'Inactive':
        return 'text-bg-warning';
      case 'Deprecated':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  getActivePlansCount(): number {
    return this.plans.filter(p => p.status === 'Active').length;
  }

  getCustomPlansCount(): number {
    return this.plans.filter(p => p.isCustom).length;
  }

  getStandardPlansCount(): number {
    return this.plans.filter(p => !p.isCustom).length;
  }

  getFilteredPlans(): Plan[] {
    return this.plans.filter(plan => {
      const matchesSearch = !this.searchTerm || 
        plan.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || plan.status === this.filterStatus;
      const matchesCycle = !this.filterCycle || plan.billingCycle === this.filterCycle;

      return matchesSearch && matchesStatus && matchesCycle;
    });
  }

  getActivePlans(): Plan[] {
    return this.plans.filter(plan => plan.status === 'Active');
  }

  getAllowedFeatures(plan: Plan): string[] {
    return this.planService.getAllowedFeatures(plan, this.userRoles);
  }

  isCurrentPlan(plan: Plan): boolean {
    return this.currentPlan?.id === plan.id;
  }

  canSelectPlan(plan: Plan): boolean {
    return plan.status === 'Active' && !this.isCurrentPlan(plan) && this.canChangePlan;
  }

  openCreateModal() {
    if (this.canManagePlans) {
      const modalRef = this.modalService.open(AddPlanModalComponent, { size: 'lg' });
      modalRef.result.then(
        (plan: Plan) => {
          this.planService.createPlan(plan).subscribe({
            next: () => {
              this.loadPlans();
            },
            error: (error: HttpErrorResponse) => this.handleError(error)
          });
        },
        () => {} // Dismissed
      );
    }
  }

  openEditModal(plan: Plan) {
    if (this.canManagePlans) {
      const modalRef = this.modalService.open(EditPlanModalComponent, { size: 'lg' });
      modalRef.componentInstance.plan = plan;
      modalRef.result.then(
        (updatedPlan: Plan) => {
          this.planService.updatePlan(plan.id, updatedPlan).subscribe({
            next: () => {
              this.loadPlans();
            },
            error: (error: HttpErrorResponse) => this.handleError(error)
          });
        },
        () => {} // Dismissed
      );
    }
  }

  openDeleteModal(plan: Plan) {
    if (this.canManagePlans) {
      const modalRef = this.modalService.open(DeletePlanModalComponent);
      modalRef.componentInstance.plan = plan;
      modalRef.result.then(
        (planToDelete: Plan) => {
          this.planService.deletePlan(planToDelete.id).subscribe({
            next: () => {
              this.loadPlans();
            },
            error: (error: HttpErrorResponse) => this.handleError(error)
          });
        },
        () => {} // Dismissed
      );
    }
  }

  openSelectModal(plan: Plan) {
    if (this.canChangePlan) {
      const modalRef = this.modalService.open(SelectPlanModalComponent);
      modalRef.componentInstance.plan = plan;
      modalRef.componentInstance.currentPlan = this.currentPlan;
      modalRef.componentInstance.billingCompany = this.billingCompany;
      modalRef.result.then(
        (result: { planId: string; billingCompanyId: string }) => {
          this.planService.selectPlan(result.planId, result.billingCompanyId).subscribe({
            next: () => {
              this.loadCurrentPlan();
            },
            error: (error: HttpErrorResponse) => this.handleError(error)
          });
        },
        () => {} // Dismissed
      );
    }
  }
}
