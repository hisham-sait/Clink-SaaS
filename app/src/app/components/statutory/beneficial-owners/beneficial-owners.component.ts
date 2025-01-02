import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface BeneficialOwner {
  name: string;
  nationality: string;
  dateOfBirth: string;
  address: string;
  ownershipPercentage: number;
  natureOfControl: string;
  startDate: string;
  endDate?: string;
  notificationDate: string;
  pscRegisterNumber: string;
}

@Component({
  selector: 'app-beneficial-owners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './beneficial-owners.component.html',
  styleUrls: ['./beneficial-owners.component.scss']
})
export class BeneficialOwnersComponent {
  ownerForm: FormGroup;
  owners: BeneficialOwner[] = [];

  controlTypes = [
    'Shares ownership',
    'Voting rights',
    'Right to appoint/remove directors',
    'Significant influence or control',
    'Trust or firm control'
  ];

  constructor(private fb: FormBuilder) {
    this.ownerForm = this.fb.group({
      name: ['', Validators.required],
      nationality: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      ownershipPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      natureOfControl: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      notificationDate: ['', Validators.required],
      pscRegisterNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedOwners = localStorage.getItem('beneficialOwners');
    if (savedOwners) {
      this.owners = JSON.parse(savedOwners);
    }
  }

  onSubmit(): void {
    if (this.ownerForm.valid) {
      this.owners.push(this.ownerForm.value);
      this.ownerForm.reset();
      localStorage.setItem('beneficialOwners', JSON.stringify(this.owners));
    }
  }

  removeOwner(index: number): void {
    this.owners.splice(index, 1);
    localStorage.setItem('beneficialOwners', JSON.stringify(this.owners));
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }
}
