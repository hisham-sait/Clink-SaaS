import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Logo and Title -->
    <div class="text-center mb-4">
      <i class="bi bi-shield-lock display-4 text-primary mb-3"></i>
      <h4 class="mb-2">Forgot Password?</h4>
      <p class="text-muted mb-0">Enter your email to reset your password</p>
    </div>

    <!-- Reset Form -->
    <form (ngSubmit)="onSubmit()" #forgotPasswordForm="ngForm">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input 
          type="email" 
          class="form-control" 
          id="email" 
          [(ngModel)]="email" 
          name="email" 
          required
          [class.is-invalid]="error"
          placeholder="Enter your email"
        >
        <div class="invalid-feedback" *ngIf="error">
          {{ errorMessage }}
        </div>
      </div>

      <button 
        type="submit" 
        class="btn btn-primary w-100 mb-3"
        [disabled]="isLoading || !forgotPasswordForm.form.valid"
      >
        <span 
          class="spinner-border spinner-border-sm me-2" 
          *ngIf="isLoading"
        ></span>
        {{ isLoading ? 'Sending...' : 'Reset Password' }}
      </button>

      <p class="text-center mb-0">
        Remember your password? 
        <a routerLink="/login" class="text-decoration-none">Sign in</a>
      </p>
    </form>

    <!-- Success Alert -->
    <div 
      class="alert alert-success mt-3" 
      *ngIf="isSuccess"
    >
      <i class="bi bi-check-circle me-2"></i>
      Password reset instructions have been sent to your email.
    </div>
  `
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading = false;
  error = false;
  errorMessage = 'Failed to send reset instructions. Please try again.';
  isSuccess = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = false;
    this.isSuccess = false;

    try {
      await this.authService.forgotPassword(this.email);
      this.isSuccess = true;
      // Redirect to login after showing success message
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error) {
      console.error('Forgot password error:', error);
      this.error = true;
      if (error instanceof Error) {
        this.errorMessage = error.message;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
