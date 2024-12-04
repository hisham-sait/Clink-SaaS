import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProjectsComponent {
  activeProjects = [
    {
      name: 'Website Redesign',
      client: 'ABC Corporation',
      status: 'In Progress',
      budget: 15000,
      spent: 8750,
      dueDate: '2024-02-28',
      progress: 65
    },
    {
      name: 'Mobile App Development',
      client: 'XYZ Ltd',
      status: 'On Hold',
      budget: 25000,
      spent: 12000,
      dueDate: '2024-03-15',
      progress: 45
    },
    {
      name: 'Marketing Campaign',
      client: 'Global Industries',
      status: 'Active',
      budget: 8000,
      spent: 2500,
      dueDate: '2024-02-10',
      progress: 30
    },
    {
      name: 'Software Integration',
      client: 'Tech Solutions',
      status: 'In Progress',
      budget: 20000,
      spent: 15000,
      dueDate: '2024-02-20',
      progress: 80
    }
  ];

  projectMetrics = [
    {
      title: 'Active Projects',
      value: '12',
      trend: 'up',
      change: '+2',
      icon: 'bi bi-briefcase'
    },
    {
      title: 'Total Hours',
      value: '486',
      trend: 'up',
      change: '+45',
      icon: 'bi bi-clock'
    },
    {
      title: 'Budget Utilized',
      value: '68%',
      trend: 'neutral',
      icon: 'bi bi-cash'
    },
    {
      title: 'Overdue Tasks',
      value: '5',
      trend: 'down',
      change: '-2',
      icon: 'bi bi-exclamation-circle'
    }
  ];

  recentActivities = [
    {
      type: 'task',
      description: 'New task added to Website Redesign',
      user: 'John Doe',
      time: '2 hours ago'
    },
    {
      type: 'comment',
      description: 'Comment on Mobile App Development',
      user: 'Sarah Smith',
      time: '4 hours ago'
    },
    {
      type: 'milestone',
      description: 'Milestone completed in Marketing Campaign',
      user: 'Mike Johnson',
      time: '1 day ago'
    },
    {
      type: 'time',
      description: 'Time logged for Software Integration',
      user: 'Emily Brown',
      time: '1 day ago'
    }
  ];

  getActivityIcon(type: string): string {
    const icons = {
      task: 'bi bi-check-circle',
      comment: 'bi bi-chat-dots',
      milestone: 'bi bi-flag',
      time: 'bi bi-clock'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
