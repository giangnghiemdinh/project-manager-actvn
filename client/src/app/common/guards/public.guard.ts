import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getCookie } from '../utilities';
import { TOKEN } from '../constants';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = getCookie(TOKEN);
  if (token) {
    router.navigate(['/']).then();
    return false;
  }
  return true;
};
