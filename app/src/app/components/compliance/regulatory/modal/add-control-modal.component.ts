import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement } from './../../compliance.types';

@Component({
  selector: 'app-add-control-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Control</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="controlForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Requirement Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Requirement</label>
          <p class="mb-0">{{ requirement.title }}</p>
          <small class="text-muted">
            {{ requirement.authority }} | {{ requirement.jurisdiction }}
          </small>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="name"
            placeholder="Enter control name"
          >
          <div class="form-text text-danger" *ngIf="controlForm.get('name')?.touched && controlForm.get('name')?.errors?.['required']">
            Name is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="description"
            placeholder="Enter control description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="controlForm.get('description')?.touched && controlForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Control Details -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Type</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="type"
              placeholder="e.g., Preventive, Detective"
            >
            <div class="form-text text-danger" *ngIf="controlForm.get('type')?.touched && controlForm.get('type')?.errors?.['required']">
              Type is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Under Review">Under Review</option>
            </select>
            <div class="form-text text-danger" *ngIf="controlForm.get('status')?.touched && controlForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>
        </div>

        <!-- Effectiveness and Owner -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Effectiveness</label>
            <select class="form-select" formControlName="effectiveness">
              <option value="">Select Effectiveness</option>
              <option value="Effective">Effective</option>
              <option value="Partially Effective">Partially Effective</option>
              <option value="Ineffective">Ineffective</option>
            </select>
            <div class="form-text text-danger" *ngIf="controlForm.get('effectiveness')?.touched && controlForm.get('effectiveness')?.errors?.['required']">
              Effectiveness is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Owner</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="owner"
              placeholder="Enter control owner"
            >
          </div>
        </div>

        <!-- Implementation -->
        <div class="mb-3">
          <label class="form-label">Implementation Details</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="implementation"
            placeholder="Describe how this control is implemented"
          ></textarea>
        </div>

        <!-- Testing -->
        <div class="mb-3">
          <label class="form-label">Testing Procedures</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="testing"
            placeholder="Describe how this control is tested"
          ></textarea>
        </div>

        <!-- Testing Schedule -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Last Tested Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="lastTestedDate"
            >
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Next Test Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="nextTestDate"
            >
          </div>
        </div>

        <!-- Evidence -->
        <div class="mb-3">
          <label class="form-label">Evidence</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="evidence"
            placeholder="List required evidence or documentation"
          ></textarea>
          <small class="form-text text-muted">
            Enter each piece of evidence on a new line
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!controlForm.valid">
          Add Control
        </button>
      </div>
    </form>
  `
})
export class AddControlModalComponent {
  @Input() requirement!: RegulatoryRequirement;

  controlForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.controlForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      status: ['Active', Validators.required],
      effectiveness: ['Effective', Validators.required],
      implementation: [''],
      testing: [''],
      owner: [''],
      lastTestedDate: [''],
      nextTestDate: [''],
      evidence: [''],
      requirementId: [''] // Will be set from input requirement
    });
  }

  ngOnInit(): void {
    if (this.requirement) {
      this.controlForm.patchValue({
        requirementId: this.requirement.id
      });
    }
  }

  onSubmit(): void {
    if (this.controlForm.valid) {
      const formValue = this.controlForm.value;
      
      // Convert evidence to array if it contains multiple lines
      const evidence = formValue.evidence ? formValue.evidence.split('\n').filter((e: string) => e.trim()) : [];

      const result = {
        requirement: this.requirement,
        control: {
          ...formValue,
          evidence
        }
      };

      this.activeModal.close(result);
    }
  }
}
