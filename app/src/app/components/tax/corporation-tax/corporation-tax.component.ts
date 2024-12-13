import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-corporation-tax',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corporation-tax.component.html',
  styleUrls: ['./corporation-tax.component.scss']
})
export class CorporationTaxComponent {
  taxReturns = [
    {
      year: '2023',
      status: 'Pending',
      dueDate: '2024-09-23',
      preliminaryTax: 35000.00,
      finalLiability: null,
      payments: [
        { date: '2023-06-23', amount: 35000.00, type: 'Preliminary Tax' }
      ]
    },
    {
      year: '2022',
      status: 'Filed',
      dueDate: '2023-09-23',
      preliminaryTax: 32000.00,
      finalLiability: 33500.00,
      payments: [
        { date: '2022-06-23', amount: 32000.00, type: 'Preliminary Tax' },
        { date: '2023-09-23', amount: 1500.00, type: 'Balance Payment' }
      ]
    }
  ];

  taxRates = [
    { type: 'Trading Income', rate: 12.5, note: 'Standard corporate tax rate' },
    { type: 'Non-Trading Income', rate: 25, note: 'Including rental and investment income' },
    { type: 'Capital Gains', rate: 33, note: 'Standard CGT rate' }
  ];

  reliefs = [
    { 
      type: 'R&D Tax Credit',
      rate: '25%',
      description: 'Credit on qualifying R&D expenditure'
    },
    { 
      type: 'Knowledge Development Box',
      rate: '6.25%',
      description: 'Reduced rate on qualifying income from IP'
    },
    { 
      type: 'Start-up Relief',
      rate: 'Up to €40,000',
      description: 'Relief for new companies in first 3 years'
    }
  ];

  deadlines = [
    {
      event: 'Preliminary Tax',
      date: '2024-06-23',
      description: '90% of final liability or 100% of previous year'
    },
    {
      event: 'Return Filing',
      date: '2024-09-23',
      description: 'CT1 return and financial statements'
    },
    {
      event: 'Balance Payment',
      date: '2024-09-23',
      description: 'Any remaining tax due for the period'
    }
  ];

  companyInfo = {
    taxNumber: 'IE1234567FA',
    accountingPeriod: '01/01/2023 - 31/12/2023',
    residency: 'Irish Resident',
    status: 'Active'
  };
}
