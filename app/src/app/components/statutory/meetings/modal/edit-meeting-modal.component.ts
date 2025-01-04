import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Meeting } from '../../statutory.types';

@Component({
  selector: 'app-edit-meeting-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Edit Meeting</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="meetingForm" class="row g-3">
        <!-- Basic Details -->
        <div class="col-md-6">
          <label class="form-label">Meeting ID</label>
          <input type="text" class="form-control" formControlName="meetingId" placeholder="e.g., AGM2024">
        </div>
        <div class="col-md-6">
          <label class="form-label">Meeting Type</label>
          <select class="form-select" formControlName="meetingType">
            <option value="">Select Type</option>
            <option *ngFor="let type of meetingTypes" [value]="type">{{ type }}</option>
          </select>
        </div>

        <!-- Date and Time -->
        <div class="col-md-4">
          <label class="form-label">Meeting Date</label>
          <input type="date" class="form-control" formControlName="meetingDate">
        </div>
        <div class="col-md-4">
          <label class="form-label">Start Time</label>
          <input type="time" class="form-control" formControlName="startTime">
        </div>
        <div class="col-md-4">
          <label class="form-label">End Time</label>
          <input type="time" class="form-control" formControlName="endTime">
        </div>

        <!-- Venue -->
        <div class="col-12">
          <label class="form-label">Venue</label>
          <input type="text" class="form-control" formControlName="venue" placeholder="Meeting location">
        </div>

        <!-- Participants -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Participants</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Chairperson</label>
          <input type="text" class="form-control" formControlName="chairperson" placeholder="Name of chairperson">
        </div>
        <div class="col-md-6">
          <label class="form-label">Attendees</label>
          <textarea class="form-control" formControlName="attendees" rows="2" 
                    placeholder="Enter attendees (one per line)"></textarea>
        </div>

        <!-- Quorum -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Quorum Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Required Quorum</label>
          <input type="number" class="form-control" formControlName="quorumRequired" min="1">
        </div>
        <div class="col-md-6">
          <label class="form-label">Present Members</label>
          <input type="number" class="form-control" formControlName="quorumPresent" min="0">
        </div>

        <!-- Agenda -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h6 class="fw-bold mb-0">Meeting Content</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label">Agenda</label>
          <textarea class="form-control" formControlName="agenda" rows="3" 
                    placeholder="Meeting agenda items"></textarea>
        </div>

        <!-- Resolutions -->
        <div class="col-12" formArrayName="resolutions">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold mb-0">Resolutions</h6>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="addResolution()">
              <i class="bi bi-plus-lg me-1"></i>Add Resolution
            </button>
          </div>

          <div *ngFor="let resolution of getResolutions().controls; let i = index" 
               [formGroupName]="i" class="card mb-3">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" formControlName="title" 
                         placeholder="Resolution title">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type</label>
                  <select class="form-select" formControlName="type">
                    <option value="">Select Type</option>
                    <option value="Ordinary">Ordinary Resolution</option>
                    <option value="Special">Special Resolution</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="2" 
                           placeholder="Resolution details"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Outcome</label>
                  <select class="form-select" formControlName="outcome">
                    <option value="Pending">Pending</option>
                    <option value="Passed">Passed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div class="col-md-6 d-flex align-items-end">
                  <button type="button" class="btn btn-sm btn-outline-danger" 
                          (click)="removeResolution(i)">
                    <i class="bi bi-trash me-1"></i>Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Minutes -->
        <div class="col-12">
          <label class="form-label">Minutes</label>
          <textarea class="form-control" formControlName="minutes" rows="5" 
                    placeholder="Meeting minutes"></textarea>
        </div>

        <!-- Notes -->
        <div class="col-12">
          <label class="form-label">Notes</label>
          <textarea class="form-control" formControlName="notes" rows="2" 
                    placeholder="Additional notes about the meeting"></textarea>
        </div>

        <!-- Status -->
        <div class="col-md-6">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="Draft">Draft</option>
            <option value="Final">Final</option>
            <option value="Signed">Signed</option>
          </select>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!meetingForm.valid">
        Save Changes
      </button>
    </div>
  `
})
export class EditMeetingModalComponent implements OnInit {
  @Input() meeting!: Meeting;
  meetingForm: FormGroup;
  meetingTypes = ['AGM', 'EGM', 'Class Meeting'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.meetingForm = this.fb.group({
      meetingId: ['', Validators.required],
      meetingType: ['', Validators.required],
      meetingDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      venue: ['', Validators.required],
      chairperson: ['', Validators.required],
      attendees: ['', Validators.required],
      quorumRequired: [1, [Validators.required, Validators.min(1)]],
      quorumPresent: [0, [Validators.required, Validators.min(0)]],
      agenda: ['', Validators.required],
      resolutions: this.fb.array([]),
      minutes: ['', Validators.required],
      notes: [''],
      status: ['Draft', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.meeting) {
      // Convert attendees array to string
      const attendeesString = this.meeting.attendees.join('\n');

      // Set form values
      this.meetingForm.patchValue({
        ...this.meeting,
        attendees: attendeesString,
        quorumRequired: this.meeting.quorum.required,
        quorumPresent: this.meeting.quorum.present
      });

      // Clear and recreate resolutions form array
      while (this.getResolutions().length) {
        this.getResolutions().removeAt(0);
      }

      this.meeting.resolutions.forEach(resolution => {
        this.addResolution(resolution);
      });
    }
  }

  getResolutions() {
    return this.meetingForm.get('resolutions') as any;
  }

  addResolution(resolution?: any) {
    const resolutionForm = this.fb.group({
      title: [resolution?.title || '', Validators.required],
      type: [resolution?.type || '', Validators.required],
      description: [resolution?.description || '', Validators.required],
      outcome: [resolution?.outcome || 'Pending', Validators.required]
    });

    this.getResolutions().push(resolutionForm);
  }

  removeResolution(index: number) {
    this.getResolutions().removeAt(index);
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;
      
      // Convert attendees string to array
      formValue.attendees = formValue.attendees
        .split('\n')
        .map((a: string) => a.trim())
        .filter((a: string) => a);

      // Calculate quorum achieved
      formValue.quorum = {
        required: formValue.quorumRequired,
        present: formValue.quorumPresent,
        achieved: formValue.quorumPresent >= formValue.quorumRequired
      };

      // Remove separate quorum fields
      delete formValue.quorumRequired;
      delete formValue.quorumPresent;

      const updatedMeeting: Meeting = {
        ...this.meeting,
        ...formValue
      };
      
      this.activeModal.close(updatedMeeting);
    } else {
      Object.keys(this.meetingForm.controls).forEach(key => {
        const control = this.meetingForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
