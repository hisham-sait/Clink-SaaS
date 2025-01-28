import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Committee, CommitteeMember, CommitteeMeeting } from '../../compliance.types';

@Component({
  selector: 'app-view-committee-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Committee Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">{{committee.title}}</h6>
              <small class="text-muted">{{committee.type}} Committee</small>
            </div>
            <span [class]="'badge ' + getStatusClass(committee.status)">{{committee.status}}</span>
          </div>
          <p class="text-muted small mb-0">{{committee.description}}</p>
        </div>

        <!-- Members -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Committee Members</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let member of committee.members">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <div>
                        <span class="small fw-medium">{{member.name}}</span>
                        <small class="text-muted d-block">{{member.role}}</small>
                      </div>
                    </div>
                    <span [class]="'badge ' + getStatusClass(member.status)">{{member.status}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charter -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Committee Charter</small>
              <p class="small mb-0" style="white-space: pre-wrap;">{{committee.charter}}</p>
            </div>
          </div>
        </div>

        <!-- Responsibilities -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Responsibilities</small>
              <ul class="list-unstyled mb-0">
                <li class="small" *ngFor="let responsibility of committee.responsibilities">
                  <i class="bi bi-check2 text-success me-2"></i>{{responsibility}}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Meeting History -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Recent Meetings</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let meeting of committee.meetings">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-calendar-event text-primary"></i>
                      <span class="small fw-medium">{{meeting.date | date:'mediumDate'}}</span>
                    </div>
                    <span [class]="'badge ' + getMeetingStatusClass(meeting.status)">{{meeting.status}}</span>
                  </div>
                  <div class="small mb-2">
                    <span class="text-muted">Attendees:</span>
                    <span class="ms-1">{{meeting.attendees.join(', ')}}</span>
                  </div>
                  <div class="small mb-2" *ngIf="meeting.decisions?.length">
                    <span class="text-muted">Key Decisions:</span>
                    <ul class="list-unstyled mb-0 mt-1">
                      <li *ngFor="let decision of meeting.decisions">
                        <i class="bi bi-arrow-right-short"></i> {{decision}}
                      </li>
                    </ul>
                  </div>
                  <div class="small" *ngIf="meeting.actionItems?.length">
                    <span class="text-muted">Action Items:</span>
                    <ul class="list-unstyled mb-0 mt-1">
                      <li *ngFor="let item of meeting.actionItems">
                        <i [class]="getActionItemIcon(item.status)"></i>
                        {{item.task}} - <span class="text-muted">{{item.assignedTo}}</span>
                      </li>
                    </ul>
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
export class ViewCommitteeModalComponent {
  @Input() committee!: Committee;

  recentActivities = [
    {
      type: 'meeting',
      description: 'Quarterly Meeting Scheduled',
      date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
    },
    {
      type: 'member',
      description: 'New Member Added: John Smith',
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
    },
    {
      type: 'charter',
      description: 'Charter Updated',
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
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

  getMeetingStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getActionItemIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Pending': 'bi bi-circle text-warning me-1',
      'In Progress': 'bi bi-play-circle text-primary me-1',
      'Completed': 'bi bi-check-circle text-success me-1'
    };
    return icons[status] || 'bi bi-circle text-secondary me-1';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'meeting': 'bi bi-calendar-check text-primary',
      'member': 'bi bi-person-plus text-success',
      'charter': 'bi bi-file-text text-info',
      'review': 'bi bi-eye text-warning',
      'document': 'bi bi-file-earmark-text text-secondary'
    };
    return icons[type] || 'bi bi-activity text-secondary';
  }
}
