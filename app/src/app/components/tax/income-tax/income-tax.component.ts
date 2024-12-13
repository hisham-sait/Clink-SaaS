import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-income-tax',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-tax.component.html',
  styleUrls: ['./income-tax.component.scss']
})
export class IncomeTaxComponent {
  taxYears = [
    {
      year: '2023',
      status: 'Pending',
      dueDate: '2024-10-31',
      preliminaryTax: 25000.00,
      finalLiability: null,
      payments: [
        { date: '2023-10-31', amount: 25000.00, type: 'Preliminary Tax' }
      ]
    },
    {
      year: '2022',
      status: 'Filed',
      dueDate: '2023-10-31',
      preliminaryTax: 22000.00,
      finalLiability: 23500.00,
      payments: [
        { date: '2022-10-31', amount: 22000.00, type: 'Preliminary Tax' },
        { date: '2023-10-31', amount: 1500.00, type: 'Balance Payment' }
      ]
    }
  ];

  taxRates = [
    { band: '0 - €40,000', rate: 20, type: 'Standard Rate' },
    { band: '€40,000+', rate: 40, type: 'Higher Rate' }
  ];

  taxCredits = [
    { type: 'Personal Tax Credit', amount: 1775 },
    { type: 'Employee Tax Credit', amount: 1775 },
    { type: 'Home Carer Tax Credit', amount: 1700 },
    { type: 'Earned Income Credit', amount: 1775 }
  ];

  reliefs = [
    { type: 'Medical Expenses', rate: '20%' },
    { type: 'Pension Contributions', rate: '40%' },
    { type: 'Start-up Relief', rate: 'Up to €100,000' }
  ];
}
