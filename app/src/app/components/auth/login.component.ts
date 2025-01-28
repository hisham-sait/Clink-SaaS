import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

interface QuickLoginUser {
  email: string;
  password: string;
  label: string;
  variant: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Logo and Welcome Text -->
    <div class="text-center mb-4">
      <i class="bi bi-building display-4 text-primary mb-3"></i>
      <h4 class="mb-2">Welcome back!</h4>
      <p class="text-muted mb-0">Sign in to continue to Bradán</p>
    </div>

    <!-- Login Form -->
    <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input 
          type="email" 
          class="form-control" 
          id="email" 
          [(ngModel)]="email" 
          name="email" 
          required
          [class.is-invalid]="loginError"
          placeholder="Enter your email"
        >
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input 
          type="password" 
          class="form-control" 
          id="password" 
          [(ngModel)]="password" 
          name="password" 
          required
          [class.is-invalid]="loginError"
          placeholder="Enter your password"
        >
        <div class="invalid-feedback" *ngIf="loginError">
          Invalid email or password
        </div>
      </div>

      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="remember">
          <label class="form-check-label" for="remember">Remember me</label>
        </div>
        <a routerLink="/forgot-password" class="text-decoration-none">Forgot password?</a>
      </div>

      <button 
        type="submit" 
        class="btn btn-primary w-100 mb-3"
        [disabled]="isLoading || !loginForm.form.valid"
      >
        <span 
          class="spinner-border spinner-border-sm me-2" 
          *ngIf="isLoading"
        ></span>
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </button>

      <p class="text-center mb-0">
        Don't have an account? 
        <a routerLink="/register" class="text-decoration-none">Sign up</a>
      </p>
    </form>

    <!-- Quick Login Section -->
    <div class="mt-4">
      <p class="text-center text-muted small mb-2">Quick Login</p>
      
      <!-- Platform Level -->
      <div class="d-flex gap-1 mb-1">
        <button 
          *ngFor="let user of platformUsers"
          (click)="quickLogin(user)"
          class="btn btn-outline-{{ user.variant }} btn-sm flex-grow-1"
          [disabled]="isLoading"
          style="font-size: 0.7rem;"
        >
          {{ user.label }}
        </button>
      </div>

      <!-- Company Level -->
      <div class="d-flex gap-1 mb-1">
        <button 
          *ngFor="let user of companyUsers"
          (click)="quickLogin(user)"
          class="btn btn-outline-{{ user.variant }} btn-sm flex-grow-1"
          [disabled]="isLoading"
          style="font-size: 0.7rem;"
        >
          {{ user.label }}
        </button>
      </div>

      <!-- Third Party -->
      <div class="d-flex gap-1">
        <button 
          *ngFor="let user of thirdPartyUsers"
          (click)="quickLogin(user)"
          class="btn btn-outline-{{ user.variant }} btn-sm flex-grow-1"
          [disabled]="isLoading"
          style="font-size: 0.7rem;"
        >
          {{ user.label }}
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  loginError: boolean = false;
  returnUrl: string = '/';

  // Quick login users grouped by level
  platformUsers: QuickLoginUser[] = [
    { email: 'superadmin@bradan.com', password: 'superadmin123', label: 'Super', variant: 'danger' },
    { email: 'platformadmin@bradan.com', password: 'platformadmin123', label: 'Platform', variant: 'warning' }
  ];

  companyUsers: QuickLoginUser[] = [
    { email: 'companyadmin@bradan.com', password: 'companyadmin123', label: 'Admin', variant: 'primary' },
    { email: 'manager@bradan.com', password: 'manager123', label: 'Manager', variant: 'info' },
    { email: 'accountant@bradan.com', password: 'accountant123', label: 'Accountant', variant: 'secondary' },
    { email: 'viewer@bradan.com', password: 'viewer123', label: 'Viewer', variant: 'secondary' }
  ];

  thirdPartyUsers: QuickLoginUser[] = [
    { email: 'auditor@bradan.com', password: 'auditor123', label: 'Auditor', variant: 'success' },
    { email: 'taxadvisor@bradan.com', password: 'taxadvisor123', label: 'Tax', variant: 'success' },
    { email: 'legaladvisor@bradan.com', password: 'legaladvisor123', label: 'Legal', variant: 'success' },
    { email: 'consultant@bradan.com', password: 'consultant123', label: 'Consult', variant: 'success' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.loginError = false;

    try {
      await this.authService.login(this.email, this.password);
      
      // Get user's role and redirect to appropriate dashboard
      const userRole = this.authService.getUserRole();
      if (userRole) {
        // If there's a return URL and it's not the root, use it
        if (this.returnUrl && this.returnUrl !== '/') {
          this.router.navigate([this.returnUrl]);
        } else {
          // Otherwise redirect to role-specific dashboard
          this.router.navigate([`/dashboard/${userRole}`]);
        }
      } else {
        // Fallback to root if no role found
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.loginError = true;
    } finally {
      this.isLoading = false;
    }
  }

  async quickLogin(user: QuickLoginUser) {
    this.email = user.email;
    this.password = user.password;
    await this.onSubmit();
  }
}
