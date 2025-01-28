import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Plan, Company } from '../../settings.types';
import { PlanService } from '../../../../services/settings/plan.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-select-plan-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Change Subscription Plan</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p class="mb-4">Are you sure you want to change to the {{ plan.name }} plan?</p>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h6 class="card-title mb-3">Plan Details</h6>
          
          <!-- Price -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted">Price</span>
            <span class="fw-bold">{{ plan.price | currency }}/{{ plan.billingCycle.toLowerCase() }}</span>
          </div>

          <!-- Features -->
          <h6 class="mb-2">Features</h6>
          <ul class="list-unstyled mb-3">
            <li class="mb-2" *ngFor="let feature of plan.features">
              <i class="bi bi-check2 text-success me-2"></i>
              {{ feature }}
            </li>
          </ul>

          <!-- Limits -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">Users</span>
            <span>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted">Companies</span>
            <span>{{ plan.maxCompanies === -1 ? 'Unlimited' : plan.maxCompanies }}</span>
          </div>
        </div>
      </div>

      <!-- Billing Company Selection -->
      <div class="mb-4">
        <label class="form-label">Select Billing Company</label>
        <select 
          class="form-select" 
          [(ngModel)]="selectedBillingCompanyId"
          (change)="validateSelection()"
          [disabled]="isLoading">
          <option value="">Select a company</option>
          <option 
            *ngFor="let company of billingCompanies" 
            [value]="company.id"
            [selected]="company.id === currentBillingCompanyId">
            {{ company.name }}
          </option>
        </select>
        <small class="text-muted">
          Select the company that will be billed for this plan
        </small>
      </div>

      <!-- Validation Message -->
      <div *ngIf="validationMessage" class="alert" [class.alert-danger]="!isValid" [class.alert-success]="isValid">
        <i class="bi" [class.bi-exclamation-circle]="!isValid" [class.bi-check-circle]="isValid"></i>
        {{ validationMessage }}
      </div>

      <div class="alert alert-info mb-0">
        <i class="bi bi-info-circle me-2"></i>
        Your subscription will be updated immediately. The selected company will be billed the new rate on the next billing cycle.
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button 
        type="button" 
        class="btn btn-primary"
        (click)="confirmChange()"
        [disabled]="!isValid || !selectedBillingCompanyId || isLoading">
        <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
        Confirm Change
      </button>
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
export class SelectPlanModalComponent implements OnInit {
  @Input() plan!: Plan;
  @Input() currentPlan?: Plan | null;
  @Input() currentBillingCompanyId?: string | null;

  billingCompanies: Company[] = [];
  selectedBillingCompanyId: string = '';
  isLoading: boolean = false;
  isValid: boolean = false;
  validationMessage: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private planService: PlanService
  ) {}

  ngOnInit() {
    this.loadBillingCompanies();
    if (this.currentBillingCompanyId) {
      this.selectedBillingCompanyId = this.currentBillingCompanyId;
      this.validateSelection();
    }
  }

  loadBillingCompanies() {
    this.isLoading = true;
    this.planService.getAvailableBillingCompanies()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (companies) => {
          this.billingCompanies = companies;
        },
        error: (error) => {
          console.error('Error loading billing companies:', error);
          this.validationMessage = 'Failed to load billing companies';
          this.isValid = false;
        }
      });
  }

  validateSelection() {
    if (!this.selectedBillingCompanyId) {
      this.validationMessage = 'Please select a billing company';
      this.isValid = false;
      return;
    }

    this.isLoading = true;
    this.planService.validatePlanSelection(this.plan.id, this.selectedBillingCompanyId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (result) => {
          this.isValid = result.valid;
          this.validationMessage = result.message || (result.valid ? 'Plan selection is valid' : 'Invalid plan selection');
        },
        error: (error) => {
          console.error('Error validating plan selection:', error);
          this.validationMessage = 'Failed to validate plan selection';
          this.isValid = false;
        }
      });
  }

  confirmChange() {
    if (!this.selectedBillingCompanyId || !this.isValid) {
      return;
    }

    this.isLoading = true;
    this.planService.selectPlan(this.plan.id, this.selectedBillingCompanyId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          this.activeModal.close(user);
        },
        error: (error) => {
          console.error('Error changing plan:', error);
          this.validationMessage = 'Failed to change plan';
          this.isValid = false;
        }
      });
  }
}
