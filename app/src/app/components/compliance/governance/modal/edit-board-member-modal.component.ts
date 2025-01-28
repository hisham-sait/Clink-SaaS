import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMember } from '../../compliance.types';
import { Company } from '../../../settings/settings.types';

@Component({
  selector: 'app-edit-board-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Edit Board Member</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">
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
            <div class="invalid-feedback" [class.d-block]="memberForm.get('companyId')?.touched && memberForm.get('companyId')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Basic Information -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Full Name" formControlName="name">
            <div class="invalid-feedback" [class.d-block]="memberForm.get('name')?.touched && memberForm.get('name')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="role">
              <option value="">Select Role</option>
              <option value="Chairman">Chairman</option>
              <option value="Executive Director">Executive Director</option>
              <option value="Non-Executive Director">Non-Executive Director</option>
              <option value="Independent Director">Independent Director</option>
              <option value="Committee Chair">Committee Chair</option>
              <option value="Committee Member">Committee Member</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="memberForm.get('role')?.touched && memberForm.get('role')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Expertise -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" placeholder="Areas of Expertise (comma-separated)" formControlName="expertise">
            <div class="invalid-feedback" [class.d-block]="memberForm.get('expertise')?.touched && memberForm.get('expertise')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Dates -->
          <div class="col-md-6">
            <label class="form-label small">Appointment Date</label>
            <input type="date" class="form-control form-control-sm" formControlName="appointmentDate">
            <div class="invalid-feedback" [class.d-block]="memberForm.get('appointmentDate')?.touched && memberForm.get('appointmentDate')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label small">End Date (Optional)</label>
            <input type="date" class="form-control form-control-sm" formControlName="endDate">
          </div>

          <!-- Status -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <!-- Committee Assignment -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="committeeId">
              <option value="">Select Committee (Optional)</option>
              <option value="1">Audit Committee</option>
              <option value="2">Risk Committee</option>
              <option value="3">Nomination Committee</option>
              <option value="4">Remuneration Committee</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Update Notes (Optional)" formControlName="notes"></textarea>
            <small class="text-muted">Describe the changes being made</small>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!memberForm.valid">
          Update Member
        </button>
      </div>
    </form>
  `
})
export class EditBoardMemberModalComponent implements OnInit {
  @Input() companies: Company[] = [];
  @Input() member!: CommitteeMember;

  memberForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.memberForm = this.fb.group({
      companyId: ['', Validators.required],
      name: ['', Validators.required],
      role: ['', Validators.required],
      expertise: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      endDate: [''],
      status: ['Active'],
      committeeId: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.member) {
      this.memberForm.patchValue({
        ...this.member,
        expertise: this.member.expertise.join(', ')
      });
    }
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      const selectedCompany = this.companies.find(c => c.id === this.memberForm.get('companyId')?.value);
      if (selectedCompany) {
        // Convert comma-separated expertise to array
        const expertise = this.memberForm.get('expertise')?.value
          ? this.memberForm.get('expertise')?.value.split(',').map((e: string) => e.trim())
          : [];

        const result = {
          company: selectedCompany,
          member: {
            ...this.memberForm.value,
            id: this.member.id,
            expertise
          }
        };
        this.activeModal.close(result);
      }
    }
  }
}
