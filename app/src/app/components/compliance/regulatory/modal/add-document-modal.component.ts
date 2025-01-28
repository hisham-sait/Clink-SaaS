import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegulatoryRequirement } from './../../compliance.types';

@Component({
  selector: 'app-add-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add Document</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Requirement Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Requirement</label>
          <p class="mb-0">{{ requirement.title }}</p>
          <small class="text-muted">
            {{ requirement.authority }} | {{ requirement.jurisdiction }}
          </small>
        </div>

        <!-- Basic Information -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="title"
            placeholder="Enter document title"
          >
          <div class="form-text text-danger" *ngIf="documentForm.get('title')?.touched && documentForm.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="3" 
            formControlName="description"
            placeholder="Enter document description"
          ></textarea>
          <div class="form-text text-danger" *ngIf="documentForm.get('description')?.touched && documentForm.get('description')?.errors?.['required']">
            Description is required
          </div>
        </div>

        <!-- Document Details -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Type</label>
            <select class="form-select" formControlName="type">
              <option value="">Select Type</option>
              <option value="pdf">PDF</option>
              <option value="doc">Word Document</option>
              <option value="xls">Excel Spreadsheet</option>
              <option value="image">Image</option>
              <option value="other">Other</option>
            </select>
            <div class="form-text text-danger" *ngIf="documentForm.get('type')?.touched && documentForm.get('type')?.errors?.['required']">
              Type is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Version</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="version"
              placeholder="e.g., 1.0, 2.1"
            >
            <div class="form-text text-danger" *ngIf="documentForm.get('version')?.touched && documentForm.get('version')?.errors?.['required']">
              Version is required
            </div>
          </div>
        </div>

        <!-- Status and Author -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              <option value="">Select Status</option>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
            <div class="form-text text-danger" *ngIf="documentForm.get('status')?.touched && documentForm.get('status')?.errors?.['required']">
              Status is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Author</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="author"
              placeholder="Enter author name"
            >
            <div class="form-text text-danger" *ngIf="documentForm.get('author')?.touched && documentForm.get('author')?.errors?.['required']">
              Author is required
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Effective Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="effectiveDate"
            >
            <div class="form-text text-danger" *ngIf="documentForm.get('effectiveDate')?.touched && documentForm.get('effectiveDate')?.errors?.['required']">
              Effective date is required
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Expiry Date</label>
            <input 
              type="date" 
              class="form-control" 
              formControlName="expiryDate"
            >
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <label class="form-label">Tags</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="tags"
            placeholder="Enter tags separated by commas"
          >
          <small class="form-text text-muted">
            Example: compliance, policy, procedure
          </small>
        </div>

        <!-- File Upload -->
        <div class="mb-3">
          <label class="form-label">Document File</label>
          <div class="input-group">
            <input 
              type="file" 
              class="form-control" 
              (change)="onFileSelected($event)"
              [accept]="getAcceptedFileTypes()"
            >
          </div>
          <div class="form-text text-danger" *ngIf="!selectedFile && submitted">
            File is required
          </div>
          <small class="form-text text-muted">
            Maximum file size: 10MB
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!documentForm.valid || !selectedFile">
          Add Document
        </button>
      </div>
    </form>
  `
})
export class AddDocumentModalComponent {
  @Input() requirement!: RegulatoryRequirement;

  documentForm: FormGroup;
  selectedFile: File | null = null;
  submitted = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      version: ['1.0', Validators.required],
      status: ['Draft', Validators.required],
      author: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      expiryDate: [''],
      tags: [''],
      requirementId: [''] // Will be set from input requirement
    });
  }

  ngOnInit(): void {
    if (this.requirement) {
      this.documentForm.patchValue({
        requirementId: this.requirement.id
      });
    }
  }

  getAcceptedFileTypes(): string {
    const type = this.documentForm.get('type')?.value;
    const typeMap: { [key: string]: string } = {
      'pdf': '.pdf',
      'doc': '.doc,.docx',
      'xls': '.xls,.xlsx',
      'image': '.jpg,.jpeg,.png,.gif',
      'other': '*'
    };
    return typeMap[type] || '*';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file && file.size <= maxSize) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
      // Reset file input
      event.target.value = '';
      // You might want to show an error message here
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.documentForm.valid && this.selectedFile) {
      const formValue = this.documentForm.value;
      
      // Convert tags string to array
      const tags = formValue.tags ? 
        formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : 
        [];

      const result = {
        requirement: this.requirement,
        document: {
          ...formValue,
          tags,
          uploadDate: new Date().toISOString(),
          path: this.selectedFile.name // In a real app, this would be the server path
        },
        file: this.selectedFile
      };

      this.activeModal.close(result);
    }
  }
}
