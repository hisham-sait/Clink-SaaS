import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-emissions',
  templateUrl: './emissions.component.html',
  styleUrls: ['./emissions.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EmissionsComponent {
  // Emission categories
  categories = [
    { id: 1, name: 'Energy', icon: 'lightning-charge' },
    { id: 2, name: 'Transport', icon: 'truck' },
    { id: 3, name: 'Waste', icon: 'trash' },
    { id: 4, name: 'Water', icon: 'droplet' },
    { id: 5, name: 'Materials', icon: 'box' }
  ];

  // Recent emissions
  recentEmissions = [
    {
      id: 1,
      date: '2024-01-15',
      category: 'Energy',
      amount: 2.5,
      description: 'Office electricity consumption'
    },
    {
      id: 2,
      date: '2024-01-14',
      category: 'Transport',
      amount: 1.8,
      description: 'Business travel - flight'
    },
    {
      id: 3,
      date: '2024-01-13',
      category: 'Waste',
      amount: 0.5,
      description: 'Paper waste'
    }
  ];

  // New emission form data
  newEmission = {
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  };

  // Methods
  addEmission() {
    // TODO: Implement emission recording logic
    console.log('Recording new emission:', this.newEmission);
    
    // Reset form after submission
    this.newEmission = {
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
  }

  calculateTotal() {
    return this.recentEmissions.reduce((sum, emission) => sum + emission.amount, 0);
  }

  deleteEmission(id: number) {
    // TODO: Implement deletion logic
    console.log('Deleting emission:', id);
    this.recentEmissions = this.recentEmissions.filter(e => e.id !== id);
  }
}
