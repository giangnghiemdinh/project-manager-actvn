import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RO_LOGIN_FULL } from '../constants';

export const resetPasswordGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const queryParams = route.queryParams;
  if (!queryParams || !queryParams['code'] || !queryParams['email']) {
    router.navigate([RO_LOGIN_FULL]).then();
    return false;
  }
  return true;
};
