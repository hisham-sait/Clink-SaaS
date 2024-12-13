import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ComplianceTask {
  id: number;
  title: string;
  category: 'Regulatory' | 'Legal' | 'Internal' | 'External';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Overdue';
  dueDate: Date;
  assignedTo: string;
  description: string;
  progress: number;
  dependencies: string[];
  attachments: number;
}

interface Milestone {
  id: number;
  title: string;
  dueDate: Date;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
  tasks: number[];
  owner: string;
  description: string;
  progress: number;
}

interface RiskAlert {
  id: number;
  title: string;
  level: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Review' | 'Mitigated' | 'Closed';
  category: string;
  identifiedDate: Date;
  assignedTo: string;
  description: string;
  mitigation: string;
}

type TaskStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Overdue';
type MilestoneStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
type RiskStatus = 'Open' | 'In Review' | 'Mitigated' | 'Closed';

type StatusClasses = {
  [K in TaskStatus | MilestoneStatus | RiskStatus]: string;
};

type PriorityClasses = {
  [key in 'Critical' | 'High' | 'Medium' | 'Low']: string;
};

@Component({
  selector: 'app-compliance-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TrackingComponent {
  tasks: ComplianceTask[] = [
    {
      id: 1,
      title: 'GDPR Compliance Review',
      category: 'Regulatory',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      assignedTo: 'Sarah Johnson',
      description: 'Conduct quarterly GDPR compliance review',
      progress: 60,
      dependencies: ['Data Mapping Update', 'Privacy Policy Review'],
      attachments: 3
    },
    {
      id: 2,
      title: 'Annual Policy Update',
      category: 'Internal',
      priority: 'Medium',
      status: 'Not Started',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      assignedTo: 'Michael Brown',
      description: 'Update internal compliance policies',
      progress: 0,
      dependencies: ['Policy Review', 'Stakeholder Feedback'],
      attachments: 1
    },
    {
      id: 3,
      title: 'ISO Certification Prep',
      category: 'External',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      assignedTo: 'David Wilson',
      description: 'Prepare documentation for ISO certification',
      progress: 35,
      dependencies: ['Documentation Review', 'Process Audit'],
      attachments: 5
    }
  ];

  milestones: Milestone[] = [
    {
      id: 1,
      title: 'Q2 Compliance Review',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: 'In Progress',
      tasks: [1, 2],
      owner: 'Sarah Johnson',
      description: 'Complete Q2 compliance review and documentation',
      progress: 45
    },
    {
      id: 2,
      title: 'Annual Certification',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      status: 'Upcoming',
      tasks: [3],
      owner: 'David Wilson',
      description: 'Complete annual compliance certification process',
      progress: 15
    }
  ];

  riskAlerts: RiskAlert[] = [
    {
      id: 1,
      title: 'Data Protection Gap',
      level: 'High',
      status: 'Open',
      category: 'Privacy',
      identifiedDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      assignedTo: 'Sarah Johnson',
      description: 'Identified potential data protection compliance gap',
      mitigation: 'Implementing additional security controls'
    },
    {
      id: 2,
      title: 'Policy Implementation Delay',
      level: 'Medium',
      status: 'In Review',
      category: 'Internal Controls',
      identifiedDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      assignedTo: 'Michael Brown',
      description: 'Delay in implementing new compliance policies',
      mitigation: 'Accelerating review process'
    }
  ];

  statistics = {
    totalTasks: this.tasks.length,
    completedTasks: this.tasks.filter(t => t.status === 'Completed').length,
    overdueTasks: this.tasks.filter(t => t.status === 'Overdue').length,
    upcomingMilestones: this.milestones.filter(m => m.status === 'Upcoming').length,
    openRisks: this.riskAlerts.filter(r => r.status === 'Open').length,
    averageProgress: Math.round(this.tasks.reduce((sum, t) => sum + t.progress, 0) / this.tasks.length)
  };

  private statusClasses: StatusClasses = {
    'Not Started': 'bg-secondary',
    'In Progress': 'bg-primary',
    'Under Review': 'bg-info',
    'Completed': 'bg-success',
    'Overdue': 'bg-danger',
    'Upcoming': 'bg-info',
    'Delayed': 'bg-warning',
    'Open': 'bg-danger',
    'In Review': 'bg-warning',
    'Mitigated': 'bg-info',
    'Closed': 'bg-success'
  };

  private priorityClasses: PriorityClasses = {
    'Critical': 'text-danger fw-bold',
    'High': 'text-danger',
    'Medium': 'text-warning',
    'Low': 'text-info'
  };

  getStatusClass(status: TaskStatus | MilestoneStatus | RiskStatus): string {
    return this.statusClasses[status];
  }

  getPriorityClass(priority: 'Critical' | 'High' | 'Medium' | 'Low'): string {
    return this.priorityClasses[priority];
  }

  calculateDaysRemaining(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: Date): boolean {
    return this.calculateDaysRemaining(dueDate) < 0;
  }

  isDueSoon(dueDate: Date): boolean {
    const daysRemaining = this.calculateDaysRemaining(dueDate);
    return daysRemaining >= 0 && daysRemaining <= 7;
  }
}
