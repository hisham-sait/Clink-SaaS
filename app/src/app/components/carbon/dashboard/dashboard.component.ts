import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carbon-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CarbonDashboardComponent {
  // Carbon metrics
  totalEmissions = 0;
  offsetProgress = 0;
  sustainabilityScore = 0;
  
  // Chart data
  emissionsByCategory = {
    labels: ['Energy', 'Transport', 'Waste', 'Other'],
    data: [40, 30, 20, 10]
  };

  monthlyTrends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [100, 95, 88, 85, 82, 80]
  };

  constructor() {
    // Initialize dashboard data
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // TODO: Load real data from service
    this.totalEmissions = 150.5; // tons CO2e
    this.offsetProgress = 65; // percentage
    this.sustainabilityScore = 78; // out of 100
  }
}
