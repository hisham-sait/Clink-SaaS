import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-offsets',
  templateUrl: './offsets.component.html',
  styleUrls: ['./offsets.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class OffsetsComponent {
  // Offset projects
  offsetProjects = [
    {
      id: 1,
      name: 'Reforestation Project',
      type: 'Nature-based',
      location: 'Amazon Rainforest',
      credits: 500,
      price: 25,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Wind Farm Development',
      type: 'Renewable Energy',
      location: 'Scotland',
      credits: 1000,
      price: 20,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Solar Power Initiative',
      type: 'Renewable Energy',
      location: 'Spain',
      credits: 750,
      price: 22,
      status: 'Pending'
    }
  ];

  // Purchased offsets
  purchasedOffsets = [
    {
      id: 1,
      projectId: 1,
      credits: 100,
      date: '2024-01-15',
      status: 'Verified'
    },
    {
      id: 2,
      projectId: 2,
      credits: 200,
      date: '2024-01-10',
      status: 'Pending'
    }
  ];

  // Methods
  purchaseOffset(projectId: number, credits: number) {
    // TODO: Implement offset purchase logic
    console.log('Purchasing offset:', { projectId, credits });
  }

  calculateTotalOffsets() {
    return this.purchasedOffsets.reduce((sum, offset) => sum + offset.credits, 0);
  }

  getProjectName(projectId: number) {
    const project = this.offsetProjects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }
}
