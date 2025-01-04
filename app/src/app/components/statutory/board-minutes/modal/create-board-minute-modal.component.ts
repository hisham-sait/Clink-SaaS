import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BoardMinute, Discussion, Resolution, ActionItem } from '../../statutory.types';

@Component({
  selector: 'app-create-board-minute-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add New Board Meeting</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="minuteForm" class="row g-3">
        <!-- Basic Details -->
        <div class="col-md-6">
          <label class="form-label">Minute ID</label>
          <input type="text" class="form-control" formControlName="minuteId" placeholder="e.g., BM001">
        </div>
        <div class="col-md-6">
          <label class="form-label">Meeting Date</label>
          <input type="date" class="form-control" formControlName="meetingDate">
        </div>

        <!-- Time -->
        <div class="col-md-6">
          <label class="form-label">Start Time</label>
          <input type="time" class="form-control" formControlName="startTime">
        </div>
        <div class="col-md-6">
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

        <!-- Discussions -->
        <div class="col-12" formArrayName="discussions">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold mb-0">Discussions</h6>
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="addDiscussion()">
              <i class="bi bi-plus-lg me-1"></i>Add Discussion
            </button>
          </div>

          <div *ngFor="let discussion of getDiscussions().controls; let i = index" 
               [formGroupName]="i" class="card mb-3">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Topic</label>
                  <input type="text" class="form-control" formControlName="topic" 
                         placeholder="Discussion topic">
                </div>
                <div class="col-12">
                  <label class="form-label">Details</label>
                  <textarea class="form-control" formControlName="details" rows="2" 
                           placeholder="Discussion details"></textarea>
                </div>

                <!-- Decisions -->
                <div class="col-12" formArrayName="decisions">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0">Decisions</label>
                    <button type="button" class="btn btn-sm btn-outline-secondary" 
                            (click)="addDecision(discussion)">
                      <i class="bi bi-plus-lg me-1"></i>Add Decision
                    </button>
                  </div>
                  <div class="mb-2" *ngFor="let decision of getDecisions(discussion).controls; let j = index">
                    <div class="input-group">
                      <input type="text" class="form-control" [formControlName]="j" 
                             placeholder="Decision made">
                      <button class="btn btn-outline-danger" type="button" 
                              (click)="removeDecision(discussion, j)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Action Items -->
                <div class="col-12" formArrayName="actionItems">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0">Action Items</label>
                    <button type="button" class="btn btn-sm btn-outline-secondary" 
                            (click)="addActionItem(discussion)">
                      <i class="bi bi-plus-lg me-1"></i>Add Action Item
                    </button>
                  </div>
                  <div class="card mb-2" *ngFor="let action of getActionItems(discussion).controls; let k = index" 
                       [formGroupName]="k">
                    <div class="card-body">
                      <div class="row g-2">
                        <div class="col-12">
                          <label class="form-label">Task</label>
                          <input type="text" class="form-control" formControlName="task" 
                                 placeholder="Action item task">
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Assignee</label>
                          <input type="text" class="form-control" formControlName="assignee" 
                                 placeholder="Person responsible">
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Due Date</label>
                          <input type="date" class="form-control" formControlName="dueDate">
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Status</label>
                          <select class="form-select" formControlName="status">
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <button class="btn btn-sm btn-outline-danger mt-2" type="button" 
                              (click)="removeActionItem(discussion, k)">
                        <i class="bi bi-trash me-1"></i>Remove Action Item
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <button type="button" class="btn btn-sm btn-outline-danger" 
                          (click)="removeDiscussion(i)">
                    <i class="bi bi-trash me-1"></i>Remove Discussion
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                <div class="col-12">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" formControlName="title" 
                         placeholder="Resolution title">
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="2" 
                           placeholder="Resolution details"></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Proposed By</label>
                  <input type="text" class="form-control" formControlName="proposedBy" 
                         placeholder="Name of proposer">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Seconded By</label>
                  <input type="text" class="form-control" formControlName="secondedBy" 
                         placeholder="Name of seconder">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Outcome</label>
                  <select class="form-select" formControlName="outcome">
                    <option value="Passed">Passed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
                <div class="col-12">
                  <button type="button" class="btn btn-sm btn-outline-danger" 
                          (click)="removeResolution(i)">
                    <i class="bi bi-trash me-1"></i>Remove Resolution
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
                    placeholder="Detailed meeting minutes"></textarea>
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
      <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!minuteForm.valid">
        Add Meeting
      </button>
    </div>
  `
})
export class CreateBoardMinuteModalComponent {
  minuteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.minuteForm = this.fb.group({
      minuteId: ['', Validators.required],
      meetingDate: [new Date().toISOString().split('T')[0], Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      venue: ['', Validators.required],
      chairperson: ['', Validators.required],
      attendees: ['', Validators.required],
      agenda: ['', Validators.required],
      discussions: this.fb.array([]),
      resolutions: this.fb.array([]),
      minutes: ['', Validators.required],
      notes: [''],
      status: ['Draft', Validators.required]
    });

    // Add initial discussion and resolution
    this.addDiscussion();
    this.addResolution();
  }

  getDiscussions() {
    return this.minuteForm.get('discussions') as any;
  }

  addDiscussion() {
    const discussionForm = this.fb.group({
      topic: ['', Validators.required],
      details: ['', Validators.required],
      decisions: this.fb.array(['']),
      actionItems: this.fb.array([])
    });

    this.getDiscussions().push(discussionForm);
  }

  removeDiscussion(index: number) {
    this.getDiscussions().removeAt(index);
  }

  getDecisions(discussion: any) {
    return discussion.get('decisions') as any;
  }

  addDecision(discussion: any) {
    this.getDecisions(discussion).push(this.fb.control('', Validators.required));
  }

  removeDecision(discussion: any, index: number) {
    this.getDecisions(discussion).removeAt(index);
  }

  getActionItems(discussion: any) {
    return discussion.get('actionItems') as any;
  }

  addActionItem(discussion: any) {
    const actionItemForm = this.fb.group({
      task: ['', Validators.required],
      assignee: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['Pending', Validators.required]
    });

    this.getActionItems(discussion).push(actionItemForm);
  }

  removeActionItem(discussion: any, index: number) {
    this.getActionItems(discussion).removeAt(index);
  }

  getResolutions() {
    return this.minuteForm.get('resolutions') as any;
  }

  addResolution() {
    const resolutionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      proposedBy: ['', Validators.required],
      secondedBy: ['', Validators.required],
      outcome: ['Passed', Validators.required]
    });

    this.getResolutions().push(resolutionForm);
  }

  removeResolution(index: number) {
    this.getResolutions().removeAt(index);
  }

  onSubmit(): void {
    if (this.minuteForm.valid) {
      const formValue = this.minuteForm.value;
      
      // Convert attendees string to array
      formValue.attendees = formValue.attendees
        .split('\n')
        .map((a: string) => a.trim())
        .filter((a: string) => a);
      
      this.activeModal.close(formValue);
    } else {
      Object.keys(this.minuteForm.controls).forEach(key => {
        const control = this.minuteForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
