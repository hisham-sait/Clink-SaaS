import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface BoardMember {
  id: number;
  name: string;
  position: string;
  committee: string[];
  tenure: number;
  independent: boolean;
  expertise: string[];
  attendance: number;
  lastReview: Date;
}

interface Committee {
  id: number;
  name: string;
  chair: string;
  members: string[];
  meetings: number;
  attendance: number;
  lastMeeting: Date;
  nextMeeting: Date;
  description: string;
}

interface Policy {
  id: number;
  title: string;
  category: 'Board' | 'Executive' | 'Financial' | 'Risk' | 'Compliance';
  status: 'Active' | 'Under Review' | 'Draft';
  lastUpdated: Date;
  nextReview: Date;
  owner: string;
  description: string;
}

type StatusClasses = {
  [key in 'Active' | 'Under Review' | 'Draft']: string;
};

@Component({
  selector: 'app-compliance-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class GovernanceComponent {
  boardMembers: BoardMember[] = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Chairman',
      committee: ['Executive', 'Nomination'],
      tenure: 5,
      independent: true,
      expertise: ['Finance', 'Strategy'],
      attendance: 95,
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 2))
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Non-Executive Director',
      committee: ['Audit', 'Risk'],
      tenure: 3,
      independent: true,
      expertise: ['Risk Management', 'Compliance'],
      attendance: 90,
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 1))
    },
    {
      id: 3,
      name: 'Michael Brown',
      position: 'Executive Director',
      committee: ['Executive'],
      tenure: 4,
      independent: false,
      expertise: ['Operations', 'Technology'],
      attendance: 100,
      lastReview: new Date(new Date().setMonth(new Date().getMonth() - 3))
    }
  ];

  committees: Committee[] = [
    {
      id: 1,
      name: 'Audit Committee',
      chair: 'Sarah Johnson',
      members: ['Sarah Johnson', 'David Wilson', 'Emma Davis'],
      meetings: 6,
      attendance: 95,
      lastMeeting: new Date(new Date().setDate(new Date().getDate() - 15)),
      nextMeeting: new Date(new Date().setDate(new Date().getDate() + 45)),
      description: 'Oversees financial reporting and internal controls'
    },
    {
      id: 2,
      name: 'Risk Committee',
      chair: 'David Wilson',
      members: ['David Wilson', 'Sarah Johnson', 'Michael Brown'],
      meetings: 4,
      attendance: 90,
      lastMeeting: new Date(new Date().setDate(new Date().getDate() - 30)),
      nextMeeting: new Date(new Date().setDate(new Date().getDate() + 30)),
      description: 'Monitors and reviews risk management systems'
    },
    {
      id: 3,
      name: 'Nomination Committee',
      chair: 'John Smith',
      members: ['John Smith', 'Emma Davis', 'Sarah Johnson'],
      meetings: 3,
      attendance: 100,
      lastMeeting: new Date(new Date().setDate(new Date().getDate() - 45)),
      nextMeeting: new Date(new Date().setDate(new Date().getDate() + 15)),
      description: 'Handles board appointments and succession planning'
    }
  ];

  policies: Policy[] = [
    {
      id: 1,
      title: 'Board Composition Policy',
      category: 'Board',
      status: 'Active',
      lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 5)),
      owner: 'John Smith',
      description: 'Guidelines for board structure and composition'
    },
    {
      id: 2,
      title: 'Executive Compensation Policy',
      category: 'Executive',
      status: 'Under Review',
      lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      owner: 'Sarah Johnson',
      description: 'Framework for executive compensation and benefits'
    },
    {
      id: 3,
      title: 'Risk Management Framework',
      category: 'Risk',
      status: 'Active',
      lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      nextReview: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      owner: 'David Wilson',
      description: 'Corporate risk management guidelines'
    }
  ];

  statistics = {
    totalBoardMembers: this.boardMembers.length,
    independentDirectors: this.boardMembers.filter(m => m.independent).length,
    averageAttendance: Math.round(this.boardMembers.reduce((sum, m) => sum + m.attendance, 0) / this.boardMembers.length),
    totalCommittees: this.committees.length,
    totalMeetings: this.committees.reduce((sum, c) => sum + c.meetings, 0),
    activePolicies: this.policies.filter(p => p.status === 'Active').length
  };

  private statusClasses: StatusClasses = {
    'Active': 'bg-success',
    'Under Review': 'bg-warning',
    'Draft': 'bg-info'
  };

  getStatusClass(status: keyof StatusClasses): string {
    return this.statusClasses[status];
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

  getAttendanceClass(attendance: number): string {
    if (attendance >= 90) return 'text-success';
    if (attendance >= 75) return 'text-warning';
    return 'text-danger';
  }
}
