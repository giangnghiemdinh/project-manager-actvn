import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { AuthState, selectCredentials } from '../../../common/stores';
import { RO_LOGIN_FULL } from '../../../common/constants';

export const canActivateVerify: CanActivateFn = () => {
  const store = inject(Store<AuthState>);
  const router = inject(Router);
  return store.select(selectCredentials)
    .pipe(
      map(auth => {
        if (!auth || !auth.email) {
          router.navigate([RO_LOGIN_FULL]).then();
          return false;
        }
        return true;
      }));
};
