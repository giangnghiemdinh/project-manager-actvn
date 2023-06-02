import { HttpContextToken, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { BehaviorSubject, EMPTY, filter, finalize, switchMap, take, throwError, } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { clearToken, getRefreshToken, getToken, saveToken } from '../utilities';
import { inject } from '@angular/core';
import { AuthService } from '../services';
import { Router } from '@angular/router';
import { RO_LOGIN_FULL } from '../constants';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);
const allowed = [
    '/assets',
    '/auth/login',
    '/auth/generate-otp',
    '/auth/verify',
    '/auth/refresh',
    '/auth/resend',
    '/auth/forgot-password',
    '/auth/reset-password'
];
export const IGNORE_TOKEN = new HttpContextToken<boolean>(() => false);


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (req.context.get(IGNORE_TOKEN) || allowed.some((url) => req.url.includes(url))) {
        return next(req);
    }
    const token = getToken();
    if (token) {
        req = addTokenHeader(req, token);
    }
    return next(req).pipe(catchError(error => {
        switch (error.status) {
            case 401:
                return logout(router);
            case 902:
                if (!isRefreshing) {
                    const refreshToken = getRefreshToken();
                    if (!refreshToken) {
                        return logout(router);
                    }
                    isRefreshing = true;
                    refreshTokenSubject.next(null);
                    return authService.refresh({ refreshToken }).pipe(
                        finalize(() => isRefreshing = false),
                        switchMap((response) => {
                            if (response.accessToken && response.refreshToken) {
                                saveToken(response.accessToken, response.refreshToken);
                            }
                            refreshTokenSubject.next(response.accessToken);
                            return next(addTokenHeader(req, response.accessToken!));
                        }),
                        catchError((err) => {
                            [0, 401].includes(err.statusCode) && logout(router);
                            return throwError(err);
                        })
                    );
                }
                return refreshTokenSubject.pipe(
                    filter(token => token !== null),
                    take(1),
                    switchMap((token) => next(addTokenHeader(req, token)))
                );
        }
        return throwError(error);
    }));
}

function logout(router: Router) {
    clearToken();
    router.navigate([RO_LOGIN_FULL]).then();
    return EMPTY;
}

function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
}

