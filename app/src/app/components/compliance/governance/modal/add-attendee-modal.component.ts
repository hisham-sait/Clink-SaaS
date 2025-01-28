import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting, CommitteeMember, CommitteeMeetingAttendee } from '../../compliance.types';

@Component({
  selector: 'app-add-attendee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Update Meeting Attendance</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Meeting Info -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-content-between align-items-start">
                  <span class="small fw-medium">{{meeting.type}} Meeting</span>
                  <span [class]="'badge ' + getStatusClass(meeting.status)">{{meeting.status}}</span>
                </div>
                <small class="text-muted">{{meeting.date | date:'mediumDate'}} at {{meeting.time}}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendees -->
        <div class="col-12">
          <div class="card">
            <div class="card-body p-2">
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let member of committeeMembers">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <div>
                        <span class="small">{{member.name}}</span>
                        <small class="text-muted d-block">{{member.role}}</small>
                      </div>
                    </div>
                    <select class="form-select form-select-sm" style="width: auto;" 
                            [name]="'status-' + member.id"
                            [(ngModel)]="attendanceStatus[member.id]"
                            (change)="updateAttendance(member)">
                      <option value="">Select Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                  <input type="text" class="form-control form-control-sm" 
                         [name]="'notes-' + member.id"
                         placeholder="Notes (optional)"
                         [(ngModel)]="attendanceNotes[member.id]"
                         (input)="updateNotes(member)">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Total Members</small>
                <span class="small">{{committeeMembers.length}}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Present</small>
                <span class="small">{{getPresentCount()}}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Quorum Required</small>
                <span class="small">{{getQuorumRequired()}}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Quorum Status</small>
                <span [class]="'badge ' + getQuorumStatusClass()">{{getQuorumStatus()}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary btn-sm" (click)="onSubmit()" [disabled]="!isValid()">
        Update Attendance
      </button>
    </div>
  `
})
export class AddAttendeeModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() committeeMembers!: CommitteeMember[];

  attendanceStatus: { [key: string]: string } = {};
  attendanceNotes: { [key: string]: string } = {};
  attendees: CommitteeMeetingAttendee[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    // Initialize status and notes from existing attendees
    this.meeting.attendees.forEach(attendee => {
      this.attendanceStatus[attendee.id] = attendee.status;
      this.attendanceNotes[attendee.id] = attendee.notes || '';
    });

    // Initialize empty status for members not yet marked
    this.committeeMembers.forEach(member => {
      if (!this.attendanceStatus[member.id]) {
        this.attendanceStatus[member.id] = '';
      }
    });

    this.attendees = [...this.meeting.attendees];
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  updateAttendance(member: CommitteeMember): void {
    const status = this.attendanceStatus[member.id];
    const existingIndex = this.attendees.findIndex(a => a.id === member.id);

    if (status) {
      const attendee: CommitteeMeetingAttendee = {
        id: member.id,
        name: member.name,
        role: member.role,
        status: status as 'Present' | 'Absent' | 'Late' | 'Excused',
        notes: this.attendanceNotes[member.id],
        meetingId: this.meeting.id
      };

      if (existingIndex >= 0) {
        this.attendees[existingIndex] = attendee;
      } else {
        this.attendees.push(attendee);
      }
    } else if (existingIndex >= 0) {
      this.attendees.splice(existingIndex, 1);
    }
  }

  updateNotes(member: CommitteeMember): void {
    const existingIndex = this.attendees.findIndex(a => a.id === member.id);
    if (existingIndex >= 0) {
      this.attendees[existingIndex] = {
        ...this.attendees[existingIndex],
        notes: this.attendanceNotes[member.id]
      };
    }
  }

  getPresentCount(): number {
    return this.attendees.filter(a => a.status === 'Present').length;
  }

  getQuorumRequired(): number {
    return Math.ceil(this.committeeMembers.length / 2);
  }

  getQuorumStatus(): string {
    return this.getPresentCount() >= this.getQuorumRequired() ? 'Quorum Met' : 'No Quorum';
  }

  getQuorumStatusClass(): string {
    return this.getPresentCount() >= this.getQuorumRequired() ? 'bg-success' : 'bg-danger';
  }

  isValid(): boolean {
    return this.committeeMembers.every(member => this.attendanceStatus[member.id]);
  }

  onSubmit(): void {
    if (this.isValid()) {
      const result = {
        meeting: {
          ...this.meeting,
          attendees: this.attendees
        }
      };
      this.activeModal.close(result);
    }
  }
}
