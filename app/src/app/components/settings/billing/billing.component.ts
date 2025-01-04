import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-settings-billing',
  template: `
    <div class="container-fluid p-4">
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-2">Billing & Subscription</h2>
          <p class="text-secondary mb-0">Manage your subscription plan and payment methods</p>
        </div>
      </div>

      <!-- Current Plan -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 class="mb-1">Current Plan</h5>
              <p class="text-secondary mb-0">Professional Plan</p>
            </div>
            <span class="badge bg-success">Active</span>
          </div>
          <div class="row g-4">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="text-secondary small">Billing Period</label>
                <p class="mb-0">Monthly</p>
              </div>
              <div class="mb-3">
                <label class="text-secondary small">Next Billing Date</label>
                <p class="mb-0">February 1, 2024</p>
              </div>
              <div class="mb-3">
                <label class="text-secondary small">Amount</label>
                <p class="mb-0">$49.99/month</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="text-secondary small">Users</label>
                <p class="mb-0">5 of 10 seats used</p>
              </div>
              <div class="mb-3">
                <label class="text-secondary small">Storage</label>
                <p class="mb-0">50GB of 100GB used</p>
              </div>
              <div class="mb-3">
                <label class="text-secondary small">Features</label>
                <p class="mb-0">All Professional features included</p>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <button class="btn btn-outline-primary me-2">Change Plan</button>
            <button class="btn btn-outline-danger">Cancel Subscription</button>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 class="mb-1">Payment Methods</h5>
              <p class="text-secondary mb-0">Manage your payment methods</p>
            </div>
            <button class="btn btn-primary">
              <i class="bi bi-plus-lg me-2"></i>Add Payment Method
            </button>
          </div>
          <div class="list-group">
            <!-- Default Card -->
            <div class="list-group-item border-0 bg-light rounded mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-credit-card fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">•••• •••• •••• 4242</h6>
                    <p class="text-secondary small mb-0">Expires 12/25 - Default</p>
                  </div>
                </div>
                <div>
                  <button class="btn btn-outline-secondary btn-sm me-2">Edit</button>
                  <button class="btn btn-outline-danger btn-sm">Remove</button>
                </div>
              </div>
            </div>

            <!-- Additional Card -->
            <div class="list-group-item border-0 bg-light rounded">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-credit-card fs-4"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">•••• •••• •••• 8888</h6>
                    <p class="text-secondary small mb-0">Expires 08/24</p>
                  </div>
                </div>
                <div>
                  <button class="btn btn-outline-primary btn-sm me-2">Make Default</button>
                  <button class="btn btn-outline-secondary btn-sm me-2">Edit</button>
                  <button class="btn btn-outline-danger btn-sm">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <h5 class="mb-4">Billing History</h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jan 1, 2024</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.99</td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-download me-1"></i>Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Dec 1, 2023</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.99</td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-download me-1"></i>Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Nov 1, 2023</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.99</td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-download me-1"></i>Download
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
export class SettingsBillingComponent {
  constructor(private modalService: NgbModal) {}
}
