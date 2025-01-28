import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Committee, CommitteeMember } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-create-committee-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Create New Committee</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="committeeForm" (ngSubmit)="onSubmit()">
      <div class="modal-body p-3">
        <div class="row g-3">
          <!-- Company Selection -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="companyId">
              <option value="">Select Company</option>
              <option *ngFor="let company of companies" [value]="company.id">
                {{ company.name }}
              </option>
            </select>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('companyId')?.touched && committeeForm.get('companyId')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Basic Information -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Committee Title" formControlName="title">
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('title')?.touched && committeeForm.get('title')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Description" formControlName="description"></textarea>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('description')?.touched && committeeForm.get('description')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Type and Status -->
          <div class="col-md-6">
            <select class="form-select form-select-sm" formControlName="type">
              <option value="">Select Type</option>
              <option value="Audit">Audit Committee</option>
              <option value="Risk">Risk Committee</option>
              <option value="Nomination">Nomination Committee</option>
              <option value="Remuneration">Remuneration Committee</option>
              <option value="Governance">Governance Committee</option>
              <option value="Ethics">Ethics Committee</option>
              <option value="Executive">Executive Committee</option>
              <option value="Special">Special Committee</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('type')?.touched && committeeForm.get('type')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <select class="form-select form-select-sm" formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <!-- Charter -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="3" placeholder="Committee Charter" formControlName="charter"></textarea>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('charter')?.touched && committeeForm.get('charter')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Members -->
          <div class="col-12">
            <label class="form-label small">Committee Members</label>
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="d-flex flex-wrap gap-2">
                  <div *ngFor="let member of availableMembers" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox"
                      [id]="'member-' + member.id"
                      [value]="member.id"
                      (change)="onMemberChange($event, member)"
                      [checked]="isSelected(member)">
                    <label class="form-check-label small" [for]="'member-' + member.id">
                      {{member.name}}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('members')?.touched && committeeForm.get('members')?.errors?.['required']">
              At least one member is required
            </div>
          </div>

          <!-- Responsibilities -->
          <div class="col-12">
            <textarea 
              class="form-control form-control-sm" 
              rows="3" 
              placeholder="Responsibilities (one per line)" 
              formControlName="responsibilities">
            </textarea>
            <small class="text-muted">Enter each responsibility on a new line</small>
            <div class="invalid-feedback" [class.d-block]="committeeForm.get('responsibilities')?.touched && committeeForm.get('responsibilities')?.errors?.['required']">
              Required
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!committeeForm.valid">
          Create Committee
        </button>
      </div>
    </form>
  `
})
export class CreateCommitteeModalComponent {
  @Input() companies: Company[] = [];
  @Input() availableMembers: CommitteeMember[] = [];

  committeeForm: FormGroup;
  selectedMembers: CommitteeMember[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.committeeForm = this.fb.group({
      companyId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      status: ['Active'],
      charter: ['', Validators.required],
      members: [[], Validators.required],
      responsibilities: ['', Validators.required]
    });
  }

  onMemberChange(event: any, member: CommitteeMember): void {
    if (event.target.checked) {
      this.selectedMembers.push(member);
    } else {
      this.selectedMembers = this.selectedMembers.filter(m => m.id !== member.id);
    }
    this.committeeForm.patchValue({ members: this.selectedMembers });
  }

  isSelected(member: CommitteeMember): boolean {
    return this.selectedMembers.some(m => m.id === member.id);
  }

  onSubmit(): void {
    if (this.committeeForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.committeeForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert responsibilities from text to array
        const responsibilities = this.committeeForm.get('responsibilities')?.value
          .split('\n')
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 0);

        const result = {
          company: selectedCompany,
          committee: {
            ...this.committeeForm.value,
            responsibilities
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
