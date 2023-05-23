import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState, selectAuthLoading, selectProfile } from '../stores';
import { filter, map } from 'rxjs';
import { concatLatestFrom } from '@ngrx/effects';

export const roleGuard: CanActivateFn = (route) => {
    const { data: { role } } = route;
    const authStore = inject(Store<AuthState>);
    const router = inject(Router);
    const roles = role ? (Array.isArray(role) ? role : [ role ]) : [];
    return authStore.select(selectAuthLoading)
        .pipe(
            filter<boolean>(isLoading => !isLoading),
            concatLatestFrom(_ => authStore.select(selectProfile)),
            map(([_, profile]) => {
                const hasRole = roles.length ? (!!profile && roles.includes(profile.role)) : true;
                !hasRole && router.navigate(['/403']).then();
                return hasRole;
            })
        );
};
