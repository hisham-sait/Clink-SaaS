import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Director Details</h1>
          <p class="text-muted mb-0">View and manage director information</p>
        </div>
        <button class="btn btn-outline-primary" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>
          Back to Directors
        </button>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="row mb-4">
            <div class="col">
              <h3>{{ director?.title }} {{ director?.firstName }} {{ director?.lastName }}</h3>
              <span class="badge" [class.bg-success]="director?.status === 'Active'" [class.bg-secondary]="director?.status === 'Resigned'">
                {{ director?.status }}
              </span>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="text-muted mb-3">Personal Information</h6>
              <dl>
                <dt>Date of Birth</dt>
                <dd>{{ formatDate(director?.dateOfBirth) }}</dd>
                <dt>Nationality</dt>
                <dd>{{ director?.nationality }}</dd>
                <dt>Address</dt>
                <dd>{{ director?.address }}</dd>
                <dt>Occupation</dt>
                <dd>{{ director?.occupation }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted mb-3">Director Information</h6>
              <dl>
                <dt>Director Type</dt>
                <dd>{{ director?.directorType }}</dd>
                <dt>Appointment Date</dt>
                <dd>{{ formatDate(director?.appointmentDate) }}</dd>
                <dt>Service Duration</dt>
                <dd>{{ getServiceDuration(director?.appointmentDate, director?.resignationDate) }}</dd>
                <dt>Shareholding</dt>
                <dd>{{ director?.shareholding || 'None' }}</dd>
              </dl>
            </div>
          </div>

          <div class="row" *ngIf="director?.otherDirectorships">
            <div class="col">
              <h6 class="text-muted mb-3">Other Directorships</h6>
              <p>{{ director?.otherDirectorships }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
    dt {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #6c757d;
    }
    dd {
      margin-bottom: 1rem;
    }
  `]
})
export class ViewComponent implements OnInit {
  director: Director | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const state = history.state;
    if (state && state.director) {
      this.director = state.director;
    } else {
      this.goBack();
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getServiceDuration(appointmentDate?: string, resignationDate?: string): string {
    if (!appointmentDate) return '';
    const start = new Date(appointmentDate);
    const end = resignationDate ? new Date(resignationDate) : new Date();
    const years = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
    return `${years} years`;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
