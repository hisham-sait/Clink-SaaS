import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MeetingService } from '../../../../services/statutory/meeting.service';
import { Meeting, Resolution } from '../../statutory.types';

@Component({
  selector: 'app-import-meetings-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Meetings</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import meetings, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your meeting data following the template format</li>
          <li>Upload your completed file</li>
        </ol>

        <div class="text-center">
          <button class="btn btn-primary" (click)="triggerFileInput()">
            <i class="bi bi-upload me-2"></i>
            Upload File
          </button>
          <input
            #fileInput
            type="file"
            class="d-none"
            accept=".csv,.xlsx,.xls"
            (change)="onFileSelected($event)"
          >
        </div>
      </div>

      <!-- Step 2: Preview Data -->
      <div *ngIf="currentStep === 2">
        <div class="alert alert-info mb-4">
          <i class="bi bi-info-circle me-2"></i>
          Preview of data to be imported
        </div>

        <div *ngIf="error" class="alert alert-danger mb-4">
          {{ error }}
        </div>

        <div class="mb-4">
          <h6>Total Records: {{ previewData.length }}</h6>
        </div>

        <div class="table-responsive mb-4">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>Type</th>
                <th>Meeting Date</th>
                <th>Venue</th>
                <th>Chairperson</th>
                <th>Attendees</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ item.meetingType }}</td>
                <td>{{ formatDate(item.meetingDate) }}</td>
                <td>{{ item.venue }}</td>
                <td>{{ item.chairperson }}</td>
                <td>{{ item.attendees?.join(', ') }}</td>
                <td>{{ item.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="previewData.length > 5" class="text-muted mb-4">
          Showing 5 of {{ previewData.length }} records
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 mb-0">{{ loadingMessage }}</p>
      </div>
    </div>

    <div class="modal-footer">
      <button 
        type="button" 
        class="btn btn-link" 
        (click)="activeModal.dismiss()"
      >Cancel</button>
      
      <button
        *ngIf="currentStep === 2"
        type="button"
        class="btn btn-primary"
        (click)="confirmImport()"
        [disabled]="loading"
      >
        <i class="bi bi-check2 me-2"></i>
        Confirm Import
      </button>
    </div>
  `
})
export class ImportMeetingsModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<Meeting>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private meetingService: MeetingService
  ) {}

  ngOnInit(): void {}

  downloadSampleFile(event: Event): void {
    event.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        meetingType: 'AGM',
        meetingDate: '2025-01-01',
        startTime: '10:00',
        endTime: '11:30',
        venue: 'Company Head Office',
        chairperson: 'John Smith',
        attendees: 'John Smith, Jane Doe, Robert Brown',
        agenda: 'Annual Review, Financial Statements, Director Appointments',
        resolutions: JSON.stringify([{
          title: 'Financial Statements',
          type: 'Ordinary',
          description: 'Approval of Annual Financial Statements',
          outcome: 'Passed',
          proposedBy: 'John Smith',
          secondedBy: 'Jane Doe'
        }, {
          title: 'Director Appointment',
          type: 'Ordinary',
          description: 'Appointment of New Director',
          outcome: 'Passed',
          proposedBy: 'Robert Brown',
          secondedBy: 'John Smith'
        }]),
        quorumRequired: 5,
        quorumPresent: 7,
        quorumAchieved: true,
        minutes: 'The Annual General Meeting commenced at 10:00 AM...',
        status: 'Draft',
        attachments: 'financial_statements.pdf, directors_report.pdf',
        notes: 'Next AGM scheduled for January 2026'
      }
    ];

    // Create CSV content with all fields
    const headers = [
      'Meeting Type',
      'Meeting Date',
      'Start Time',
      'End Time',
      'Venue',
      'Chairperson',
      'Attendees',
      'Agenda',
      'Resolutions',
      'Quorum Required',
      'Quorum Present',
      'Quorum Achieved',
      'Minutes',
      'Status',
      'Attachments',
      'Notes'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.meetingType,
        item.meetingDate,
        item.startTime,
        item.endTime,
        item.venue,
        item.chairperson,
        item.attendees,
        item.agenda,
        item.resolutions,
        item.quorumRequired,
        item.quorumPresent,
        item.quorumAchieved,
        item.minutes,
        item.status,
        item.attachments,
        item.notes
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meetings_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput instanceof HTMLInputElement) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.loading = true;
    this.loadingMessage = 'Analyzing file...';
    this.error = null;

    const formData = new FormData();
    formData.append('file', file);

    // First, preview the data
    this.meetingService.previewImport(this.companyId, formData)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to preview file. Please check the file format and try again.';
          return of({ data: [] });
        }),
        finalize(() => {
          this.loading = false;
          this.loadingMessage = '';
        })
      )
      .subscribe((result: { data: Partial<Meeting>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing meetings...';
    this.error = null;

    // Proceed with the actual import
    this.meetingService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import meetings. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.loadingMessage = '';
        })
      )
      .subscribe((result: { imported: number } | null) => {
        if (result) {
          this.activeModal.close(result);
        }
      });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  }
}
