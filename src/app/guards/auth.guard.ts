import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    if (authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  } catch (e) {
    console.error('authGuard error:', e);
    return true;
  }
};

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    if (!authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  } catch (e) {
    console.error('guestGuard error:', e);
    return true;
  }
};
