import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BeneficialOwnerService } from '../../../../services/statutory/beneficial-owner.service';
import { BeneficialOwner } from '../../statutory.types';

@Component({
  selector: 'app-import-beneficial-owners-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Beneficial Owners</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import beneficial owners, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your beneficial owner data following the template format</li>
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
                <th>Nature of Control</th>
                <th>Ownership %</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ item.title }}</td>
                <td>{{ item.firstName }}</td>
                <td>{{ item.lastName }}</td>
                <td>{{ item.natureOfControl?.join(', ') }}</td>
                <td>{{ item.ownershipPercentage }}%</td>
                <td>{{ formatDate(item.registrationDate) }}</td>
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
export class ImportBeneficialOwnersModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<BeneficialOwner>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private beneficialOwnerService: BeneficialOwnerService
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
        email: 'john.doe@example.com',
        phone: '+44 1234 567890',
        natureOfControl: ['Shares', 'Voting Rights'],
        ownershipPercentage: 25,
        registrationDate: '2025-01-01',
        status: 'Active',
        description: 'Major shareholder with significant control'
      },
      {
        title: 'Mrs',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1982-06-15',
        nationality: 'British',
        address: '456 High St, London, UK',
        email: 'jane.smith@example.com',
        phone: '+44 1234 567891',
        natureOfControl: ['Board Appointment Rights'],
        ownershipPercentage: 15,
        registrationDate: '2025-01-01',
        status: 'Active',
        description: 'Board member with appointment rights'
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
      'Email',
      'Phone',
      'Nature of Control',
      'Ownership Percentage',
      'Registration Date',
      'Status',
      'Description'
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
        item.email,
        item.phone,
        item.natureOfControl.join(';'),
        item.ownershipPercentage,
        item.registrationDate,
        item.status,
        item.description
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beneficial_owners_template.csv';
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
    this.beneficialOwnerService.previewImport(this.companyId, formData)
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
      .subscribe((result: { data: Partial<BeneficialOwner>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing beneficial owners...';
    this.error = null;

    // Proceed with the actual import
    this.beneficialOwnerService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import beneficial owners. Please try again.';
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
