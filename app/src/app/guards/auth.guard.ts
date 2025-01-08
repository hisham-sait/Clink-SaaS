import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated and token is valid
    if (this.authService.isAuthenticated()) {
      // Get required roles from route data
      const requiredRoles = route.data['roles'] as string[];
      
      // If no roles required, allow access
      if (!requiredRoles) {
        return true;
      }

      // Check if user has required roles
      if (this.authService.hasAnyRole(requiredRoles)) {
        return true;
      }

      // User doesn't have required roles
      const userRole = this.authService.getUserRole();
      
      if (userRole) {
        // If accessing root, redirect to role-specific dashboard
        if (state.url === '/') {
          this.router.navigate([`/dashboard/${userRole}`]);
          return false;
        }
        
        // If accessing unauthorized dashboard, redirect to user's dashboard
        if (state.url.startsWith('/dashboard/')) {
          this.router.navigate([`/dashboard/${userRole}`]);
          return false;
        }

        // For other unauthorized routes, redirect to user's dashboard
        this.router.navigate([`/dashboard/${userRole}`]);
        return false;
      }

      // If no specific role found, redirect to login
      this.router.navigate(['/login']);
      return false;
    }

    // Store attempted URL for redirection after login
    const returnUrl = state.url === '/' ? undefined : state.url;
    const queryParams = returnUrl ? { queryParams: { returnUrl } } : undefined;
    
    // Not logged in or token expired, redirect to login
    this.router.navigate(['/login'], queryParams);
    return false;
  }
}
