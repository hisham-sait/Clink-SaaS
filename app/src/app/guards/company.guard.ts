import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const companyGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserValue;
  if (!user?.companyId) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
