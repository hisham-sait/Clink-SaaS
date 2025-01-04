import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-settings-notifications',
  template: `
    <div class="container-fluid p-4">
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-2">Notification Settings</h2>
          <p class="text-secondary mb-0">Configure how and when you receive notifications</p>
        </div>
      </div>

      <!-- Email Notifications -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h5 class="mb-4">Email Notifications</h5>
          <div class="list-group">
            <!-- Account -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Account Updates</h6>
                  <p class="text-secondary small mb-0">Important updates about your account</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="accountUpdates" checked>
                </div>
              </div>
            </div>

            <!-- Security -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Security Alerts</h6>
                  <p class="text-secondary small mb-0">Security-related notifications and alerts</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="securityAlerts" checked>
                </div>
              </div>
            </div>

            <!-- Marketing -->
            <div class="list-group-item border-0 bg-light rounded">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Marketing Updates</h6>
                  <p class="text-secondary small mb-0">News about products and features</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="marketingUpdates">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Push Notifications -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <h5 class="mb-4">Push Notifications</h5>
          <div class="list-group">
            <!-- Task Updates -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Task Updates</h6>
                  <p class="text-secondary small mb-0">Notifications about task assignments and updates</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="taskUpdates" checked>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Comments</h6>
                  <p class="text-secondary small mb-0">When someone comments on your items</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="comments" checked>
                </div>
              </div>
            </div>

            <!-- Reminders -->
            <div class="list-group-item border-0 bg-light rounded">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">Reminders</h6>
                  <p class="text-secondary small mb-0">Task and deadline reminders</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="reminders" checked>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Schedule -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <h5 class="mb-4">Notification Schedule</h5>
          <div class="row g-4">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Quiet Hours Start</label>
                <select class="form-select">
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20" selected>8:00 PM</option>
                  <option value="21">9:00 PM</option>
                  <option value="22">10:00 PM</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Quiet Hours End</label>
                <select class="form-select">
                  <option value="6">6:00 AM</option>
                  <option value="7" selected>7:00 AM</option>
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                </select>
              </div>
            </div>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" id="weekendsOnly">
            <label class="form-check-label" for="weekendsOnly">
              Apply quiet hours on weekends only
            </label>
          </div>
        </div>
      </div>

      <!-- Save Changes -->
      <div class="mt-4">
        <button class="btn btn-primary">Save Notification Settings</button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SettingsNotificationsComponent {
  constructor(private modalService: NgbModal) {}
}
