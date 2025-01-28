import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Plan } from '../../settings.types';

@Component({
  selector: 'app-edit-plan-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Plan</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <form [formGroup]="planForm">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input type="text" class="form-control" formControlName="name" placeholder="Enter plan name">
          <div class="form-text text-danger" *ngIf="planForm.get('name')?.touched && planForm.get('name')?.invalid">
            Plan name is required
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" formControlName="description" rows="3" placeholder="Enter plan description"></textarea>
          <div class="form-text text-danger" *ngIf="planForm.get('description')?.touched && planForm.get('description')?.invalid">
            Description is required
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Price</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" formControlName="price" min="0" step="0.01">
          </div>
          <div class="form-text text-danger" *ngIf="planForm.get('price')?.touched && planForm.get('price')?.invalid">
            Price must be 0 or greater
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Billing Cycle</label>
          <select class="form-select" formControlName="billingCycle">
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Features</label>
          <div formArrayName="features">
            <div class="input-group mb-2" *ngFor="let feature of features.controls; let i = index">
              <input type="text" class="form-control" [formControlName]="i" placeholder="Enter feature">
              <button class="btn btn-outline-danger" type="button" (click)="removeFeature(i)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm" (click)="addFeature()">
            <i class="bi bi-plus-lg me-2"></i>Add Feature
          </button>
        </div>
        <div class="mb-3">
          <label class="form-label">Max Users</label>
          <input type="number" class="form-control" formControlName="maxUsers" min="-1">
          <small class="text-muted">Use -1 for unlimited</small>
        </div>
        <div class="mb-3">
          <label class="form-label">Max Companies</label>
          <input type="number" class="form-control" formControlName="maxCompanies" min="-1">
          <small class="text-muted">Use -1 for unlimited</small>
        </div>
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button 
        type="button" 
        class="btn btn-primary"
        (click)="savePlan()"
        [disabled]="planForm.invalid">
        Update Plan
      </button>
    </div>
  `
})
export class EditPlanModalComponent implements OnInit {
  @Input() plan!: Plan;
  
  planForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder
  ) {
    this.planForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      billingCycle: ['Monthly', Validators.required],
      features: this.formBuilder.array([]),
      maxUsers: [0, [Validators.required]],
      maxCompanies: [0, [Validators.required]],
      status: ['Active', Validators.required],
      isCustom: [false]
    });
  }

  ngOnInit() {
    if (this.plan) {
      this.planForm.patchValue({
        name: this.plan.name,
        description: this.plan.description,
        price: this.plan.price,
        billingCycle: this.plan.billingCycle,
        maxUsers: this.plan.maxUsers,
        maxCompanies: this.plan.maxCompanies,
        status: this.plan.status,
        isCustom: this.plan.isCustom
      });

      // Clear and add existing features
      this.features.clear();
      this.plan.features.forEach(feature => {
        this.features.push(this.formBuilder.control(feature));
      });
    }
  }

  get features() {
    return this.planForm.get('features') as FormArray;
  }

  addFeature() {
    this.features.push(this.formBuilder.control(''));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  savePlan() {
    if (this.planForm.valid) {
      const updatedPlan = {
        ...this.planForm.value,
        id: this.plan.id
      };
      this.activeModal.close(updatedPlan);
    }
  }
}
