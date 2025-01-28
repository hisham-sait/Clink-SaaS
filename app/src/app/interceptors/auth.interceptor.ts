import {
  HttpRequest,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for login/register/forgot-password endpoints
  if (request.url.includes('/auth/login') || 
      request.url.includes('/auth/register') || 
      request.url.includes('/auth/forgot-password')) {
    return next(request);
  }

  // Get user from storage
  const user = authService.currentUserValue;
  const token = localStorage.getItem('token');

  if (user && token) {
    // Clone the request and add auth header and company ID
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`
    };
    
    // Add company ID header if available and not an auth route
    if (user.companyId) {
      headers['X-Company-ID'] = user.companyId;
    }

    request = request.clone({
      setHeaders: headers
    });
  }

  // Handle the modified request
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from api
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
