import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Policy {
  id: number;
  title: string;
  category: 'Security' | 'Privacy' | 'HR' | 'Financial' | 'Operational' | 'Environmental';
  status: 'Active' | 'Under Review' | 'Draft' | 'Archived';
  version: string;
  lastUpdated: Date;
  nextReview: Date;
  owner: string;
  approver: string;
  description: string;
  compliance: string[];
  attachments: number;
}

type StatusClasses = {
  [key in 'Active' | 'Under Review' | 'Draft' | 'Archived']: string;
};

type CategoryIcons = {
  [key in 'Security' | 'Privacy' | 'HR' | 'Financial' | 'Operational' | 'Environmental']: string;
};

@Component({
  selector: 'app-compliance-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PoliciesComponent {
  policies: Policy[] = [
    {
      id: 1,
      title: 'Data Protection Policy',
      category: 'Privacy',
      status: 'Active',
      version: '2.1',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 30)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      owner: 'Sarah Johnson',
      approver: 'John Smith',
      description: 'Guidelines for handling and protecting sensitive data',
      compliance: ['GDPR', 'CCPA'],
      attachments: 3
    },
    {
      id: 2,
      title: 'Information Security Policy',
      category: 'Security',
      status: 'Under Review',
      version: '3.0',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 15)),
      nextReview: new Date(new Date().setDate(new Date().getDate() + 15)),
      owner: 'Michael Brown',
      approver: 'David Wilson',
      description: 'Security protocols and procedures for IT infrastructure',
      compliance: ['ISO 27001', 'SOC 2'],
      attachments: 5
    },
    {
      id: 3,
      title: 'Environmental Impact Policy',
      category: 'Environmental',
      status: 'Draft',
      version: '1.0',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 5)),
      nextReview: new Date(new Date().setDate(new Date().getDate() + 25)),
      owner: 'Emma Davis',
      approver: 'James Wilson',
      description: 'Guidelines for reducing environmental impact',
      compliance: ['ISO 14001'],
      attachments: 2
    },
    {
      id: 4,
      title: 'Financial Controls Policy',
      category: 'Financial',
      status: 'Active',
      version: '2.3',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 45)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      owner: 'Robert Taylor',
      approver: 'Patricia Moore',
      description: 'Internal financial control procedures',
      compliance: ['SOX', 'IFRS'],
      attachments: 4
    }
  ];

  filterOptions = {
    categories: ['Security', 'Privacy', 'HR', 'Financial', 'Operational', 'Environmental'],
    statuses: ['Active', 'Under Review', 'Draft', 'Archived']
  };

  statistics = {
    total: this.policies.length,
    active: this.policies.filter(p => p.status === 'Active').length,
    underReview: this.policies.filter(p => p.status === 'Under Review').length,
    draft: this.policies.filter(p => p.status === 'Draft').length,
    archived: this.policies.filter(p => p.status === 'Archived').length,
    requiresReview: this.policies.filter(p => {
      const reviewDate = new Date(p.nextReview);
      const today = new Date();
      return reviewDate <= new Date(today.setMonth(today.getMonth() + 1));
    }).length
  };

  private statusClasses: StatusClasses = {
    'Active': 'bg-success',
    'Under Review': 'bg-warning',
    'Draft': 'bg-info',
    'Archived': 'bg-secondary'
  };

  private categoryIcons: CategoryIcons = {
    'Security': 'bi-shield-lock',
    'Privacy': 'bi-eye-slash',
    'HR': 'bi-people',
    'Financial': 'bi-cash-stack',
    'Operational': 'bi-gear',
    'Environmental': 'bi-tree'
  };

  getStatusClass(status: 'Active' | 'Under Review' | 'Draft' | 'Archived'): string {
    return this.statusClasses[status];
  }

  getCategoryIcon(category: 'Security' | 'Privacy' | 'HR' | 'Financial' | 'Operational' | 'Environmental'): string {
    return this.categoryIcons[category];
  }

  calculateDaysUntilReview(reviewDate: Date): number {
    const today = new Date();
    const review = new Date(reviewDate);
    const diffTime = review.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isReviewDueSoon(reviewDate: Date): boolean {
    return this.calculateDaysUntilReview(reviewDate) <= 30;
  }
}
