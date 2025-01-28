import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Company, Plan } from '../../settings.types';
import { PlanService } from '../../../../services/settings/plan.service';
import { BillingService } from '../../../../services/settings/billing.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manage-company-plan-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Manage Company Plan</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Loading State -->
      <div class="text-center py-4" *ngIf="loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert" *ngIf="error">
        {{ error }}
        <button type="button" class="btn-close" (click)="error = null"></button>
      </div>

      <!-- Current Plan -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="currentPlan">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">Current Plan</h6>
              <h5 class="mb-1">{{ currentPlan.name }}</h5>
              <p class="text-muted mb-0">
                {{ currentPlan.price | currency }}/{{ currentPlan.billingCycle.toLowerCase() }}
              </p>
            </div>
            <span [class]="'badge ' + getStatusBadgeClass(currentPlan.status)">
              {{ currentPlan.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Available Plans -->
      <h6 class="mb-3">Available Plans</h6>
      <div class="row g-3">
        <div class="col-md-6" *ngFor="let plan of availablePlans">
          <div class="card h-100 border-0 shadow-sm" [class.border-primary]="isCurrentPlan(plan)">
            <!-- Plan Header -->
            <div class="card-header bg-transparent border-0 pt-3 pb-0">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">{{ plan.name }}</h6>
                <i class="bi" [class.bi-box-seam]="!plan.isCustom" [class.bi-gear]="plan.isCustom"></i>
              </div>
            </div>

            <!-- Plan Body -->
            <div class="card-body">
              <div class="mb-2">
                <h5 class="mb-0">
                  {{ plan.price | currency }}
                  <small class="text-muted fs-6">/{{ plan.billingCycle.toLowerCase() }}</small>
                </h5>
              </div>
              
              <p class="text-muted small mb-3">{{ plan.description }}</p>

              <!-- Plan Features -->
              <ul class="list-unstyled mb-3 small">
                <li class="mb-1" *ngFor="let feature of plan.features">
                  <i class="bi bi-check2 text-success me-2"></i>
                  {{ feature }}
                </li>
              </ul>

              <!-- Plan Limits -->
              <div class="d-flex justify-content-between text-muted small mb-2">
                <span>Users</span>
                <span>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</span>
              </div>
              <div class="d-flex justify-content-between text-muted small">
                <span>Companies</span>
                <span>{{ plan.maxCompanies === -1 ? 'Unlimited' : plan.maxCompanies }}</span>
              </div>
            </div>

            <!-- Plan Footer -->
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <div class="d-grid">
                <button 
                  class="btn"
                  [class.btn-outline-primary]="!isCurrentPlan(plan)"
                  [class.btn-primary]="isCurrentPlan(plan)"
                  [disabled]="!canSelectPlan(plan)"
                  (click)="selectPlan(plan)">
                  {{ isCurrentPlan(plan) ? 'Current Plan' : 'Select Plan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Close</button>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class ManageCompanyPlanModalComponent implements OnInit {
  @Input() company!: Company;
  
  currentPlan: Plan | null = null;
  availablePlans: Plan[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private planService: PlanService,
    private billingService: BillingService
  ) {}

  ngOnInit() {
    this.loadPlans();
    this.loadCurrentPlan();
  }

  private loadPlans() {
    this.loading = true;
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.availablePlans = plans.filter(p => p.status === 'Active');
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
        this.loading = false;
      }
    });
  }

  private loadCurrentPlan() {
    this.billingService.getCurrentPlan(this.company.id).subscribe({
      next: (plan) => {
        this.currentPlan = plan;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 404) {
          this.handleError(error);
        }
      }
    });
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

  isCurrentPlan(plan: Plan): boolean {
    return this.currentPlan?.id === plan.id;
  }

  canSelectPlan(plan: Plan): boolean {
    return plan.status === 'Active' && !this.isCurrentPlan(plan);
  }

  selectPlan(plan: Plan) {
    this.loading = true;
    this.billingService.changePlan(this.company.id, plan.id).subscribe({
      next: (updatedPlan) => {
        this.currentPlan = updatedPlan;
        this.loading = false;
        this.activeModal.close(updatedPlan);
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
        this.loading = false;
      }
    });
  }
}
