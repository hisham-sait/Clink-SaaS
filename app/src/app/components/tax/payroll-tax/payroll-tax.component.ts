import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-payroll-tax',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-tax.component.html',
  styleUrls: ['./payroll-tax.component.scss']
})
export class PayrollTaxComponent {
  payrollSummary = {
    totalEmployees: 45,
    monthlyPAYE: 28500.00,
    monthlyPRSI: 12500.00,
    monthlyUSC: 8500.00,
    totalDeductions: 49500.00,
    payrollDate: '2023-12-31'
  };

  taxBands = [
    {
      type: 'Standard Rate',
      rate: 20,
      threshold: '€40,000',
      category: 'Single Person'
    },
    {
      type: 'Higher Rate',
      rate: 40,
      threshold: 'Balance',
      category: 'Single Person'
    },
    {
      type: 'Standard Rate',
      rate: 20,
      threshold: '€49,000',
      category: 'Married (One Income)'
    },
    {
      type: 'Higher Rate',
      rate: 40,
      threshold: 'Balance',
      category: 'Married (One Income)'
    }
  ];

  uscRates = [
    {
      band: '€0 - €12,012',
      rate: 0.5,
      description: 'First Band'
    },
    {
      band: '€12,013 - €22,920',
      rate: 2,
      description: 'Second Band'
    },
    {
      band: '€22,921 - €70,044',
      rate: 4.5,
      description: 'Third Band'
    },
    {
      band: '€70,045+',
      rate: 8,
      description: 'Fourth Band'
    }
  ];

  prsiRates = [
    {
      type: 'Employee PRSI',
      rate: 4,
      description: 'Class A'
    },
    {
      type: 'Employer PRSI',
      rate: 11.05,
      description: 'Class A (Standard)'
    },
    {
      type: 'Employer PRSI',
      rate: 8.8,
      description: 'Class A (Reduced)'
    }
  ];

  recentPayments = [
    {
      period: 'December 2023',
      dueDate: '2024-01-23',
      paye: 28500.00,
      prsi: 12500.00,
      usc: 8500.00,
      status: 'Pending'
    },
    {
      period: 'November 2023',
      dueDate: '2023-12-23',
      paye: 27800.00,
      prsi: 12200.00,
      usc: 8300.00,
      status: 'Paid'
    }
  ];

  taxCredits = [
    {
      type: 'Personal Tax Credit',
      amount: 1775,
      description: 'Standard personal credit'
    },
    {
      type: 'Employee Tax Credit',
      amount: 1775,
      description: 'PAYE worker credit'
    },
    {
      type: 'Earned Income Credit',
      amount: 1775,
      description: 'Self-employed credit'
    }
  ];

  deadlines = [
    {
      event: 'Monthly P30',
      date: '2024-01-23',
      description: 'December 2023 PAYE/PRSI/USC'
    },
    {
      event: 'P35 Annual Return',
      date: '2024-02-15',
      description: '2023 annual payroll return'
    },
    {
      event: 'Employee P60s',
      date: '2024-02-15',
      description: '2023 employee certificates'
    }
  ];
}
