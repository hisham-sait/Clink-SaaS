import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Audit {
  id: number;
  title: string;
  type: 'Internal' | 'External' | 'Regulatory' | 'Compliance';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed';
  startDate: Date;
  endDate: Date;
  auditor: string;
  department: string;
  findings: number;
  criticalFindings: number;
  description: string;
  progress: number;
}

type StatusClasses = {
  [key in 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed']: string;
};

type TypeIcons = {
  [key in 'Internal' | 'External' | 'Regulatory' | 'Compliance']: string;
};

@Component({
  selector: 'app-compliance-audits',
  templateUrl: './audits.component.html',
  styleUrls: ['./audits.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AuditsComponent {
  audits: Audit[] = [
    {
      id: 1,
      title: 'Annual Security Compliance Audit',
      type: 'Regulatory',
      status: 'In Progress',
      startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      auditor: 'John Smith',
      department: 'IT Security',
      findings: 8,
      criticalFindings: 2,
      description: 'Comprehensive review of security protocols and compliance measures',
      progress: 45
    },
    {
      id: 2,
      title: 'Q2 Internal Controls Review',
      type: 'Internal',
      status: 'Scheduled',
      startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      auditor: 'Sarah Johnson',
      department: 'Finance',
      findings: 0,
      criticalFindings: 0,
      description: 'Quarterly review of internal control mechanisms',
      progress: 0
    },
    {
      id: 3,
      title: 'Data Protection Compliance Audit',
      type: 'Compliance',
      status: 'Completed',
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 15)),
      auditor: 'Michael Brown',
      department: 'Legal',
      findings: 5,
      criticalFindings: 1,
      description: 'Assessment of GDPR and data protection compliance',
      progress: 100
    },
    {
      id: 4,
      title: 'External Financial Audit',
      type: 'External',
      status: 'Reviewed',
      startDate: new Date(new Date().setDate(new Date().getDate() - 45)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      auditor: 'PwC Auditors',
      department: 'Finance',
      findings: 3,
      criticalFindings: 0,
      description: 'Annual external financial audit',
      progress: 100
    }
  ];

  filterOptions = {
    types: ['Internal', 'External', 'Regulatory', 'Compliance'],
    statuses: ['Scheduled', 'In Progress', 'Completed', 'Reviewed'],
    departments: ['IT Security', 'Finance', 'Legal', 'Operations', 'HR']
  };

  statistics = {
    total: this.audits.length,
    completed: this.audits.filter(a => a.status === 'Completed' || a.status === 'Reviewed').length,
    inProgress: this.audits.filter(a => a.status === 'In Progress').length,
    scheduled: this.audits.filter(a => a.status === 'Scheduled').length,
    criticalFindings: this.audits.reduce((sum, audit) => sum + audit.criticalFindings, 0),
    totalFindings: this.audits.reduce((sum, audit) => sum + audit.findings, 0)
  };

  private statusClasses: StatusClasses = {
    'Scheduled': 'bg-info',
    'In Progress': 'bg-primary',
    'Completed': 'bg-success',
    'Reviewed': 'bg-warning'
  };

  private typeIcons: TypeIcons = {
    'Internal': 'bi-shield-check',
    'External': 'bi-building',
    'Regulatory': 'bi-journal-check',
    'Compliance': 'bi-clipboard-check'
  };

  getStatusClass(status: 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed'): string {
    return this.statusClasses[status];
  }

  getTypeIcon(type: 'Internal' | 'External' | 'Regulatory' | 'Compliance'): string {
    return this.typeIcons[type];
  }

  calculateDaysRemaining(endDate: Date): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
