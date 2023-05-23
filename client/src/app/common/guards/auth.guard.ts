import { CanActivateFn, Router } from '@angular/router';
import { getCookie } from '../utilities';
import { RO_LOGIN_FULL, TOKEN } from '../constants';
import { inject } from '@angular/core';
import { AuthActions, AuthState } from '../stores';
import { Store } from '@ngrx/store';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const store = inject(Store<AuthState>);
    const token = getCookie(TOKEN);
    if (token) {
        store.dispatch(AuthActions.loadProfile());
        return true;
    }
    router.navigate([RO_LOGIN_FULL]).then();
    return false;
};
