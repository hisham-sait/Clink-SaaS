import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ESGMetric {
  id: number;
  category: 'Environmental' | 'Social' | 'Governance';
  metric: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  status: 'On Track' | 'At Risk' | 'Off Track';
  description: string;
}

interface ESGInitiative {
  id: number;
  title: string;
  category: 'Environmental' | 'Social' | 'Governance';
  status: 'Planned' | 'In Progress' | 'Completed';
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  progress: number;
}

type StatusClasses = {
  [key in 'On Track' | 'At Risk' | 'Off Track' | 'Planned' | 'In Progress' | 'Completed']: string;
};

type CategoryIcons = {
  [key in 'Environmental' | 'Social' | 'Governance']: string;
};

@Component({
  selector: 'app-compliance-esg',
  templateUrl: './esg.component.html',
  styleUrls: ['./esg.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ESGComponent {
  metrics: ESGMetric[] = [
    {
      id: 1,
      category: 'Environmental',
      metric: 'Carbon Emissions',
      value: 125,
      unit: 'tons CO2e',
      target: 100,
      trend: 'down',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 5)),
      status: 'At Risk',
      description: 'Total carbon emissions from operations'
    },
    {
      id: 2,
      category: 'Social',
      metric: 'Employee Training Hours',
      value: 2500,
      unit: 'hours',
      target: 3000,
      trend: 'up',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 2)),
      status: 'On Track',
      description: 'Total training hours completed by employees'
    },
    {
      id: 3,
      category: 'Governance',
      metric: 'Board Diversity',
      value: 40,
      unit: '%',
      target: 50,
      trend: 'up',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 30)),
      status: 'On Track',
      description: 'Percentage of board members from diverse backgrounds'
    }
  ];

  initiatives: ESGInitiative[] = [
    {
      id: 1,
      title: 'Solar Panel Installation',
      category: 'Environmental',
      status: 'In Progress',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      budget: 100000,
      spent: 45000,
      impact: 'High',
      description: 'Installation of solar panels to reduce carbon footprint',
      progress: 45
    },
    {
      id: 2,
      title: 'Community Outreach Program',
      category: 'Social',
      status: 'Planned',
      startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      budget: 50000,
      spent: 0,
      impact: 'Medium',
      description: 'Program to engage with local communities',
      progress: 0
    },
    {
      id: 3,
      title: 'Board Restructuring',
      category: 'Governance',
      status: 'Completed',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      budget: 75000,
      spent: 72000,
      impact: 'High',
      description: 'Restructuring board composition for better governance',
      progress: 100
    }
  ];

  statistics = {
    environmentalScore: 85,
    socialScore: 78,
    governanceScore: 92,
    totalInitiatives: this.initiatives.length,
    completedInitiatives: this.initiatives.filter(i => i.status === 'Completed').length,
    totalBudget: this.initiatives.reduce((sum, init) => sum + init.budget, 0),
    totalSpent: this.initiatives.reduce((sum, init) => sum + init.spent, 0)
  };

  private statusClasses: StatusClasses = {
    'On Track': 'bg-success',
    'At Risk': 'bg-warning',
    'Off Track': 'bg-danger',
    'Planned': 'bg-info',
    'In Progress': 'bg-primary',
    'Completed': 'bg-success'
  };

  private categoryIcons: CategoryIcons = {
    'Environmental': 'bi-tree',
    'Social': 'bi-people',
    'Governance': 'bi-building'
  };

  getStatusClass(status: keyof StatusClasses): string {
    return this.statusClasses[status];
  }

  getCategoryIcon(category: keyof CategoryIcons): string {
    return this.categoryIcons[category];
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    return {
      'up': 'bi-arrow-up-circle-fill text-success',
      'down': 'bi-arrow-down-circle-fill text-danger',
      'stable': 'bi-dash-circle-fill text-warning'
    }[trend];
  }

  calculateProgress(value: number, target: number): number {
    return Math.min(Math.round((value / target) * 100), 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
