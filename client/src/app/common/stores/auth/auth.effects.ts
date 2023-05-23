import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService, NotificationService, UserService } from '../../services';
import { Router } from '@angular/router';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { UserForgotPayload, UserLoginPayload, UserLoginResponse, UserResetPayload } from '../../models';
import { AuthState } from './auth.reducer';
import { Store } from '@ngrx/store';
import { UserVerifyPayload, UserVerifyResponse } from '../../models/user-verify.model';
import { clearToken, saveToken } from '../../utilities';
import { RO_LOGIN_FULL, RO_TWO_FACTOR_FULL } from '../../constants';

@Injectable()
export class AuthEffects {

    private readonly actions$ = inject(Actions);
    private readonly router = inject(Router);
    private readonly store = inject(Store<AuthState>);
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            map(action => action.payload),
            mergeMap((payload: UserLoginPayload) =>
                this.authService.login(payload).pipe(
                    map((response: UserLoginResponse) => {
                        if (response.requiredOtpToken) {
                            this.store.dispatch(AuthActions.loadOTPToken({ payload: { email: payload.email } }));
                        }
                        return AuthActions.loginSuccess({ response });
                    }),
                    catchError(errors => of(AuthActions.loginFailure({ errors })))
                )
            )
        )
    );

    forgotPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.forgotPassword),
            map(action => action.payload),
            mergeMap((payload: UserForgotPayload) =>
                this.authService.forgotPassword(payload).pipe(
                    map(_ => AuthActions.forgotPasswordSuccess()),
                    catchError(errors => of(AuthActions.forgotPasswordFailure({ errors })))
                )
            )
        )
    );

    resendOtp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resendEmail),
            map(action => action.payload),
            mergeMap((payload: UserLoginPayload) =>
                this.authService.resendEmail(payload).pipe(
                    map(_ => AuthActions.resendEmailSuccess()),
                    catchError(errors => of(AuthActions.resendEmailFailure({ errors })))
                )
            )
        )
    );

    forgotPasswordSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.forgotPasswordSuccess),
                tap((res) => {
                    this.notificationService.success('Yêu cầu đặt lại mật khẩu thành công. Vui lòng kiểm tra email để lấy đường dẫn đặt lại mật khẩu.');
                    this.router.navigate(['/' + RO_LOGIN_FULL]).then();
                }),
            ),
        { dispatch: false }
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPassword),
            map(action => action.payload),
            mergeMap((payload: UserResetPayload) =>
                this.authService.resetPassword(payload).pipe(
                    map(_ => AuthActions.resetPasswordSuccess()),
                    catchError(errors => of(AuthActions.resetPasswordFailure({ errors })))
                )
            )
        )
    );

    resetPasswordSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.resetPasswordSuccess),
                tap((res) => {
                    this.notificationService.success('Đặt lại mật khẩu thành công.');
                    this.router.navigate(['/' + RO_LOGIN_FULL]).then();
                }),
            ),
        { dispatch: false }
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                mergeMap(_ => this.authService.logout()),
                tap(_ => {
                    clearToken();
                    this.router.navigate([RO_LOGIN_FULL]).then();
                })
            ),
        { dispatch: false }
    );

    loginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                map((res) => {
                    const response = res.response as UserLoginResponse;
                    if (response.accessToken && response.refreshToken) {
                        saveToken(response.accessToken, response.refreshToken);
                        this.router.navigate(['/']).then();
                        return;
                    }
                    this.router.navigate([RO_TWO_FACTOR_FULL]).then();
                }),
            ),
        { dispatch: false }
    );

    loadToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadOTPToken),
            map(action => action.payload),
            switchMap((payload: { email: string }) =>
                this.authService.generateToken(payload).pipe(
                    map((response) => AuthActions.loadOTPTokenSuccess({ response })),
                    catchError(errors => of(AuthActions.loadOTPTokenFailure({ errors })))
                )
            )
        )
    );

    verify$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.twoFactorVerify),
            map(action => action.payload),
            mergeMap((payload: UserVerifyPayload) =>
                this.authService.verify(payload).pipe(
                    map((response: UserVerifyResponse) => AuthActions.twoFactorVerifySuccess({ response })),
                    catchError(errors => of(AuthActions.twoFactorVerifyFailure({ errors })))
                )
            )
        )
    );

    verifySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.twoFactorVerifySuccess),
                tap((res) => {
                    const response = res.response as UserVerifyResponse;
                    if (response.accessToken && response.refreshToken) {
                        saveToken(response.accessToken, response.refreshToken);
                        this.router.navigate(['/']).then();
                    }
                }),
            ),
        { dispatch: false }
    );

    loadProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadProfile),
            mergeMap(() =>
                this.userService.getProfile().pipe(
                    map((response) => AuthActions.loadProfileSuccess({ response })),
                    catchError(errors => of(AuthActions.loadProfileFailure({ errors })))
                )
            )
        )
    );

    loadProfileFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loadProfileFailure),
                tap((res) => {

                    this.router.navigate([RO_LOGIN_FULL]).then();
                }),
            ),
        { dispatch: false }
    );
}
