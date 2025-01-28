import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting } from '../../compliance.types';

interface MeetingDocument {
  id: string;
  type: string;
  title: string;
  description?: string;
  version: string;
  author: string;
  uploadDate: string;
  size: number;
  tags: string[];
  path: string;
  meetingId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

@Component({
  selector: 'app-share-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Share Document</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="shareForm" (ngSubmit)="onSubmit()">
      <div class="modal-body p-3">
        <div class="row g-3">
          <!-- Document Info -->
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="small fw-medium">{{document.title}}</span>
                      <small class="text-muted d-block">{{document.type}} - Version {{document.version}}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" (click)="onPreview()">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Settings -->
          <div class="col-12">
            <div class="card">
              <div class="card-body p-2">
                <!-- Share Type -->
                <div class="mb-3">
                  <label class="form-label small">Share Type</label>
                  <div class="btn-group w-100">
                    <input type="radio" class="btn-check" formControlName="shareType" value="internal" id="internal">
                    <label class="btn btn-sm btn-outline-primary" for="internal">
                      <i class="bi bi-people me-1"></i>Internal Users
                    </label>
                    <input type="radio" class="btn-check" formControlName="shareType" value="external" id="external">
                    <label class="btn btn-sm btn-outline-primary" for="external">
                      <i class="bi bi-envelope me-1"></i>External Email
                    </label>
                  </div>
                </div>

                <!-- Internal Users -->
                <div class="mb-3" *ngIf="shareForm.get('shareType')?.value === 'internal'">
                  <label class="form-label small">Select Users</label>
                  <div class="list-group">
                    <div class="list-group-item p-2" *ngFor="let user of users">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-2">
                          <div class="form-check mb-0">
                            <input class="form-check-input" type="checkbox" 
                                   [id]="'user-' + user.id"
                                   [value]="user.id"
                                   (change)="onUserSelect($event, user)">
                          </div>
                          <div>
                            <span class="small">{{user.name}}</span>
                            <small class="text-muted d-block">{{user.role}}</small>
                          </div>
                        </div>
                        <select class="form-select form-select-sm" style="width: auto;"
                                [disabled]="!isUserSelected(user.id)"
                                (change)="onPermissionChange($event, user.id)">
                          <option value="view">View Only</option>
                          <option value="comment">Can Comment</option>
                          <option value="edit">Can Edit</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- External Email -->
                <div class="mb-3" *ngIf="shareForm.get('shareType')?.value === 'external'">
                  <label class="form-label small">Email Addresses</label>
                  <textarea class="form-control form-control-sm" 
                           rows="2"
                           placeholder="Enter email addresses (one per line)"
                           formControlName="emails">
                  </textarea>
                  <small class="text-muted">Recipients will receive a secure link to access the document</small>
                </div>

                <!-- Message -->
                <div class="mb-3">
                  <label class="form-label small">Message (Optional)</label>
                  <textarea class="form-control form-control-sm" 
                           rows="2"
                           placeholder="Add a message to the recipients"
                           formControlName="message">
                  </textarea>
                </div>

                <!-- Expiration -->
                <div class="mb-3">
                  <label class="form-label small">Access Expiration</label>
                  <select class="form-select form-select-sm" formControlName="expiration">
                    <option value="never">Never</option>
                    <option value="1day">1 Day</option>
                    <option value="1week">1 Week</option>
                    <option value="1month">1 Month</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>

                <!-- Custom Expiration Date -->
                <div class="mb-3" *ngIf="shareForm.get('expiration')?.value === 'custom'">
                  <input type="date" class="form-control form-control-sm"
                         formControlName="customExpiration"
                         [min]="minExpirationDate">
                </div>

                <!-- Notification Settings -->
                <div class="mb-0">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           id="notifyOnAccess"
                           formControlName="notifyOnAccess">
                    <label class="form-check-label small" for="notifyOnAccess">
                      Notify me when recipients access the document
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!isValid()">
          Share Document
        </button>
      </div>
    </form>
  `
})
export class ShareDocumentModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  shareForm: FormGroup;
  selectedUsers: { [key: string]: string } = {}; // userId: permission
  minExpirationDate = new Date().toISOString().split('T')[0];

  // Simulated users - in a real app, this would come from a service
  users: User[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'Committee Member', department: 'Finance' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'Board Member', department: 'Executive' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'External Auditor' }
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.shareForm = this.fb.group({
      shareType: ['internal', Validators.required],
      emails: [''],
      message: [''],
      expiration: ['never'],
      customExpiration: [''],
      notifyOnAccess: [false]
    });

    // Add validation for emails when shareType is external
    this.shareForm.get('shareType')?.valueChanges.subscribe(value => {
      const emailsControl = this.shareForm.get('emails');
      if (value === 'external') {
        emailsControl?.setValidators([Validators.required]);
      } else {
        emailsControl?.clearValidators();
      }
      emailsControl?.updateValueAndValidity();
    });

    // Add validation for customExpiration when expiration is custom
    this.shareForm.get('expiration')?.valueChanges.subscribe(value => {
      const customExpirationControl = this.shareForm.get('customExpiration');
      if (value === 'custom') {
        customExpirationControl?.setValidators([Validators.required]);
      } else {
        customExpirationControl?.clearValidators();
      }
      customExpirationControl?.updateValueAndValidity();
    });
  }

  onUserSelect(event: any, user: User): void {
    if (event.target.checked) {
      this.selectedUsers[user.id] = 'view';
    } else {
      delete this.selectedUsers[user.id];
    }
  }

  isUserSelected(userId: string): boolean {
    return userId in this.selectedUsers;
  }

  onPermissionChange(event: any, userId: string): void {
    this.selectedUsers[userId] = event.target.value;
  }

  onPreview(): void {
    // In a real app, this would open the preview modal
    console.log('Previewing document:', this.document.path);
  }

  isValid(): boolean {
    if (!this.shareForm.valid) return false;

    if (this.shareForm.get('shareType')?.value === 'internal') {
      return Object.keys(this.selectedUsers).length > 0;
    }

    return true;
  }

  onSubmit(): void {
    if (this.isValid()) {
      const formValue = this.shareForm.value;

      let recipients: any[] = [];
      if (formValue.shareType === 'internal') {
        recipients = Object.entries(this.selectedUsers).map(([userId, permission]) => {
          const user = this.users.find(u => u.id === userId);
          return {
            userId,
            name: user?.name,
            email: user?.email,
            permission
          };
        });
      } else {
        recipients = formValue.emails
          .split('\n')
          .map((email: string) => email.trim())
          .filter((email: string) => email.length > 0)
          .map((email: string) => ({
            email,
            permission: 'view'
          }));
      }

      const result = {
        document: this.document,
        share: {
          ...formValue,
          recipients
        }
      };

      this.activeModal.close(result);
    }
  }
}
