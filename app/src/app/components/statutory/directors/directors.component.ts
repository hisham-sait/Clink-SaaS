import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateDirectorModalComponent } from './create-director-modal/create-director-modal.component';

interface Director {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: 'Active' | 'Resigned';
}

interface Activity {
  type: 'appointment' | 'resignation' | 'update' | 'removal';
  description: string;
  user: string;
  time: string;
}

@Component({
  selector: 'app-directors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, CreateDirectorModalComponent],
  templateUrl: './directors.component.html',
  styleUrls: ['./directors.component.scss']
})
export class DirectorsComponent {
  directors: Director[] = [];
  showAllDirectors = false;
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedDirectors = localStorage.getItem('directors');
    if (savedDirectors) {
      this.directors = JSON.parse(savedDirectors);
    }

    const savedActivities = localStorage.getItem('directorActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddDirectorModal(): void {
    const modalRef = this.modalService.open(CreateDirectorModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newDirector: Director) => {
        this.directors.push(newDirector);
        localStorage.setItem('directors', JSON.stringify(this.directors));

        this.addActivity({
          type: 'appointment',
          description: `${this.getFullName(newDirector)} appointed as ${newDirector.directorType}`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeDirector(index: number): void {
    const director = this.directors[index];
    this.directors.splice(index, 1);
    localStorage.setItem('directors', JSON.stringify(this.directors));

    this.addActivity({
      type: 'removal',
      description: `${this.getFullName(director)} removed from directors register`,
      user: 'System',
      time: new Date().toLocaleString()
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getFullName(director: Director): string {
    return `${director.title} ${director.firstName} ${director.lastName}`;
  }

  markAsResigned(index: number): void {
    const director = this.directors[index];
    director.status = 'Resigned';
    director.resignationDate = new Date().toISOString().split('T')[0];
    localStorage.setItem('directors', JSON.stringify(this.directors));

    this.addActivity({
      type: 'resignation',
      description: `${this.getFullName(director)} resigned from position`,
      user: 'System',
      time: new Date().toLocaleString()
    });
  }

  getServiceDuration(appointmentDate: string, resignationDate?: string): string {
    const start = new Date(appointmentDate);
    const end = resignationDate ? new Date(resignationDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }

  getActiveDirectorsCount(): number {
    return this.directors.filter(d => d.status === 'Active').length;
  }

  getExecutiveDirectorsCount(): number {
    return this.directors.filter(d => 
      d.status === 'Active' && 
      (d.directorType === 'Executive Director' || d.directorType === 'Managing Director')
    ).length;
  }

  getNonExecutiveDirectorsCount(): number {
    return this.directors.filter(d => 
      d.status === 'Active' && 
      (d.directorType === 'Non-Executive Director' || d.directorType === 'Independent Director')
    ).length;
  }

  getAverageTenure(): string {
    const activeDirectors = this.directors.filter(d => d.status === 'Active');
    if (activeDirectors.length === 0) return '0';

    const totalDays = activeDirectors.reduce((sum, director) => {
      const start = new Date(director.appointmentDate);
      const end = new Date();
      return sum + Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    const averageYears = (totalDays / 365 / activeDirectors.length).toFixed(1);
    return averageYears;
  }

  toggleShowAllDirectors(): void {
    this.showAllDirectors = !this.showAllDirectors;
  }

  getFilteredDirectors(): Director[] {
    return this.showAllDirectors 
      ? this.directors 
      : this.directors.filter(d => d.status === 'Active');
  }

  viewDirectorDetails(director: Director, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const index = this.directors.indexOf(director);
    this.router.navigate(['statutory', 'directors', index], { state: { director } });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'appointment':
        return 'bi bi-person-plus';
      case 'resignation':
        return 'bi bi-person-dash';
      case 'update':
        return 'bi bi-pencil';
      case 'removal':
        return 'bi bi-trash';
      default:
        return 'bi bi-activity';
    }
  }

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('directorActivities', JSON.stringify(this.recentActivities));
  }
}
