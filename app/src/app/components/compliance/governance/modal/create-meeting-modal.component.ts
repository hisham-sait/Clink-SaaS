import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Committee, CommitteeMember } from '../../compliance.types';

@Component({
  selector: 'app-create-meeting-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Schedule Committee Meeting</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="meetingForm" (ngSubmit)="onSubmit()">
      <div class="modal-body p-3">
        <div class="row g-3">
          <!-- Basic Information -->
          <div class="col-md-6">
            <label class="form-label small">Meeting Date</label>
            <input type="date" class="form-control form-control-sm" formControlName="date">
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('date')?.touched && meetingForm.get('date')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label small">Meeting Time</label>
            <input type="time" class="form-control form-control-sm" formControlName="time">
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('time')?.touched && meetingForm.get('time')?.errors?.['required']">
              Required
            </div>
          </div>

          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="type">
              <option value="">Select Meeting Type</option>
              <option value="Regular">Regular Meeting</option>
              <option value="Special">Special Meeting</option>
              <option value="Emergency">Emergency Meeting</option>
              <option value="Annual">Annual Meeting</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('type')?.touched && meetingForm.get('type')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Location -->
          <div class="col-12">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" formControlName="meetingMode" value="physical" id="physical">
              <label class="form-check-label small" for="physical">Physical Meeting</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" formControlName="meetingMode" value="virtual" id="virtual">
              <label class="form-check-label small" for="virtual">Virtual Meeting</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" formControlName="meetingMode" value="hybrid" id="hybrid">
              <label class="form-check-label small" for="hybrid">Hybrid Meeting</label>
            </div>
          </div>

          <div class="col-12" *ngIf="meetingForm.get('meetingMode')?.value !== 'virtual'">
            <input type="text" class="form-control form-control-sm" placeholder="Meeting Location" formControlName="location">
          </div>

          <div class="col-12" *ngIf="meetingForm.get('meetingMode')?.value !== 'physical'">
            <input type="text" class="form-control form-control-sm" placeholder="Virtual Meeting Link" formControlName="virtualLink">
          </div>

          <!-- Attendees -->
          <div class="col-12">
            <label class="form-label small">Attendees</label>
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="d-flex flex-wrap gap-2">
                  <div *ngFor="let member of committee.members" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox"
                      [id]="'attendee-' + member.id"
                      [value]="member.id"
                      (change)="onAttendeeChange($event, member)"
                      [checked]="isSelected(member)">
                    <label class="form-check-label small" [for]="'attendee-' + member.id">
                      {{member.name}}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('attendees')?.touched && meetingForm.get('attendees')?.errors?.['required']">
              At least one attendee is required
            </div>
          </div>

          <!-- Agenda -->
          <div class="col-12">
            <textarea 
              class="form-control form-control-sm" 
              rows="3" 
              placeholder="Meeting Agenda (one item per line)" 
              formControlName="agenda">
            </textarea>
            <small class="text-muted">Enter each agenda item on a new line</small>
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('agenda')?.touched && meetingForm.get('agenda')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Materials -->
          <div class="col-12">
            <textarea 
              class="form-control form-control-sm" 
              rows="2" 
              placeholder="Required Materials (one per line)" 
              formControlName="materials">
            </textarea>
            <small class="text-muted">List any materials attendees should prepare</small>
          </div>

          <!-- Notes -->
          <div class="col-12">
            <textarea 
              class="form-control form-control-sm" 
              rows="2" 
              placeholder="Additional Notes" 
              formControlName="notes">
            </textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!meetingForm.valid">
          Schedule Meeting
        </button>
      </div>
    </form>
  `
})
export class CreateMeetingModalComponent {
  @Input() committee!: Committee;

  meetingForm: FormGroup;
  selectedAttendees: CommitteeMember[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.meetingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      type: ['', Validators.required],
      meetingMode: ['physical', Validators.required],
      location: [''],
      virtualLink: [''],
      attendees: [[], Validators.required],
      agenda: ['', Validators.required],
      materials: [''],
      notes: ['']
    });

    // Update location/virtualLink requirements based on meeting mode
    this.meetingForm.get('meetingMode')?.valueChanges.subscribe(mode => {
      const locationControl = this.meetingForm.get('location');
      const virtualLinkControl = this.meetingForm.get('virtualLink');

      if (mode === 'physical') {
        locationControl?.setValidators([Validators.required]);
        virtualLinkControl?.clearValidators();
      } else if (mode === 'virtual') {
        locationControl?.clearValidators();
        virtualLinkControl?.setValidators([Validators.required]);
      } else if (mode === 'hybrid') {
        locationControl?.setValidators([Validators.required]);
        virtualLinkControl?.setValidators([Validators.required]);
      }

      locationControl?.updateValueAndValidity();
      virtualLinkControl?.updateValueAndValidity();
    });
  }

  onAttendeeChange(event: any, member: CommitteeMember): void {
    if (event.target.checked) {
      this.selectedAttendees.push(member);
    } else {
      this.selectedAttendees = this.selectedAttendees.filter(m => m.id !== member.id);
    }
    this.meetingForm.patchValue({ attendees: this.selectedAttendees });
  }

  isSelected(member: CommitteeMember): boolean {
    return this.selectedAttendees.some(m => m.id === member.id);
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      // Convert agenda and materials from text to arrays
      const agenda = this.meetingForm.get('agenda')?.value
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const materials = this.meetingForm.get('materials')?.value
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const result = {
        committee: this.committee,
        meeting: {
          ...this.meetingForm.value,
          agenda,
          materials,
          status: 'Scheduled',
          committeeId: this.committee.id
        }
      };
      this.activeModal.close(result);
    }
  }
}
