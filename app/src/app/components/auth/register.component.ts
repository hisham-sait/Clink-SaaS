import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Logo and Title -->
    <div class="text-center mb-4">
      <i class="bi bi-building display-4 text-primary mb-3"></i>
      <h4 class="mb-2">Create an Account</h4>
      <p class="text-muted mb-0">Register your company with Bradán</p>
    </div>

    <!-- Registration Form -->
    <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
      <!-- Company Details -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3 text-primary">Company Details</h6>
        <div class="mb-3">
          <label for="companyName" class="form-label">Company Name</label>
          <input 
            type="text" 
            class="form-control" 
            id="companyName" 
            [(ngModel)]="companyData.name" 
            name="companyName" 
            required
            placeholder="Enter company name"
            [class.is-invalid]="registerError && !companyData.name"
          >
          <div class="invalid-feedback">Company name is required</div>
        </div>
        <div class="mb-3">
          <label for="companyNumber" class="form-label">Company Number</label>
          <input 
            type="text" 
            class="form-control" 
            id="companyNumber" 
            [(ngModel)]="companyData.number" 
            name="companyNumber" 
            required
            placeholder="Enter company registration number"
            [class.is-invalid]="registerError && !companyData.number"
          >
          <div class="invalid-feedback">Company number is required</div>
        </div>
      </div>

      <!-- Admin Details -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3 text-primary">Admin Details</h6>
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <label for="firstName" class="form-label">First Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="firstName" 
              [(ngModel)]="adminData.firstName" 
              name="firstName" 
              required
              placeholder="Enter first name"
              [class.is-invalid]="registerError && !adminData.firstName"
            >
            <div class="invalid-feedback">First name is required</div>
          </div>
          <div class="col-sm-6">
            <label for="lastName" class="form-label">Last Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="lastName" 
              [(ngModel)]="adminData.lastName" 
              name="lastName" 
              required
              placeholder="Enter last name"
              [class.is-invalid]="registerError && !adminData.lastName"
            >
            <div class="invalid-feedback">Last name is required</div>
          </div>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            [(ngModel)]="adminData.email" 
            name="email" 
            required
            placeholder="Enter email address"
            [class.is-invalid]="registerError"
          >
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            [(ngModel)]="adminData.password" 
            name="password" 
            required
            placeholder="Create a password"
            [class.is-invalid]="registerError"
          >
          <div class="invalid-feedback" *ngIf="registerError">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="mb-4">
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="terms"
            [(ngModel)]="acceptedTerms"
            name="terms"
            required
            [class.is-invalid]="registerError && !acceptedTerms"
          >
          <label class="form-check-label" for="terms">
            I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
          </label>
          <div class="invalid-feedback">You must accept the terms and conditions</div>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="btn btn-primary w-100 mb-3"
        [disabled]="isLoading || !registerForm.form.valid || !acceptedTerms"
      >
        <span 
          class="spinner-border spinner-border-sm me-2" 
          *ngIf="isLoading"
        ></span>
        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>

      <p class="text-center mb-0">
        Already have an account? 
        <a routerLink="/login" class="text-decoration-none">Sign in</a>
      </p>
    </form>
  `
})
export class RegisterComponent {
  companyData = {
    name: '',
    number: ''
  };

  adminData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  acceptedTerms = false;
  isLoading = false;
  registerError = false;
  errorMessage = 'Registration failed. Please try again.';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    if (this.isLoading || !this.acceptedTerms) return;
    
    this.isLoading = true;
    this.registerError = false;

    try {
      await this.authService.register(this.companyData, this.adminData);
      
      // Get user's role and redirect to appropriate dashboard
      const userRole = this.authService.getUserRole();
      if (userRole) {
        this.router.navigate([`/dashboard/${userRole}`]);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.registerError = true;
      if (error instanceof Error) {
        this.errorMessage = error.message;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
