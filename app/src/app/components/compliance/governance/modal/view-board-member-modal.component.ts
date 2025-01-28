import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMember } from '../../compliance.types';

@Component({
  selector: 'app-view-board-member-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Board Member Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">{{member.name}}</h6>
              <small class="text-muted">{{member.role}}</small>
            </div>
            <span [class]="'badge ' + getStatusClass(member.status)">{{member.status}}</span>
          </div>
        </div>

        <!-- Expertise -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Areas of Expertise</small>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-secondary" *ngFor="let skill of member.expertise">{{skill}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="row g-2">
                <div class="col-md-6">
                  <small class="text-muted d-block">Appointment Date</small>
                  <span class="small">{{member.appointmentDate | date:'mediumDate'}}</span>
                </div>
                <div class="col-md-6" *ngIf="member.endDate">
                  <small class="text-muted d-block">End Date</small>
                  <span class="small">{{member.endDate | date:'mediumDate'}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Committee Details -->
        <div class="col-12" *ngIf="member.committeeId">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Committee Assignment</small>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-diagram-3 text-secondary"></i>
                <span>{{getCommitteeName(member.committeeId)}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tenure -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Tenure</small>
              <div class="d-flex flex-column">
                <span class="fw-medium">{{calculateTenure()}} years</span>
                <small class="text-muted">{{getTenureDescription()}}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Meeting Attendance -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Meeting Attendance</small>
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex flex-column">
                  <span class="fw-medium">{{getAttendanceRate()}}%</span>
                  <small class="text-muted">Last 12 months</small>
                </div>
                <div class="progress" style="width: 100px; height: 6px;">
                  <div 
                    class="progress-bar" 
                    [class]="getAttendanceClass()"
                    [style.width.%]="getAttendanceRate()">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Recent Activity</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let activity of recentActivities">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i [class]="getActivityIcon(activity.type)"></i>
                      <span class="small">{{activity.description}}</span>
                    </div>
                    <small class="text-muted">{{activity.date | date:'shortDate'}}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class ViewBoardMemberModalComponent {
  @Input() member!: CommitteeMember;

  recentActivities = [
    {
      type: 'meeting',
      description: 'Attended Board Meeting',
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
    },
    {
      type: 'review',
      description: 'Reviewed Q2 Financial Report',
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    },
    {
      type: 'committee',
      description: 'Chaired Audit Committee Meeting',
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
    }
  ];

  constructor(public activeModal: NgbActiveModal) {}

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'bg-success',
      'Inactive': 'bg-secondary',
      'Pending': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  getCommitteeName(committeeId: string): string {
    const committees: { [key: string]: string } = {
      '1': 'Audit Committee',
      '2': 'Risk Committee',
      '3': 'Nomination Committee',
      '4': 'Remuneration Committee'
    };
    return committees[committeeId] || 'Unknown Committee';
  }

  calculateTenure(): number {
    const start = new Date(this.member.appointmentDate);
    const end = this.member.endDate ? new Date(this.member.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(years * 10) / 10; // Round to 1 decimal place
  }

  getTenureDescription(): string {
    const tenure = this.calculateTenure();
    if (tenure < 1) return 'New Board Member';
    if (tenure < 3) return 'Early Tenure';
    if (tenure < 6) return 'Mid Tenure';
    return 'Long-serving Member';
  }

  getAttendanceRate(): number {
    // Simulated attendance rate
    return 92;
  }

  getAttendanceClass(): string {
    const rate = this.getAttendanceRate();
    if (rate >= 90) return 'bg-success';
    if (rate >= 75) return 'bg-warning';
    return 'bg-danger';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'meeting': 'bi bi-calendar-check text-primary',
      'review': 'bi bi-file-text text-info',
      'committee': 'bi bi-people text-success',
      'training': 'bi bi-mortarboard text-warning',
      'document': 'bi bi-file-earmark-text text-secondary'
    };
    return icons[type] || 'bi bi-activity text-secondary';
  }
}
