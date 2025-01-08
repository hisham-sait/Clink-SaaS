import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viewer-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Company Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">{{ companyName }}</h5>
                  <p class="text-muted mb-0">Company Overview</p>
                </div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-building fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Registration</h6>
                      <h4 class="mb-0">{{ registrationNumber }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-people fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Employees</h6>
                      <h4 class="mb-0">{{ employeeCount }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-geo-alt fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Location</h6>
                      <h4 class="mb-0">{{ location }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-calendar-check fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Founded</h6>
                      <h4 class="mb-0">{{ foundedYear }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Documents -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Recent Documents</h5>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let document of recentDocuments">
                  <div class="d-flex align-items-center">
                    <div [class]="'bg-' + document.type + ' bg-opacity-10 p-2 rounded'">
                      <i [class]="'bi ' + document.icon + ' text-' + document.type"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">{{ document.title }}</h6>
                      <small class="text-muted">{{ document.date }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Statistics -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Company Statistics</h5>
              <div class="mb-4" *ngFor="let stat of companyStats">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ stat.label }}</span>
                  <span>{{ stat.value }}%</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [class]="'bg-' + stat.type"
                       [style.width.%]="stat.value"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Information -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Key Information</h5>
              <div class="row g-4">
                <div class="col-md-4" *ngFor="let info of keyInformation">
                  <div class="card border">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-3">
                        <div [class]="'bg-' + info.type + ' bg-opacity-10 p-3 rounded'">
                          <i [class]="'bi ' + info.icon + ' fs-4 text-' + info.type"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-1">{{ info.title }}</h6>
                          <small class="text-muted">{{ info.subtitle }}</small>
                        </div>
                      </div>
                      <p class="mb-0 text-muted">{{ info.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class ViewerDashboardComponent {
  // Mock data
  companyName = 'Tech Solutions Ltd';
  registrationNumber = 'IE123456';
  employeeCount = 48;
  location = 'Dublin';
  foundedYear = 2018;

  recentDocuments = [
    {
      title: 'Annual Financial Report 2023',
      date: 'March 15, 2024',
      type: 'primary',
      icon: 'bi-file-earmark-text'
    },
    {
      title: 'Board Meeting Minutes',
      date: 'March 10, 2024',
      type: 'info',
      icon: 'bi-file-text'
    },
    {
      title: 'Tax Compliance Certificate',
      date: 'March 5, 2024',
      type: 'success',
      icon: 'bi-file-check'
    },
    {
      title: 'Company Structure Document',
      date: 'March 1, 2024',
      type: 'warning',
      icon: 'bi-diagram-3'
    }
  ];

  companyStats = [
    {
      label: 'Compliance Rate',
      value: 92,
      type: 'success'
    },
    {
      label: 'Document Completion',
      value: 78,
      type: 'primary'
    },
    {
      label: 'Filing Accuracy',
      value: 95,
      type: 'info'
    },
    {
      label: 'Reporting Timeliness',
      value: 88,
      type: 'warning'
    }
  ];

  keyInformation = [
    {
      title: 'Corporate Structure',
      subtitle: 'Private Limited Company',
      description: 'Technology solutions and consulting services provider specializing in digital transformation.',
      type: 'primary',
      icon: 'bi-building'
    },
    {
      title: 'Compliance Status',
      subtitle: 'Fully Compliant',
      description: 'All regulatory requirements met and up-to-date with necessary filings.',
      type: 'success',
      icon: 'bi-shield-check'
    },
    {
      title: 'Business Operations',
      subtitle: 'Multiple Departments',
      description: 'Operating across software development, consulting, and managed services divisions.',
      type: 'info',
      icon: 'bi-gear'
    }
  ];
}
