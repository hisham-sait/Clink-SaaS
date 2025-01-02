import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Charge {
  dateCreated: string;
  chargeType: string;
  amount: number;
  currency: string;
  creditor: string;
  description: string;
  propertySecured: string;
  registrationNumber: string;
  dateRegistered: string;
  dateSatisfied?: string;
  status: 'Active' | 'Satisfied';
}

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent {
  chargeForm: FormGroup;
  charges: Charge[] = [];

  chargeTypes = [
    'Fixed Charge',
    'Floating Charge',
    'Fixed and Floating Charge',
    'Debenture'
  ];

  currencies = [
    'GBP',
    'EUR',
    'USD'
  ];

  constructor(private fb: FormBuilder) {
    this.chargeForm = this.fb.group({
      dateCreated: ['', Validators.required],
      chargeType: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      currency: ['GBP', Validators.required],
      creditor: ['', Validators.required],
      description: ['', Validators.required],
      propertySecured: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      dateRegistered: ['', Validators.required],
      dateSatisfied: [''],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedCharges = localStorage.getItem('charges');
    if (savedCharges) {
      this.charges = JSON.parse(savedCharges);
    }
  }

  onSubmit(): void {
    if (this.chargeForm.valid) {
      this.charges.push(this.chargeForm.value);
      this.chargeForm.reset({
        currency: 'GBP',
        status: 'Active'
      });
      localStorage.setItem('charges', JSON.stringify(this.charges));
    }
  }

  removeCharge(index: number): void {
    this.charges.splice(index, 1);
    localStorage.setItem('charges', JSON.stringify(this.charges));
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

  satisfyCharge(index: number): void {
    this.charges[index].status = 'Satisfied';
    this.charges[index].dateSatisfied = new Date().toISOString().split('T')[0];
    localStorage.setItem('charges', JSON.stringify(this.charges));
  }
}
