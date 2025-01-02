import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

interface Shareholder {
  shareholderType: 'individual' | 'corporate';
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  companyNumber?: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  shareClass: string;
  sharesHeld: number;
  nominalValue: number;
  acquisitionDate: string;
  status: 'active' | 'transferred' | 'deceased';
}

@Component({
  selector: 'app-create-shareholder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, NgbDropdownModule],
  templateUrl: './create-shareholder-modal.component.html',
  styleUrls: ['./create-shareholder-modal.component.scss']
})
export class CreateShareholderModalComponent implements OnInit {
  shareholderForm!: FormGroup;
  shareholderType: 'individual' | 'corporate' = 'individual';

  titles = [
    'Mr',
    'Mrs',
    'Ms',
    'Miss',
    'Dr',
    'Prof'
  ];

  shareClasses = [
    'Ordinary',
    'Preference',
    'Deferred'
  ];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Set default acquisition date to today
    this.shareholderForm.patchValue({
      acquisitionDate: new Date().toISOString().split('T')[0]
    });
  }

  private initializeForm(): void {
    this.shareholderForm = this.fb.group({
      shareholderType: ['individual', Validators.required],
      // Individual fields
      title: [''],
      firstName: [''],
      lastName: [''],
      dateOfBirth: [''],
      // Corporate fields
      companyNumber: [''],
      // Common fields
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      shareClass: ['Ordinary', Validators.required],
      sharesHeld: ['', [Validators.required, Validators.min(1)]],
      nominalValue: ['', [Validators.required, Validators.min(0.01)]],
      acquisitionDate: ['', Validators.required],
      status: ['active', Validators.required]
    });

    // Update validators based on shareholder type
    this.shareholderForm.get('shareholderType')?.valueChanges.subscribe(type => {
      this.shareholderType = type;
      if (type === 'individual') {
        this.shareholderForm.get('title')?.setValidators([Validators.required]);
        this.shareholderForm.get('firstName')?.setValidators([Validators.required]);
        this.shareholderForm.get('lastName')?.setValidators([Validators.required]);
        this.shareholderForm.get('dateOfBirth')?.setValidators([Validators.required]);
        this.shareholderForm.get('companyNumber')?.clearValidators();
      } else {
        this.shareholderForm.get('title')?.clearValidators();
        this.shareholderForm.get('firstName')?.clearValidators();
        this.shareholderForm.get('lastName')?.clearValidators();
        this.shareholderForm.get('dateOfBirth')?.clearValidators();
        this.shareholderForm.get('companyNumber')?.setValidators([Validators.required]);
      }
      
      // Update validation status
      ['title', 'firstName', 'lastName', 'dateOfBirth', 'companyNumber'].forEach(field => {
        this.shareholderForm.get(field)?.updateValueAndValidity();
      });
    });
  }

  onSubmit(): void {
    if (this.shareholderForm.valid) {
      const formValue = this.shareholderForm.value;
      const newShareholder: Shareholder = {
        ...formValue,
        // Convert numeric strings to numbers
        sharesHeld: Number(formValue.sharesHeld),
        nominalValue: Number(formValue.nominalValue)
      };
      this.activeModal.close(newShareholder);
    } else {
      Object.keys(this.shareholderForm.controls).forEach(key => {
        const control = this.shareholderForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
