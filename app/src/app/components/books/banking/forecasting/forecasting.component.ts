import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Forecast {
  name: string;
  type: 'Revenue' | 'Cash Flow' | 'Expense';
  period: string;
  predicted: number;
  actual: number;
  accuracy: number;
  accuracyColor: string;
  status: 'Active' | 'Completed' | 'Pending';
}

@Component({
  selector: 'app-forecasting',
  templateUrl: './forecasting.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ForecastingComponent {
  revenueForecast = 1250000.00;
  revenueTrend = 'up';
  revenueChange = '+15.8% from last forecast';
  cashFlowForecast = 350000.00;
  cashFlowTrend = 'up';
  cashFlowChange = '+8.5% from last forecast';
  accuracyRate = 92;
  accuracyTrend = 'up';
  accuracyChange = '+2.5% improvement';

  forecasts: Forecast[] = [
    {
      name: 'Q1 Revenue Forecast',
      type: 'Revenue',
      period: 'Q1 2024',
      predicted: 450000.00,
      actual: 458920.00,
      accuracy: 98,
      accuracyColor: 'success',
      status: 'Completed'
    },
    {
      name: 'Annual Cash Flow',
      type: 'Cash Flow',
      period: 'FY 2024',
      predicted: 1500000.00,
      actual: 0,
      accuracy: 85,
      accuracyColor: 'info',
      status: 'Active'
    },
    {
      name: 'Q1 Operating Expenses',
      type: 'Expense',
      period: 'Q1 2024',
      predicted: 250000.00,
      actual: 275000.00,
      accuracy: 90,
      accuracyColor: 'warning',
      status: 'Completed'
    },
    {
      name: 'Monthly Revenue - Jan',
      type: 'Revenue',
      period: 'Jan 2024',
      predicted: 150000.00,
      actual: 0,
      accuracy: 0,
      accuracyColor: 'info',
      status: 'Pending'
    },
    {
      name: 'Q4 Cash Flow Review',
      type: 'Cash Flow',
      period: 'Q4 2023',
      predicted: 350000.00,
      actual: 358750.00,
      accuracy: 97,
      accuracyColor: 'success',
      status: 'Completed'
    }
  ];

  viewForecast(forecast: Forecast): void {
    alert(`Viewing forecast ${forecast.name}... Feature coming soon!`);
  }

  editForecast(forecast: Forecast): void {
    alert(`Editing forecast ${forecast.name}... Feature coming soon!`);
  }

  deleteForecast(forecast: Forecast): void {
    alert(`Deleting forecast ${forecast.name}... Feature coming soon!`);
  }

  runSimulation(): void {
    alert('Simulation feature coming soon!');
  }

  exportForecasts(): void {
    alert('Export forecasts feature coming soon!');
  }

  generateReport(): void {
    alert('Report generation feature coming soon!');
  }
}
