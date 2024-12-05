import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ReportMetric {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  icon: string;
}

interface InvoiceReport {
  id: string;
  name: string;
  type: 'Summary' | 'Detailed' | 'Custom';
  period: string;
  lastGenerated?: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'Ready' | 'Processing' | 'Failed';
}

@Component({
  selector: 'app-invoice-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InvoiceReportsComponent {
  reportMetrics: ReportMetric[] = [
    {
      title: 'Total Invoiced',
      value: '$45,280',
      trend: 'up',
      change: '+12.5%',
      icon: 'bi bi-cash'
    },
    {
      title: 'Average Value',
      value: '$2,845',
      trend: 'up',
      change: '+8.3%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Payment Time',
      value: '15 days',
      trend: 'down',
      change: '-2 days',
      icon: 'bi bi-clock'
    },
    {
      title: 'Collection Rate',
      value: '95%',
      trend: 'up',
      change: '+3%',
      icon: 'bi bi-check-circle'
    }
  ];

  recentReports: InvoiceReport[] = [
    {
      id: '1',
      name: 'Monthly Invoice Summary',
      type: 'Summary',
      period: 'January 2024',
      lastGenerated: '2024-01-15T14:30:00',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: '2',
      name: 'Q4 Invoice Analysis',
      type: 'Detailed',
      period: 'Q4 2023',
      lastGenerated: '2024-01-14T11:15:00',
      format: 'Excel',
      status: 'Ready'
    },
    {
      id: '3',
      name: 'Annual Invoice Report',
      type: 'Summary',
      period: '2023',
      lastGenerated: '2024-01-13T09:20:00',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: '4',
      name: 'Custom Client Report',
      type: 'Custom',
      period: 'Last 6 Months',
      format: 'CSV',
      status: 'Processing'
    }
  ];

  generateReport(type: 'Summary' | 'Detailed' | 'Custom'): void {
    alert(`Generating ${type} report... Feature coming soon!`);
  }

  downloadReport(report: InvoiceReport): void {
    alert(`Downloading report: ${report.name}... Feature coming soon!`);
  }

  handleReportAction(report: InvoiceReport): void {
    alert(`Report actions for: ${report.name}... Feature coming soon!`);
  }
}
