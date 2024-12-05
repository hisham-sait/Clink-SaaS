import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportType {
  name: string;
  description: string;
  icon: string;
}

interface Report {
  name: string;
  type: string;
  period: string;
  generated: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'Ready' | 'Processing' | 'Failed';
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ReportsComponent {
  reportTypes: ReportType[] = [
    {
      name: 'Balance Sheet',
      description: 'View your assets, liabilities, and equity',
      icon: 'bi bi-file-earmark-spreadsheet'
    },
    {
      name: 'Income Statement',
      description: 'Track your revenue, expenses, and profit',
      icon: 'bi bi-graph-up'
    },
    {
      name: 'Cash Flow',
      description: 'Monitor your cash inflows and outflows',
      icon: 'bi bi-cash-stack'
    }
  ];

  recentReports: Report[] = [
    {
      name: 'Balance Sheet - Q4 2023',
      type: 'Balance Sheet',
      period: 'Q4 2023',
      generated: '2024-01-15',
      format: 'PDF',
      status: 'Ready'
    },
    {
      name: 'Income Statement - Dec 2023',
      type: 'Income Statement',
      period: 'Dec 2023',
      generated: '2024-01-14',
      format: 'Excel',
      status: 'Ready'
    },
    {
      name: 'Cash Flow - Q4 2023',
      type: 'Cash Flow',
      period: 'Q4 2023',
      generated: '2024-01-13',
      format: 'CSV',
      status: 'Processing'
    },
    {
      name: 'Balance Sheet - Q3 2023',
      type: 'Balance Sheet',
      period: 'Q3 2023',
      generated: '2023-10-15',
      format: 'PDF',
      status: 'Ready'
    },
    {
      name: 'Income Statement - Nov 2023',
      type: 'Income Statement',
      period: 'Nov 2023',
      generated: '2023-12-01',
      format: 'Excel',
      status: 'Failed'
    }
  ];

  generateReport(type: ReportType): void {
    alert(`Generating ${type.name}... Feature coming soon!`);
  }

  downloadReport(report: Report): void {
    alert(`Downloading ${report.name}... Feature coming soon!`);
  }

  viewReport(report: Report): void {
    alert(`Viewing ${report.name}... Feature coming soon!`);
  }

  deleteReport(report: Report): void {
    alert(`Deleting ${report.name}... Feature coming soon!`);
  }

  scheduleReport(): void {
    alert('Report scheduling feature coming soon!');
  }

  customizeTemplate(): void {
    alert('Template customization feature coming soon!');
  }

  manageSubscriptions(): void {
    alert('Subscription management feature coming soon!');
  }
}
