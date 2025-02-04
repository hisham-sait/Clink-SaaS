import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AllotmentService } from '../../../../services/statutory/allotment.service';
import { Allotment } from '../../statutory.types';

@Component({
  selector: 'app-import-allotments-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Allotments</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import allotments, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your allotment data following the template format</li>
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
                <th>Share Class</th>
                <th>Number of Shares</th>
                <th>Price per Share</th>
                <th>Allottee</th>
                <th>Allotment Date</th>
                <th>Payment Status</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ item.shareClass }}</td>
                <td>{{ item.numberOfShares }}</td>
                <td>{{ item.currency }} {{ item.pricePerShare }}</td>
                <td>{{ item.allottee }}</td>
                <td>{{ formatDate(item.allotmentDate) }}</td>
                <td>{{ item.paymentStatus }}</td>
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
export class ImportAllotmentsModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<Allotment>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private allotmentService: AllotmentService
  ) {}

  ngOnInit(): void {}

  downloadSampleFile(event: Event): void {
    event.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        allotmentDate: '2025-01-01',
        shareClass: 'Ordinary',
        numberOfShares: 1000,
        pricePerShare: 1.00,
        currency: 'GBP',
        allottee: 'John Doe',
        paymentStatus: 'Paid',
        amountPaid: 1000.00,
        paymentDate: '2025-01-01',
        certificateNumber: 'CERT001',
        status: 'Active',
        notes: 'Initial allotment of ordinary shares'
      },
      {
        allotmentDate: '2025-01-01',
        shareClass: 'Preferential',
        numberOfShares: 500,
        pricePerShare: 1.50,
        currency: 'GBP',
        allottee: 'Jane Smith',
        paymentStatus: 'Partially Paid',
        amountPaid: 500.00,
        paymentDate: '2025-01-01',
        certificateNumber: 'CERT002',
        status: 'Active',
        notes: 'Preferential shares allotment'
      }
    ];

    // Create CSV content with all fields
    const headers = [
      'Allotment Date',
      'Share Class',
      'Number of Shares',
      'Price per Share',
      'Currency',
      'Allottee',
      'Payment Status',
      'Amount Paid',
      'Payment Date',
      'Certificate Number',
      'Status',
      'Notes'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.allotmentDate,
        item.shareClass,
        item.numberOfShares,
        item.pricePerShare,
        item.currency,
        item.allottee,
        item.paymentStatus,
        item.amountPaid,
        item.paymentDate,
        item.certificateNumber,
        item.status,
        item.notes
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'allotments_template.csv';
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
    this.allotmentService.previewImport(this.companyId, formData)
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
      .subscribe((result: { data: Partial<Allotment>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing allotments...';
    this.error = null;

    // Proceed with the actual import
    this.allotmentService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import allotments. Please try again.';
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
