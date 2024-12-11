import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SustainabilityGoalsComponent {
  // Goals data
  goals = [
    {
      id: 1,
      name: 'Reduce Total Emissions',
      target: 500,
      current: 350,
      unit: 'tCO2e',
      deadline: '2024-12-31',
      status: 'On Track'
    },
    {
      id: 2,
      name: 'Increase Renewable Energy Usage',
      target: 75,
      current: 45,
      unit: '%',
      deadline: '2024-06-30',
      status: 'At Risk'
    },
    {
      id: 3,
      name: 'Zero Waste to Landfill',
      target: 0,
      current: 15,
      unit: 'tons',
      deadline: '2024-09-30',
      status: 'Behind'
    }
  ];

  // Initiatives
  initiatives = [
    {
      id: 1,
      name: 'Office Energy Efficiency',
      description: 'Upgrade to LED lighting and smart thermostats',
      status: 'In Progress',
      impact: 'High',
      completion: 65
    },
    {
      id: 2,
      name: 'Remote Work Policy',
      description: 'Reduce commuting emissions through flexible work',
      status: 'Completed',
      impact: 'Medium',
      completion: 100
    },
    {
      id: 3,
      name: 'Supply Chain Optimization',
      description: 'Partner with eco-friendly suppliers',
      status: 'Planned',
      impact: 'High',
      completion: 0
    }
  ];

  // Methods
  calculateProgress(current: number, target: number): number {
    return (current / target) * 100;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'on track':
        return 'success';
      case 'at risk':
        return 'warning';
      case 'behind':
        return 'danger';
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'planned':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  addGoal() {
    // TODO: Implement goal creation logic
    console.log('Adding new goal');
  }

  addInitiative() {
    // TODO: Implement initiative creation logic
    console.log('Adding new initiative');
  }
}
