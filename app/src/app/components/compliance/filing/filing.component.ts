import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ComplianceDocument {
  id: number;
  title: string;
  type: 'Report' | 'Certificate' | 'Policy' | 'Form' | 'Evidence';
  category: 'Regulatory' | 'Legal' | 'Internal' | 'External';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Expired';
  dueDate: Date;
  submittedDate?: Date;
  assignedTo: string;
  authority: string;
  description: string;
  version: string;
  size: number;
  lastModified: Date;
  tags: string[];
}

interface DocumentTemplate {
  id: number;
  title: string;
  type: 'Report' | 'Certificate' | 'Policy' | 'Form';
  category: 'Regulatory' | 'Legal' | 'Internal' | 'External';
  description: string;
  lastUpdated: Date;
  version: string;
  usageCount: number;
}

interface FilingActivity {
  id: number;
  documentId: number;
  type: 'Creation' | 'Update' | 'Review' | 'Approval' | 'Submission';
  date: Date;
  user: string;
  notes: string;
  changes?: string[];
}

type StatusClasses = {
  [key in 'Draft' | 'Under Review' | 'Approved' | 'Expired']: string;
};

type CategoryClasses = {
  [key in 'Regulatory' | 'Legal' | 'Internal' | 'External']: string;
};

@Component({
  selector: 'app-compliance-filing',
  templateUrl: './filing.component.html',
  styleUrls: ['./filing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FilingComponent {
  documents: ComplianceDocument[] = [
    {
      id: 1,
      title: 'Annual Compliance Report 2024',
      type: 'Report',
      category: 'Regulatory',
      status: 'Draft',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      assignedTo: 'Sarah Johnson',
      authority: 'Financial Services Authority',
      description: 'Annual compliance report detailing regulatory adherence',
      version: '1.0',
      size: 2048576, // 2MB
      lastModified: new Date(new Date().setDate(new Date().getDate() - 2)),
      tags: ['Annual', 'Regulatory', 'FSA']
    },
    {
      id: 2,
      title: 'Data Protection Policy',
      type: 'Policy',
      category: 'Internal',
      status: 'Approved',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 180)),
      submittedDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      assignedTo: 'Michael Brown',
      authority: 'Internal Compliance',
      description: 'Company-wide data protection policy',
      version: '2.1',
      size: 1048576, // 1MB
      lastModified: new Date(new Date().setDate(new Date().getDate() - 30)),
      tags: ['Policy', 'Data Protection', 'GDPR']
    }
  ];

  templates: DocumentTemplate[] = [
    {
      id: 1,
      title: 'Compliance Report Template',
      type: 'Report',
      category: 'Regulatory',
      description: 'Standard template for compliance reports',
      lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      version: '2.0',
      usageCount: 15
    },
    {
      id: 2,
      title: 'Policy Document Template',
      type: 'Policy',
      category: 'Internal',
      description: 'Template for internal policy documents',
      lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      version: '1.5',
      usageCount: 8
    }
  ];

  activities: FilingActivity[] = [
    {
      id: 1,
      documentId: 1,
      type: 'Creation',
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      user: 'Sarah Johnson',
      notes: 'Initial draft created from template',
      changes: ['Created document', 'Added basic structure']
    },
    {
      id: 2,
      documentId: 2,
      type: 'Approval',
      date: new Date(new Date().setDate(new Date().getDate() - 30)),
      user: 'Michael Brown',
      notes: 'Approved after legal review',
      changes: ['Updated policy sections', 'Added compliance references']
    }
  ];

  statistics = {
    totalDocuments: this.documents.length,
    pendingReview: this.documents.filter(d => d.status === 'Under Review').length,
    approvedDocuments: this.documents.filter(d => d.status === 'Approved').length,
    upcomingDeadlines: this.documents.filter(d => {
      const daysUntilDue = this.calculateDaysRemaining(d.dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 30;
    }).length,
    totalTemplates: this.templates.length,
    recentActivities: this.activities.filter(a => {
      const daysSinceActivity = Math.abs(this.calculateDaysRemaining(a.date));
      return daysSinceActivity <= 7;
    }).length
  };

  private statusClasses: StatusClasses = {
    'Draft': 'bg-secondary',
    'Under Review': 'bg-warning',
    'Approved': 'bg-success',
    'Expired': 'bg-danger'
  };

  private categoryClasses: CategoryClasses = {
    'Regulatory': 'text-primary',
    'Legal': 'text-danger',
    'Internal': 'text-success',
    'External': 'text-warning'
  };

  getDocumentTitle(documentId: number): string {
    const document = this.documents.find(d => d.id === documentId);
    return document ? document.title : 'Unknown Document';
  }

  getStatusClass(status: keyof StatusClasses): string {
    return this.statusClasses[status];
  }

  getCategoryClass(category: keyof CategoryClasses): string {
    return this.categoryClasses[category];
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

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getActivitiesByDocument(documentId: number): FilingActivity[] {
    return this.activities.filter(a => a.documentId === documentId);
  }
}
