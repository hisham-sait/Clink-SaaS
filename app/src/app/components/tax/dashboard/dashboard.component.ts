import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tax-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  taxModules = [
    {
      title: 'VAT',
      icon: 'bi-receipt',
      route: '/tax/vat',
      summary: {
        nextDue: '2024-01-19',
        lastFiled: '2023-10-19',
        status: 'Up to date',
        amount: '€12,500.00'
      }
    },
    {
      title: 'Income Tax',
      icon: 'bi-person-badge',
      route: '/tax/income-tax',
      summary: {
        nextDue: '2024-10-31',
        lastFiled: '2023-10-31',
        status: 'Preliminary tax paid',
        amount: '€25,000.00'
      }
    },
    {
      title: 'Corporation Tax',
      icon: 'bi-building',
      route: '/tax/corporation-tax',
      summary: {
        nextDue: '2024-09-23',
        lastFiled: '2023-09-23',
        status: 'Preliminary tax due',
        amount: '€35,000.00'
      }
    },
    {
      title: 'Capital Gains',
      icon: 'bi-graph-up-arrow',
      route: '/tax/capital-gains',
      summary: {
        nextDue: '2024-12-15',
        lastFiled: '2023-12-15',
        status: 'No disposals',
        amount: '€0.00'
      }
    },
    {
      title: 'Payroll Tax',
      icon: 'bi-people',
      route: '/tax/payroll-tax',
      summary: {
        nextDue: '2024-01-23',
        lastFiled: '2023-12-23',
        status: 'December P30 pending',
        amount: '€49,500.00'
      }
    }
  ];

  deadlines = [
    {
      tax: 'VAT',
      date: '2024-01-19',
      description: 'November/December VAT Return'
    },
    {
      tax: 'Payroll Tax',
      date: '2024-01-23',
      description: 'December P30 Return'
    },
    {
      tax: 'Corporation Tax',
      date: '2024-02-23',
      description: 'Preliminary Tax Payment'
    }
  ];

  recentActivity = [
    {
      date: '2023-12-23',
      tax: 'Payroll Tax',
      action: 'Filed November P30',
      amount: '€48,800.00'
    },
    {
      date: '2023-12-15',
      tax: 'Capital Gains',
      action: 'Filed CGT Return',
      amount: '€105,015.90'
    },
    {
      date: '2023-12-10',
      tax: 'VAT',
      action: 'Filed September/October Return',
      amount: '€11,800.00'
    }
  ];

  taxCalendar = [
    {
      month: 'January',
      events: [
        { day: '19', description: 'VAT Return Due' },
        { day: '23', description: 'P30 Return Due' }
      ]
    },
    {
      month: 'February',
      events: [
        { day: '15', description: 'P35 Annual Return Due' },
        { day: '23', description: 'Corporation Tax Due' }
      ]
    },
    {
      month: 'March',
      events: [
        { day: '23', description: 'P30 Return Due' }
      ]
    }
  ];
}
