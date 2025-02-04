import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BoardMinuteService } from '../../../../services/statutory/board-minute.service';
import { BoardMinute, Discussion, Resolution, ActionItem } from '../../statutory.types';

@Component({
  selector: 'app-import-board-minutes-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Board Minutes</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import board minutes, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your board minutes data following the template format</li>
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
                <th>Meeting Date</th>
                <th>Venue</th>
                <th>Chairperson</th>
                <th>Attendees</th>
                <th>Agenda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ formatDate(item.meetingDate) }}</td>
                <td>{{ item.venue }}</td>
                <td>{{ item.chairperson }}</td>
                <td>{{ item.attendees?.join(', ') }}</td>
                <td>{{ item.agenda }}</td>
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
export class ImportBoardMinutesModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<BoardMinute>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private boardMinuteService: BoardMinuteService
  ) {}

  ngOnInit(): void {}

  downloadSampleFile(event: Event): void {
    event.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        meetingDate: '2025-01-01',
        startTime: '10:00',
        endTime: '11:30',
        venue: 'Company Head Office',
        chairperson: 'John Smith',
        attendees: 'John Smith, Jane Doe, Robert Brown',
        agenda: 'Q1 Review, Strategy Discussion, Budget Approval',
        discussions: JSON.stringify([{
          topic: 'Q1 Performance Review',
          details: 'Discussed Q1 financial results and KPIs',
          decisions: ['Approved Q1 results', 'Set new targets for Q2'],
          actionItems: [{
            task: 'Prepare Q2 forecast',
            assignee: 'Jane Doe',
            dueDate: '2025-02-01',
            status: 'Pending'
          }]
        }, {
          topic: 'Strategy Discussion',
          details: 'Reviewed 5-year strategic plan',
          decisions: ['Approved market expansion plan'],
          actionItems: [{
            task: 'Create implementation roadmap',
            assignee: 'Robert Brown',
            dueDate: '2025-02-15',
            status: 'Pending'
          }]
        }]),
        resolutions: JSON.stringify([{
          title: 'Q1 Financial Results',
          type: 'Ordinary',
          description: 'Approval of Q1 2025 financial statements',
          outcome: 'Passed',
          proposedBy: 'John Smith',
          secondedBy: 'Jane Doe'
        }, {
          title: 'Strategic Plan',
          type: 'Special',
          description: 'Approval of 5-year strategic plan',
          outcome: 'Passed',
          proposedBy: 'Robert Brown',
          secondedBy: 'John Smith'
        }]),
        minutes: 'The meeting commenced at 10:00 AM with John Smith as chairperson...',
        status: 'Draft',
        attachments: 'financial_report.pdf, strategy_deck.pdf',
        notes: 'Next meeting scheduled for April 1st, 2025'
      }
    ];

    // Create CSV content with all fields
    const headers = [
      'Meeting Date',
      'Start Time',
      'End Time',
      'Venue',
      'Chairperson',
      'Attendees',
      'Agenda',
      'Discussions',
      'Resolutions',
      'Minutes',
      'Status',
      'Attachments',
      'Notes'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.meetingDate,
        item.startTime,
        item.endTime,
        item.venue,
        item.chairperson,
        item.attendees,
        item.agenda,
        item.discussions,
        item.resolutions,
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
    a.download = 'board_minutes_template.csv';
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
    this.boardMinuteService.previewImport(this.companyId, formData)
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
      .subscribe((result: { data: Partial<BoardMinute>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing board minutes...';
    this.error = null;

    // Proceed with the actual import
    this.boardMinuteService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import board minutes. Please try again.';
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
