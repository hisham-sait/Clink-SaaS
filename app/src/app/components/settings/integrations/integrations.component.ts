import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-settings-integrations',
  template: `
    <div class="container-fluid p-4">
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-2">Integrations</h2>
          <p class="text-secondary mb-0">Connect and manage external services and APIs</p>
        </div>
      </div>

      <!-- Connected Services -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h5 class="mb-4">Connected Services</h5>
          <div class="list-group">
            <!-- Google Calendar -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-google fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">Google Calendar</h6>
                    <p class="text-secondary small mb-0">Connected as john.smith&#64;company.com</p>
                  </div>
                </div>
                <button class="btn btn-outline-danger btn-sm">
                  Disconnect
                </button>
              </div>
            </div>

            <!-- Slack -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-slack fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">Slack</h6>
                    <p class="text-secondary small mb-0">Connected to workspace: Acme Corp</p>
                  </div>
                </div>
                <button class="btn btn-outline-danger btn-sm">
                  Disconnect
                </button>
              </div>
            </div>

            <!-- GitHub -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-github fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">GitHub</h6>
                    <p class="text-secondary small mb-0">Not connected</p>
                  </div>
                </div>
                <button class="btn btn-outline-primary btn-sm">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Keys -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 class="mb-1">API Keys</h5>
              <p class="text-secondary mb-0">Manage your API keys for external services</p>
            </div>
            <button class="btn btn-primary">
              <i class="bi bi-plus-lg me-2"></i>Generate New Key
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Production API Key</td>
                  <td>Jan 1, 2024</td>
                  <td>Today</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm me-2">
                      <i class="bi bi-eye me-1"></i>View
                    </button>
                    <button class="btn btn-outline-danger btn-sm">
                      <i class="bi bi-trash me-1"></i>Revoke
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Development API Key</td>
                  <td>Dec 15, 2023</td>
                  <td>Yesterday</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm me-2">
                      <i class="bi bi-eye me-1"></i>View
                    </button>
                    <button class="btn btn-outline-danger btn-sm">
                      <i class="bi bi-trash me-1"></i>Revoke
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Testing API Key</td>
                  <td>Nov 30, 2023</td>
                  <td>30 days ago</td>
                  <td><span class="badge bg-danger">Revoked</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm me-2">
                      <i class="bi bi-eye me-1"></i>View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Webhooks -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 class="mb-1">Webhooks</h5>
              <p class="text-secondary mb-0">Configure webhook endpoints for real-time updates</p>
            </div>
            <button class="btn btn-primary">
              <i class="bi bi-plus-lg me-2"></i>Add Webhook
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Events</th>
                  <th>Last Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>https://api.example.com/webhooks/orders</td>
                  <td>order.created, order.updated</td>
                  <td>5 minutes ago</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm me-2">
                      <i class="bi bi-gear me-1"></i>Configure
                    </button>
                    <button class="btn btn-outline-danger btn-sm">
                      <i class="bi bi-trash me-1"></i>Delete
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>https://api.example.com/webhooks/users</td>
                  <td>user.created, user.updated</td>
                  <td>1 hour ago</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm me-2">
                      <i class="bi bi-gear me-1"></i>Configure
                    </button>
                    <button class="btn btn-outline-danger btn-sm">
                      <i class="bi bi-trash me-1"></i>Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SettingsIntegrationsComponent {
  constructor(private modalService: NgbModal) {}
}
