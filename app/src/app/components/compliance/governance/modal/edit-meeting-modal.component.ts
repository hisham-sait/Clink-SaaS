import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting, CommitteeMeetingAttendee, CommitteeActionItem } from '../../compliance.types';

@Component({
  selector: 'app-edit-meeting-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Edit Meeting</h5>
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

          <div class="col-md-6">
            <label class="form-label small">Meeting Type</label>
            <select class="form-select form-select-sm" formControlName="type">
              <option value="Regular">Regular Meeting</option>
              <option value="Special">Special Meeting</option>
              <option value="Emergency">Emergency Meeting</option>
              <option value="Annual">Annual Meeting</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label small">Status</label>
            <select class="form-select form-select-sm" formControlName="status">
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Location -->
          <div class="col-12">
            <label class="form-label small">Meeting Mode</label>
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
                <div class="list-group list-group-flush">
                  <div class="list-group-item px-0 py-2" *ngFor="let attendee of attendees; let i = index">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-person-circle text-secondary"></i>
                        <div>
                          <span class="small">{{attendee.name}}</span>
                          <small class="text-muted d-block">{{attendee.role}}</small>
                        </div>
                      </div>
                      <select class="form-select form-select-sm" style="width: auto;" 
                              (change)="updateAttendeeStatus(i, $event)">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </div>
                    <input type="text" class="form-control form-control-sm" 
                           placeholder="Notes (optional)"
                           [value]="attendee.notes || ''"
                           (input)="updateAttendeeNotes(i, $event)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Agenda -->
          <div class="col-12">
            <label class="form-label small">Agenda</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="3" 
              placeholder="Meeting Agenda (one item per line)" 
              formControlName="agenda">
            </textarea>
            <div class="invalid-feedback" [class.d-block]="meetingForm.get('agenda')?.touched && meetingForm.get('agenda')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Materials -->
          <div class="col-12">
            <label class="form-label small">Meeting Materials</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="2" 
              placeholder="Required Materials (one per line)" 
              formControlName="materials">
            </textarea>
          </div>

          <!-- Minutes -->
          <div class="col-12">
            <label class="form-label small">Meeting Minutes</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="4" 
              placeholder="Meeting Minutes" 
              formControlName="minutes">
            </textarea>
          </div>

          <!-- Decisions -->
          <div class="col-12">
            <label class="form-label small">Key Decisions</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="3" 
              placeholder="Key Decisions (one per line)" 
              formControlName="decisions">
            </textarea>
          </div>

          <!-- Action Items -->
          <div class="col-12">
            <label class="form-label small">Action Items</label>
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="list-group list-group-flush">
                  <div class="list-group-item px-0 py-2" *ngFor="let item of actionItems; let i = index">
                    <div class="row g-2">
                      <div class="col-12">
                        <input type="text" class="form-control form-control-sm" 
                               placeholder="Task"
                               [value]="item.task"
                               (input)="updateActionItem(i, 'task', $event)">
                      </div>
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" 
                               placeholder="Assigned To"
                               [value]="item.assignedTo"
                               (input)="updateActionItem(i, 'assignedTo', $event)">
                      </div>
                      <div class="col-md-6">
                        <input type="date" class="form-control form-control-sm"
                               [value]="item.dueDate"
                               (input)="updateActionItem(i, 'dueDate', $event)">
                      </div>
                      <div class="col-md-6">
                        <select class="form-select form-select-sm"
                                [value]="item.status"
                                (change)="updateActionItem(i, 'status', $event)">
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" 
                               placeholder="Notes (optional)"
                               [value]="item.notes || ''"
                               (input)="updateActionItem(i, 'notes', $event)">
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-link btn-sm px-0" (click)="addActionItem()">
                  <i class="bi bi-plus-circle me-1"></i>Add Action Item
                </button>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="col-12">
            <label class="form-label small">Additional Notes</label>
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
          Update Meeting
        </button>
      </div>
    </form>
  `
})
export class EditMeetingModalComponent implements OnInit {
  @Input() meeting!: CommitteeMeeting;

  meetingForm: FormGroup;
  attendees: CommitteeMeetingAttendee[] = [];
  actionItems: CommitteeActionItem[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.meetingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      type: ['Regular', Validators.required],
      status: ['Scheduled'],
      meetingMode: ['physical'],
      location: [''],
      virtualLink: [''],
      agenda: ['', Validators.required],
      materials: [''],
      minutes: [''],
      decisions: [''],
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

  ngOnInit(): void {
    if (this.meeting) {
      this.attendees = [...this.meeting.attendees];
      this.actionItems = [...this.meeting.actionItems];

      this.meetingForm.patchValue({
        date: this.meeting.date,
        time: this.meeting.time,
        type: this.meeting.type,
        status: this.meeting.status,
        meetingMode: this.meeting.meetingMode,
        location: this.meeting.location,
        virtualLink: this.meeting.virtualLink,
        agenda: this.meeting.agenda.join('\n'),
        materials: this.meeting.materials?.join('\n') || '',
        minutes: this.meeting.minutes || '',
        decisions: this.meeting.decisions.join('\n'),
        notes: this.meeting.notes || ''
      });
    }
  }

  updateAttendeeStatus(index: number, event: any): void {
    this.attendees[index] = {
      ...this.attendees[index],
      status: event.target.value
    };
  }

  updateAttendeeNotes(index: number, event: any): void {
    this.attendees[index] = {
      ...this.attendees[index],
      notes: event.target.value
    };
  }

  updateActionItem(index: number, field: string, event: any): void {
    this.actionItems[index] = {
      ...this.actionItems[index],
      [field]: event.target.value
    };
  }

  addActionItem(): void {
    this.actionItems.push({
      id: crypto.randomUUID(),
      task: '',
      assignedTo: '',
      dueDate: '',
      status: 'Pending',
      meetingId: this.meeting.id
    });
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;

      // Convert agenda, materials, and decisions from text to arrays
      const agenda = formValue.agenda
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const materials = formValue.materials
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const decisions = formValue.decisions
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const result = {
        meeting: {
          ...this.meeting,
          ...formValue,
          agenda,
          materials,
          decisions,
          attendees: this.attendees,
          actionItems: this.actionItems
        }
      };

      this.activeModal.close(result);
    }
  }
}
