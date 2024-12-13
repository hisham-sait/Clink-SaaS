import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ComplianceStats {
  totalRequirements: number;
  completedRequirements: number;
  pendingAudits: number;
  activePolicies: number;
  riskLevel: string;
  lastUpdated: Date;
}

interface ESGMetrics {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  carbonFootprint: string;
  sustainabilityRating: string;
}

interface GovernanceStats {
  boardMeetings: number;
  committeeMeetings: number;
  policiesReviewed: number;
  riskAssessments: number;
}

interface ComplianceTracking {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  overdueItems: number;
}

interface Deadline {
  title: string;
  date: Date;
  priority: 'High' | 'Medium' | 'Low';
}

interface Filing {
  name: string;
  dueDate: Date;
  status: 'In Progress' | 'Not Started' | 'Under Review' | 'Completed';
}

interface Audit {
  name: string;
  date: Date;
  status: 'Completed' | 'In Review' | 'Pending';
  findings: number;
}

interface RegulatoryUpdate {
  title: string;
  date: Date;
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-compliance-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent {
  complianceStats: ComplianceStats = {
    totalRequirements: 45,
    completedRequirements: 32,
    pendingAudits: 3,
    activePolicies: 12,
    riskLevel: 'Low',
    lastUpdated: new Date()
  };

  esgMetrics: ESGMetrics = {
    environmentalScore: 85,
    socialScore: 78,
    governanceScore: 92,
    carbonFootprint: '12.5 tons',
    sustainabilityRating: 'A-'
  };

  governanceStats: GovernanceStats = {
    boardMeetings: 4,
    committeeMeetings: 12,
    policiesReviewed: 8,
    riskAssessments: 6
  };

  complianceTracking: ComplianceTracking = {
    totalTasks: 68,
    completedTasks: 45,
    upcomingDeadlines: 5,
    overdueItems: 2
  };

  upcomingDeadlines: Deadline[] = [
    {
      title: 'Annual Compliance Review',
      date: new Date(new Date().setDate(new Date().getDate() + 15)),
      priority: 'High'
    },
    {
      title: 'Policy Update Submission',
      date: new Date(new Date().setDate(new Date().getDate() + 30)),
      priority: 'Medium'
    },
    {
      title: 'Staff Training Completion',
      date: new Date(new Date().setDate(new Date().getDate() + 45)),
      priority: 'Medium'
    }
  ];

  upcomingFilings: Filing[] = [
    {
      name: 'Annual Compliance Report',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: 'In Progress'
    },
    {
      name: 'Quarterly ESG Disclosure',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 25)),
      status: 'Not Started'
    },
    {
      name: 'Board Meeting Minutes',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      status: 'Under Review'
    }
  ];

  recentAudits: Audit[] = [
    {
      name: 'Internal Control Audit',
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      status: 'Completed',
      findings: 3
    },
    {
      name: 'Data Privacy Assessment',
      date: new Date(new Date().setDate(new Date().getDate() - 15)),
      status: 'In Review',
      findings: 2
    },
    {
      name: 'Policy Compliance Check',
      date: new Date(new Date().setDate(new Date().getDate() - 30)),
      status: 'Completed',
      findings: 0
    }
  ];

  regulatoryUpdates: RegulatoryUpdate[] = [
    {
      title: 'GDPR Compliance Update',
      date: new Date(new Date().setDate(new Date().getDate() + 15)),
      priority: 'High'
    },
    {
      title: 'ISO 27001 Certification Renewal',
      date: new Date(new Date().setDate(new Date().getDate() + 30)),
      priority: 'Medium'
    },
    {
      title: 'Financial Conduct Authority Report',
      date: new Date(new Date().setDate(new Date().getDate() + 45)),
      priority: 'High'
    }
  ];
}
