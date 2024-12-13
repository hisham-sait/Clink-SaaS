import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RegulatoryRequirement {
  id: number;
  title: string;
  authority: string;
  category: 'Financial' | 'Data Protection' | 'Industry Specific' | 'Environmental' | 'Labor';
  status: 'Compliant' | 'In Progress' | 'Non-Compliant' | 'Under Review';
  dueDate: Date;
  assignedTo: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  lastReview: Date;
  nextReview: Date;
  documents: number;
}

interface ComplianceUpdate {
  id: number;
  requirementId: number;
  date: Date;
  type: 'Review' | 'Update' | 'Submission' | 'Approval';
  status: 'Completed' | 'Pending' | 'Rejected';
  updatedBy: string;
  notes: string;
}

interface RegulatoryAuthority {
  id: number;
  name: string;
  jurisdiction: string;
  requirements: number[];
  lastContact: Date;
  nextDeadline: Date;
  contactPerson: string;
  email: string;
  phone: string;
}

type StatusClasses = {
  [key in 'Compliant' | 'In Progress' | 'Non-Compliant' | 'Under Review' | 
        'Completed' | 'Pending' | 'Rejected']: string;
};

type ImpactClasses = {
  [key in 'High' | 'Medium' | 'Low']: string;
};

@Component({
  selector: 'app-compliance-regulatory',
  templateUrl: './regulatory.component.html',
  styleUrls: ['./regulatory.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RegulatoryComponent {
  requirements: RegulatoryRequirement[] = [
    {
      id: 1,
      title: 'Annual Financial Audit',
      authority: 'Financial Services Authority',
      category: 'Financial',
      status: 'In Progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      assignedTo: 'Sarah Johnson',
      description: 'Complete annual financial compliance audit',
      impact: 'High',
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 11)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      documents: 8
    },
    {
      id: 2,
      title: 'Data Protection Assessment',
      authority: 'Data Protection Authority',
      category: 'Data Protection',
      status: 'Compliant',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 90)),
      assignedTo: 'Michael Brown',
      description: 'Conduct quarterly data protection assessment',
      impact: 'High',
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      documents: 5
    },
    {
      id: 3,
      title: 'Environmental Compliance Report',
      authority: 'Environmental Protection Agency',
      category: 'Environmental',
      status: 'Under Review',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      assignedTo: 'David Wilson',
      description: 'Submit environmental impact assessment',
      impact: 'Medium',
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      documents: 3
    }
  ];

  updates: ComplianceUpdate[] = [
    {
      id: 1,
      requirementId: 1,
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      type: 'Review',
      status: 'Completed',
      updatedBy: 'Sarah Johnson',
      notes: 'Completed initial review of financial documentation'
    },
    {
      id: 2,
      requirementId: 2,
      date: new Date(new Date().setDate(new Date().getDate() - 3)),
      type: 'Update',
      status: 'Pending',
      updatedBy: 'Michael Brown',
      notes: 'Updated data protection policies'
    }
  ];

  authorities: RegulatoryAuthority[] = [
    {
      id: 1,
      name: 'Financial Services Authority',
      jurisdiction: 'National',
      requirements: [1],
      lastContact: new Date(new Date().setDate(new Date().getDate() - 30)),
      nextDeadline: new Date(new Date().setDate(new Date().getDate() + 45)),
      contactPerson: 'John Smith',
      email: 'john.smith@fsa.gov',
      phone: '+1-555-0123'
    },
    {
      id: 2,
      name: 'Data Protection Authority',
      jurisdiction: 'European Union',
      requirements: [2],
      lastContact: new Date(new Date().setDate(new Date().getDate() - 15)),
      nextDeadline: new Date(new Date().setDate(new Date().getDate() + 90)),
      contactPerson: 'Emma Davis',
      email: 'emma.davis@dpa.eu',
      phone: '+44-555-0124'
    }
  ];

  statistics = {
    totalRequirements: this.requirements.length,
    compliantRequirements: this.requirements.filter(r => r.status === 'Compliant').length,
    pendingReviews: this.requirements.filter(r => r.status === 'Under Review').length,
    upcomingDeadlines: this.requirements.filter(r => {
      const daysUntilDue = this.calculateDaysRemaining(r.dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 30;
    }).length,
    highImpactItems: this.requirements.filter(r => r.impact === 'High').length,
    recentUpdates: this.updates.filter(u => {
      const daysSinceUpdate = Math.abs(this.calculateDaysRemaining(u.date));
      return daysSinceUpdate <= 7;
    }).length
  };

  private statusClasses: StatusClasses = {
    'Compliant': 'bg-success',
    'In Progress': 'bg-primary',
    'Non-Compliant': 'bg-danger',
    'Under Review': 'bg-warning',
    'Completed': 'bg-success',
    'Pending': 'bg-warning',
    'Rejected': 'bg-danger'
  };

  private impactClasses: ImpactClasses = {
    'High': 'text-danger',
    'Medium': 'text-warning',
    'Low': 'text-info'
  };

  getRequirementTitle(requirementId: number): string {
    const requirement = this.requirements.find(r => r.id === requirementId);
    return requirement ? requirement.title : 'Unknown Requirement';
  }

  getStatusClass(status: keyof StatusClasses): string {
    return this.statusClasses[status];
  }

  getImpactClass(impact: keyof ImpactClasses): string {
    return this.impactClasses[impact];
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

  getRequirementsByAuthority(authorityId: number): RegulatoryRequirement[] {
    const authority = this.authorities.find(a => a.id === authorityId);
    return authority ? this.requirements.filter(r => authority.requirements.includes(r.id)) : [];
  }

  getUpdatesByRequirement(requirementId: number): ComplianceUpdate[] {
    return this.updates.filter(u => u.requirementId === requirementId);
  }
}
