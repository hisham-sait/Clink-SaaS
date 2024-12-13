import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tax-capital-gains',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capital-gains.component.html',
  styleUrls: ['./capital-gains.component.scss']
})
export class CapitalGainsComponent {
  disposals = [
    {
      type: 'Property',
      description: 'Investment Property - Dublin 4',
      acquisitionDate: '2015-06-15',
      acquisitionCost: 450000.00,
      disposalDate: '2023-09-20',
      disposalProceeds: 750000.00,
      enhancementCosts: 50000.00,
      disposalCosts: 15000.00,
      status: 'Filed'
    },
    {
      type: 'Shares',
      description: 'Tech Company Ltd - 10,000 shares',
      acquisitionDate: '2020-03-10',
      acquisitionCost: 25000.00,
      disposalDate: '2023-11-15',
      disposalProceeds: 45000.00,
      enhancementCosts: 0.00,
      disposalCosts: 500.00,
      status: 'Pending'
    }
  ];

  exemptions = [
    {
      type: 'Principal Private Residence',
      description: 'Full relief on qualifying home',
      conditions: 'Must be main residence throughout ownership'
    },
    {
      type: 'Annual Exemption',
      description: '€1,270 per tax year',
      conditions: 'Automatic deduction from net gains'
    },
    {
      type: 'Retirement Relief',
      description: 'Up to €750,000',
      conditions: 'Age 55+, owned asset for 10+ years'
    }
  ];

  rates = [
    {
      type: 'Standard Rate',
      rate: 33,
      description: 'Applies to most disposals'
    },
    {
      type: 'Entrepreneur Relief',
      rate: 10,
      description: 'Up to €1m lifetime limit on qualifying business assets'
    }
  ];

  deadlines = [
    {
      period: 'Initial CGT',
      date: '2023-12-15',
      description: 'For disposals in period 1 January to 30 November'
    },
    {
      period: 'Final CGT',
      date: '2024-01-31',
      description: 'For disposals in period 1 to 31 December'
    },
    {
      period: 'CG1 Form',
      date: '2024-10-31',
      description: 'Annual return of capital gains'
    }
  ];

  calculations = {
    totalGains: 319500.00,
    totalLosses: 0.00,
    annualExemption: 1270.00,
    netGains: 318230.00,
    taxDue: 105015.90
  };
}
