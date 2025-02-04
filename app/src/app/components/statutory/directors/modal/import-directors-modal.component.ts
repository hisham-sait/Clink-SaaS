import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DirectorService } from '../../../../services/statutory/director.service';
import { Director } from '../../statutory.types';

@Component({
  selector: 'app-import-directors-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Directors</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import directors, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your director data following the template format</li>
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
                <th>Title</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Director Type</th>
                <th>Appointment Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ item.title }}</td>
                <td>{{ item.firstName }}</td>
                <td>{{ item.lastName }}</td>
                <td>{{ item.directorType }}</td>
                <td>{{ formatDate(item.appointmentDate) }}</td>
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
export class ImportDirectorsModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<Director>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private directorService: DirectorService
  ) {}

  ngOnInit(): void {}

  downloadSampleFile(event: Event): void {
    event.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        nationality: 'British',
        address: '123 Main St, London, UK',
        appointmentDate: '2025-01-01',
        resignationDate: '',
        directorType: 'Executive Director',
        occupation: 'Business Executive',
        otherDirectorships: 'Company A Ltd, Company B Ltd',
        shareholding: '1000 Ordinary Shares',
        status: 'Active'
      }
    ];

    // Create CSV content with all fields
    const headers = [
      'Title',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Nationality',
      'Address',
      'Appointment Date',
      'Resignation Date',
      'Director Type',
      'Occupation',
      'Other Directorships',
      'Shareholding',
      'Status'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.title,
        item.firstName,
        item.lastName,
        item.dateOfBirth,
        item.nationality,
        item.address,
        item.appointmentDate,
        item.resignationDate,
        item.directorType,
        item.occupation,
        item.otherDirectorships,
        item.shareholding,
        item.status
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directors_template.csv';
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
    this.directorService.previewImport(this.companyId, formData)
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
      .subscribe((result: { data: Partial<Director>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing directors...';
    this.error = null;

    // Proceed with the actual import
    this.directorService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import directors. Please try again.';
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
