import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ComplianceReport {
  id: number;
  title: string;
  type: 'Regulatory' | 'Audit' | 'Internal' | 'ESG' | 'Risk';
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Ad Hoc';
  status: 'Draft' | 'In Review' | 'Approved' | 'Submitted' | 'Archived';
  dueDate: Date;
  submittedDate?: Date;
  assignedTo: string;
  authority: string;
  description: string;
  period: string;
  metrics: number;
  findings: number;
  actions: number;
}

interface ReportMetric {
  id: number;
  reportId: number;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'On Track' | 'At Risk' | 'Off Track';
  notes: string;
}

interface ReportFinding {
  id: number;
  reportId: number;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: string;
  description: string;
  recommendation: string;
  assignedTo: string;
  dueDate: Date;
}

type StatusClasses = {
  [key in 'Draft' | 'In Review' | 'Approved' | 'Submitted' | 'Archived' | 
        'On Track' | 'At Risk' | 'Off Track' | 'Open' | 'In Progress' | 'Resolved' | 'Closed']: string;
};

type SeverityClasses = {
  [key in 'High' | 'Medium' | 'Low']: string;
};

@Component({
  selector: 'app-compliance-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ReportsComponent {
  reports: ComplianceReport[] = [
    {
      id: 1,
      title: 'Q2 2024 Regulatory Compliance Report',
      type: 'Regulatory',
      frequency: 'Quarterly',
      status: 'In Review',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      assignedTo: 'Sarah Johnson',
      authority: 'Financial Services Authority',
      description: 'Quarterly regulatory compliance assessment report',
      period: 'Q2 2024',
      metrics: 12,
      findings: 3,
      actions: 5
    },
    {
      id: 2,
      title: '2024 Annual ESG Report',
      type: 'ESG',
      frequency: 'Annual',
      status: 'Draft',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      assignedTo: 'Michael Brown',
      authority: 'Board of Directors',
      description: 'Annual environmental, social, and governance report',
      period: 'FY 2024',
      metrics: 24,
      findings: 6,
      actions: 8
    },
    {
      id: 3,
      title: 'Monthly Risk Assessment Report',
      type: 'Risk',
      frequency: 'Monthly',
      status: 'Approved',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      submittedDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      assignedTo: 'David Wilson',
      authority: 'Risk Committee',
      description: 'Monthly risk assessment and compliance status',
      period: 'May 2024',
      metrics: 8,
      findings: 2,
      actions: 4
    }
  ];

  metrics: ReportMetric[] = [
    {
      id: 1,
      reportId: 1,
      name: 'Regulatory Filing Compliance',
      category: 'Regulatory',
      value: 95,
      target: 100,
      unit: '%',
      trend: 'up',
      status: 'On Track',
      notes: 'Improved compliance rate from previous quarter'
    },
    {
      id: 2,
      reportId: 2,
      name: 'Carbon Emissions',
      category: 'Environmental',
      value: 125,
      target: 100,
      unit: 'tons CO2e',
      trend: 'down',
      status: 'At Risk',
      notes: 'Emissions reduction initiatives in progress'
    }
  ];

  findings: ReportFinding[] = [
    {
      id: 1,
      reportId: 1,
      title: 'Documentation Gap in Compliance Procedures',
      severity: 'Medium',
      status: 'In Progress',
      category: 'Documentation',
      description: 'Identified gaps in compliance documentation procedures',
      recommendation: 'Update and standardize documentation processes',
      assignedTo: 'Sarah Johnson',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30))
    },
    {
      id: 2,
      reportId: 2,
      title: 'ESG Data Collection Process Improvement',
      severity: 'Low',
      status: 'Open',
      category: 'Process',
      description: 'ESG data collection process needs optimization',
      recommendation: 'Implement automated data collection system',
      assignedTo: 'Michael Brown',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45))
    }
  ];

  statistics = {
    totalReports: this.reports.length,
    pendingReports: this.reports.filter(r => ['Draft', 'In Review'].includes(r.status)).length,
    submittedReports: this.reports.filter(r => r.status === 'Submitted').length,
    upcomingDeadlines: this.reports.filter(r => {
      const daysUntilDue = this.calculateDaysRemaining(r.dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 30;
    }).length,
    totalFindings: this.findings.length,
    openFindings: this.findings.filter(f => f.status === 'Open').length
  };

  private statusClasses: StatusClasses = {
    'Draft': 'bg-secondary',
    'In Review': 'bg-warning',
    'Approved': 'bg-success',
    'Submitted': 'bg-primary',
    'Archived': 'bg-info',
    'On Track': 'bg-success',
    'At Risk': 'bg-warning',
    'Off Track': 'bg-danger',
    'Open': 'bg-danger',
    'In Progress': 'bg-warning',
    'Resolved': 'bg-success',
    'Closed': 'bg-secondary'
  };

  private severityClasses: SeverityClasses = {
    'High': 'text-danger',
    'Medium': 'text-warning',
    'Low': 'text-info'
  };

  getStatusClass(status: keyof StatusClasses): string {
    return this.statusClasses[status];
  }

  getSeverityClass(severity: keyof SeverityClasses): string {
    return this.severityClasses[severity];
  }

  calculateDaysRemaining(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(date: Date): boolean {
    return this.calculateDaysRemaining(date) < 0;
  }

  isDueSoon(date: Date): boolean {
    const daysRemaining = this.calculateDaysRemaining(date);
    return daysRemaining >= 0 && daysRemaining <= 30;
  }

  getMetricsByReport(reportId: number): ReportMetric[] {
    return this.metrics.filter(m => m.reportId === reportId);
  }

  getFindingsByReport(reportId: number): ReportFinding[] {
    return this.findings.filter(f => f.reportId === reportId);
  }
}
