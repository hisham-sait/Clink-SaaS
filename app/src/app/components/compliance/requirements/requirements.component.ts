import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Requirement {
  id: number;
  title: string;
  category: 'Legal' | 'Regulatory' | 'Industry' | 'Internal';
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Overdue';
  dueDate: Date;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  progress: number;
}

type StatusClasses = {
  [key in 'Completed' | 'In Progress' | 'Not Started' | 'Overdue']: string;
};

type PriorityClasses = {
  [key in 'High' | 'Medium' | 'Low']: string;
};

@Component({
  selector: 'app-compliance-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RequirementsComponent {
  requirements: Requirement[] = [
    {
      id: 1,
      title: 'Annual Data Protection Audit',
      category: 'Legal',
      status: 'In Progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      assignedTo: 'John Smith',
      priority: 'High',
      description: 'Complete annual audit of data protection measures and GDPR compliance',
      progress: 65
    },
    {
      id: 2,
      title: 'ISO 27001 Certification Renewal',
      category: 'Industry',
      status: 'Not Started',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      assignedTo: 'Sarah Johnson',
      priority: 'High',
      description: 'Prepare and submit documentation for ISO 27001 certification renewal',
      progress: 0
    },
    {
      id: 3,
      title: 'Quarterly Risk Assessment',
      category: 'Internal',
      status: 'Completed',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      assignedTo: 'Mike Wilson',
      priority: 'Medium',
      description: 'Conduct quarterly risk assessment of compliance processes',
      progress: 100
    },
    {
      id: 4,
      title: 'Staff Compliance Training',
      category: 'Regulatory',
      status: 'In Progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      assignedTo: 'Emma Davis',
      priority: 'Medium',
      description: 'Conduct mandatory compliance training for all staff members',
      progress: 45
    },
    {
      id: 5,
      title: 'Policy Updates Review',
      category: 'Internal',
      status: 'Overdue',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      assignedTo: 'David Brown',
      priority: 'High',
      description: 'Review and update internal compliance policies',
      progress: 80
    }
  ];

  filterOptions = {
    categories: ['Legal', 'Regulatory', 'Industry', 'Internal'],
    statuses: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
    priorities: ['High', 'Medium', 'Low']
  };

  statistics = {
    total: this.requirements.length,
    completed: this.requirements.filter(r => r.status === 'Completed').length,
    inProgress: this.requirements.filter(r => r.status === 'In Progress').length,
    notStarted: this.requirements.filter(r => r.status === 'Not Started').length,
    overdue: this.requirements.filter(r => r.status === 'Overdue').length,
    highPriority: this.requirements.filter(r => r.priority === 'High').length
  };

  private statusClasses: StatusClasses = {
    'Completed': 'bg-success',
    'In Progress': 'bg-primary',
    'Not Started': 'bg-secondary',
    'Overdue': 'bg-danger'
  };

  private priorityClasses: PriorityClasses = {
    'High': 'text-danger',
    'Medium': 'text-warning',
    'Low': 'text-info'
  };

  getStatusClass(status: 'Completed' | 'In Progress' | 'Not Started' | 'Overdue'): string {
    return this.statusClasses[status];
  }

  getPriorityClass(priority: 'High' | 'Medium' | 'Low'): string {
    return this.priorityClasses[priority];
  }
}
