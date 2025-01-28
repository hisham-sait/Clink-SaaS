import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Plan } from '../../settings.types';

@Component({
  selector: 'app-delete-plan-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header border-bottom-0">
      <h5 class="modal-title text-danger">Delete Plan</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="text-center mb-4">
        <i class="bi bi-exclamation-triangle text-danger display-4"></i>
      </div>
      <p class="text-center mb-1">Are you sure you want to delete this plan?</p>
      <p class="text-center text-muted mb-4">This action cannot be undone.</p>

      <div class="alert alert-warning">
        <h6 class="alert-heading mb-2">Plan Details:</h6>
        <p class="mb-1"><strong>Name:</strong> {{ plan.name }}</p>
        <p class="mb-1"><strong>Price:</strong> {{ plan.price | currency }}/{{ plan.billingCycle.toLowerCase() }}</p>
        <p class="mb-1"><strong>Users:</strong> {{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</p>
        <p class="mb-0"><strong>Companies:</strong> {{ plan.maxCompanies === -1 ? 'Unlimited' : plan.maxCompanies }}</p>
      </div>

      <div class="alert alert-danger mb-0">
        <i class="bi bi-exclamation-circle me-2"></i>
        Deleting this plan will remove it from the system and affect any companies currently using it.
      </div>
    </div>
    <div class="modal-footer border-top-0">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button 
        type="button" 
        class="btn btn-danger"
        (click)="confirmDelete()">
        Delete Plan
      </button>
    </div>
  `,
  styles: [`
    .bi-exclamation-triangle {
      line-height: 1;
      font-size: 3rem;
    }
  `]
})
export class DeletePlanModalComponent {
  @Input() plan!: Plan;

  constructor(public activeModal: NgbActiveModal) {}

  confirmDelete() {
    this.activeModal.close(this.plan);
  }
}
