import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ChargeService } from '../../../../services/statutory/charge.service';
import { Charge } from '../../statutory.types';

@Component({
  selector: 'app-import-charges-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Import Charges</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Step 1: Initial State -->
      <div *ngIf="currentStep === 1">
        <p class="mb-4">
          To import charges, please follow these steps:
        </p>
        <ol class="mb-4">
          <li>
            <a href="#" class="text-primary" (click)="downloadSampleFile($event)">
              Download the sample file template
              <i class="bi bi-download ms-1"></i>
            </a>
          </li>
          <li>Fill in your charge data following the template format</li>
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
                <th>Charge Type</th>
                <th>Date Created</th>
                <th>Amount</th>
                <th>Chargor</th>
                <th>Chargee</th>
                <th>Property Charged</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of previewData.slice(0, 5)">
                <td>{{ item.chargeType }}</td>
                <td>{{ formatDate(item.dateCreated) }}</td>
                <td>{{ item.currency }} {{ item.amount }}</td>
                <td>{{ item.chargor }}</td>
                <td>{{ item.chargee }}</td>
                <td>{{ item.propertyCharged }}</td>
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
export class ImportChargesModalComponent implements OnInit {
  currentStep = 1;
  loading = false;
  loadingMessage = '';
  error: string | null = null;
  previewData: Partial<Charge>[] = [];
  companyId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private chargeService: ChargeService
  ) {}

  ngOnInit(): void {}

  downloadSampleFile(event: Event): void {
    event.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        chargeType: 'Fixed Charge',
        dateCreated: '2025-01-01',
        amount: 100000,
        currency: 'GBP',
        chargor: 'Company Name Ltd',
        chargee: 'Bank Name Plc',
        description: 'Fixed charge over company assets',
        propertyCharged: 'Office equipment and machinery',
        registrationDate: '2025-01-01',
        status: 'Active',
        satisfactionDate: ''
      },
      {
        chargeType: 'Floating Charge',
        dateCreated: '2025-01-01',
        amount: 250000,
        currency: 'GBP',
        chargor: 'Company Name Ltd',
        chargee: 'Bank Name Plc',
        description: 'Floating charge over all assets',
        propertyCharged: 'All present and future assets',
        registrationDate: '2025-01-01',
        status: 'Satisfied',
        satisfactionDate: '2025-06-01'
      }
    ];

    // Create CSV content with all fields
    const headers = [
      'Charge Type',
      'Date Created',
      'Amount',
      'Currency',
      'Chargor',
      'Chargee',
      'Description',
      'Property Charged',
      'Registration Date',
      'Status',
      'Satisfaction Date'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.chargeType,
        item.dateCreated,
        item.amount,
        item.currency,
        item.chargor,
        item.chargee,
        item.description,
        item.propertyCharged,
        item.registrationDate,
        item.status,
        item.satisfactionDate
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'charges_template.csv';
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
    this.chargeService.previewImport(this.companyId, formData)
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
      .subscribe((result: { data: Partial<Charge>[] }) => {
        if (result.data.length > 0) {
          this.previewData = result.data;
          this.currentStep = 2;
        }
      });
  }

  confirmImport(): void {
    this.loading = true;
    this.loadingMessage = 'Importing charges...';
    this.error = null;

    // Proceed with the actual import
    this.chargeService.confirmImport(this.companyId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to import charges. Please try again.';
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
