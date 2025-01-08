import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-manager-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Team Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">Team Overview</h5>
                  <p class="text-muted mb-0">{{ departmentName }} Department</p>
                </div>
                <button class="btn btn-primary btn-sm">
                  <i class="bi bi-plus-lg me-2"></i>Assign Task
                </button>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-people fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Team Members</h6>
                      <h4 class="mb-0">{{ teamMembers }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-check2-square fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Tasks Completed</h6>
                      <h4 class="mb-0">{{ completedTasks }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-clock fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">In Progress</h6>
                      <h4 class="mb-0">{{ inProgressTasks }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-calendar-event fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Meetings Today</h6>
                      <h4 class="mb-0">{{ meetingsToday }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Progress -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Task Progress</h5>
                <button class="btn btn-sm btn-outline-primary">View All Tasks</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let task of tasks">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + task.priority.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + task.priority.icon + ' text-' + task.priority.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ task.title }}</h6>
                        <small class="text-muted">Assigned to: {{ task.assignee }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + task.priority.type">{{ task.priority.label }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar" 
                         [class]="'bg-' + task.priority.type"
                         [style.width.%]="task.progress"></div>
                  </div>
                  <small class="text-muted d-block mt-2">Due: {{ task.dueDate }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Calendar -->
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Today's Schedule</h5>
                <button class="btn btn-sm btn-outline-primary">Full Calendar</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let event of todayEvents">
                  <div class="d-flex align-items-center">
                    <div [class]="'bg-' + event.type + ' bg-opacity-10 p-2 rounded'">
                      <i [class]="'bi ' + event.icon + ' text-' + event.type"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">{{ event.title }}</h6>
                      <small class="text-muted">{{ event.time }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Members -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Team Members</h5>
              <div class="row g-4">
                <div class="col-md-3" *ngFor="let member of teamMembersList">
                  <div class="card border">
                    <div class="card-body">
                      <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-3">
                          <i class="bi bi-person fs-4"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-1">{{ member.name }}</h6>
                          <p class="text-muted small mb-0">{{ member.role }}</p>
                        </div>
                      </div>
                      <div class="mt-3">
                        <small class="text-muted">Current Tasks: {{ member.currentTasks }}</small>
                        <div class="progress mt-2" style="height: 4px;">
                          <div class="progress-bar" 
                               [style.width.%]="(member.currentTasks / member.maxTasks) * 100"></div>
                        </div>
                      </div>
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
export class CompanyManagerDashboardComponent {
  // Mock data
  departmentName = 'Operations';
  teamMembers = 12;
  completedTasks = 45;
  inProgressTasks = 15;
  meetingsToday = 3;

  tasks = [
    {
      title: 'Q1 Report Review',
      assignee: 'Sarah Johnson',
      progress: 75,
      dueDate: 'Tomorrow, 5:00 PM',
      priority: { label: 'High', type: 'danger', icon: 'bi-exclamation-circle' }
    },
    {
      title: 'Client Meeting Preparation',
      assignee: 'Mike Wilson',
      progress: 45,
      dueDate: 'Today, 3:00 PM',
      priority: { label: 'Medium', type: 'warning', icon: 'bi-exclamation-triangle' }
    },
    {
      title: 'Team Training Session',
      assignee: 'Emily Brown',
      progress: 90,
      dueDate: 'Friday, 11:00 AM',
      priority: { label: 'Low', type: 'success', icon: 'bi-info-circle' }
    },
    {
      title: 'Project Timeline Update',
      assignee: 'John Smith',
      progress: 30,
      dueDate: 'Next Monday',
      priority: { label: 'Medium', type: 'warning', icon: 'bi-exclamation-triangle' }
    }
  ];

  todayEvents = [
    {
      title: 'Team Stand-up',
      time: '9:00 AM',
      type: 'primary',
      icon: 'bi-people'
    },
    {
      title: 'Client Meeting',
      time: '11:30 AM',
      type: 'success',
      icon: 'bi-camera-video'
    },
    {
      title: 'Project Review',
      time: '2:00 PM',
      type: 'info',
      icon: 'bi-file-text'
    },
    {
      title: 'Team Sync',
      time: '4:30 PM',
      type: 'warning',
      icon: 'bi-chat-dots'
    }
  ];

  teamMembersList = [
    { name: 'Sarah Johnson', role: 'Senior Analyst', currentTasks: 3, maxTasks: 5 },
    { name: 'Mike Wilson', role: 'Project Lead', currentTasks: 4, maxTasks: 5 },
    { name: 'Emily Brown', role: 'Business Analyst', currentTasks: 2, maxTasks: 4 },
    { name: 'John Smith', role: 'Operations Specialist', currentTasks: 3, maxTasks: 4 }
  ];
}
