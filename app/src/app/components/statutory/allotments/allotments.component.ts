import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Allotment {
  date: string;
  shareClass: string;
  numberOfShares: number;
  nominalValue: number;
  currency: string;
  issuePrice: number;
  allottee: string;
  paymentStatus: 'Paid' | 'Unpaid';
  certificateNumber: string;
  resolutionDate: string;
  resolutionNumber: string;
  returnFilingDate: string;
  returnNumber: string;
}

@Component({
  selector: 'app-allotments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './allotments.component.html',
  styleUrls: ['./allotments.component.scss']
})
export class AllotmentsComponent {
  allotmentForm: FormGroup;
  allotments: Allotment[] = [];

  shareClasses = [
    'Ordinary',
    'Preference',
    'Deferred',
    'Redeemable',
    'Non-voting'
  ];

  currencies = [
    'GBP',
    'EUR',
    'USD'
  ];

  constructor(private fb: FormBuilder) {
    this.allotmentForm = this.fb.group({
      date: ['', Validators.required],
      shareClass: ['', Validators.required],
      numberOfShares: ['', [Validators.required, Validators.min(1)]],
      nominalValue: ['', [Validators.required, Validators.min(0)]],
      currency: ['GBP', Validators.required],
      issuePrice: ['', [Validators.required, Validators.min(0)]],
      allottee: ['', Validators.required],
      paymentStatus: ['Unpaid', Validators.required],
      certificateNumber: ['', Validators.required],
      resolutionDate: ['', Validators.required],
      resolutionNumber: ['', Validators.required],
      returnFilingDate: ['', Validators.required],
      returnNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedAllotments = localStorage.getItem('allotments');
    if (savedAllotments) {
      this.allotments = JSON.parse(savedAllotments);
    }
  }

  onSubmit(): void {
    if (this.allotmentForm.valid) {
      this.allotments.push(this.allotmentForm.value);
      this.allotmentForm.reset({
        currency: 'GBP',
        paymentStatus: 'Unpaid'
      });
      localStorage.setItem('allotments', JSON.stringify(this.allotments));
    }
  }

  removeAllotment(index: number): void {
    this.allotments.splice(index, 1);
    localStorage.setItem('allotments', JSON.stringify(this.allotments));
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  updatePaymentStatus(index: number): void {
    this.allotments[index].paymentStatus = 'Paid';
    localStorage.setItem('allotments', JSON.stringify(this.allotments));
  }

  calculateTotalValue(allotment: Allotment): number {
    return allotment.numberOfShares * allotment.issuePrice;
  }
}
