import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting, CommitteeActionItem } from '../../compliance.types';

@Component({
  selector: 'app-add-minutes-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Add Meeting Minutes</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="minutesForm" (ngSubmit)="onSubmit()">
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

          <!-- Minutes -->
          <div class="col-12">
            <label class="form-label small">Meeting Minutes</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="6" 
              placeholder="Enter detailed meeting minutes" 
              formControlName="minutes">
            </textarea>
            <div class="invalid-feedback" [class.d-block]="minutesForm.get('minutes')?.touched && minutesForm.get('minutes')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Decisions -->
          <div class="col-12">
            <label class="form-label small">Key Decisions</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="3" 
              placeholder="Enter key decisions (one per line)" 
              formControlName="decisions">
            </textarea>
            <div class="invalid-feedback" [class.d-block]="minutesForm.get('decisions')?.touched && minutesForm.get('decisions')?.errors?.['required']">
              Required
            </div>
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
                    <button type="button" class="btn btn-link btn-sm text-danger px-0 mt-1" 
                            (click)="removeActionItem(i)">
                      <i class="bi bi-trash me-1"></i>Remove
                    </button>
                  </div>
                </div>
                <button type="button" class="btn btn-link btn-sm px-0 mt-2" (click)="addActionItem()">
                  <i class="bi bi-plus-circle me-1"></i>Add Action Item
                </button>
              </div>
            </div>
          </div>

          <!-- Attachments -->
          <div class="col-12">
            <label class="form-label small">Attachments</label>
            <textarea 
              class="form-control form-control-sm" 
              rows="2" 
              placeholder="List any attachments (one per line)" 
              formControlName="attachments">
            </textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!minutesForm.valid || !isValid()">
          Save Minutes
        </button>
      </div>
    </form>
  `
})
export class AddMinutesModalComponent {
  @Input() meeting!: CommitteeMeeting;

  minutesForm: FormGroup;
  actionItems: CommitteeActionItem[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.minutesForm = this.fb.group({
      minutes: ['', Validators.required],
      decisions: ['', Validators.required],
      attachments: ['']
    });
  }

  ngOnInit(): void {
    if (this.meeting) {
      this.actionItems = [...this.meeting.actionItems];

      this.minutesForm.patchValue({
        minutes: this.meeting.minutes || '',
        decisions: this.meeting.decisions.join('\n'),
        attachments: this.meeting.attachments?.join('\n') || ''
      });
    }
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

  removeActionItem(index: number): void {
    this.actionItems.splice(index, 1);
  }

  isValid(): boolean {
    return this.actionItems.every(item => 
      item.task && item.assignedTo && item.dueDate
    );
  }

  onSubmit(): void {
    if (this.minutesForm.valid && this.isValid()) {
      const formValue = this.minutesForm.value;

      // Convert decisions and attachments from text to arrays
      const decisions = formValue.decisions
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const attachments = formValue.attachments
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const result = {
        meeting: {
          ...this.meeting,
          minutes: formValue.minutes,
          decisions,
          attachments,
          actionItems: this.actionItems,
          status: 'Completed'
        }
      };

      this.activeModal.close(result);
    }
  }
}
