import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-vat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vat.component.html',
  styleUrls: ['./vat.component.scss']
})
export class VatComponent {
  vatReturns = [
    {
      period: 'Q4 2023',
      dueDate: '2024-01-31',
      status: 'Pending',
      salesVat: 5000.00,
      purchasesVat: 2500.00,
      netVat: 2500.00
    },
    {
      period: 'Q3 2023',
      dueDate: '2023-10-31',
      status: 'Filed',
      salesVat: 4800.00,
      purchasesVat: 2300.00,
      netVat: 2500.00
    }
  ];

  vatRates = [
    { name: 'Standard Rate', rate: 23 },
    { name: 'Reduced Rate', rate: 13.5 },
    { name: 'Second Reduced Rate', rate: 9 },
    { name: 'Zero Rate', rate: 0 }
  ];

  vatSettings = {
    registrationNumber: 'IE1234567AB',
    filingFrequency: 'Quarterly',
    lastFiled: '2023-10-31',
    nextDue: '2024-01-31'
  };
}
