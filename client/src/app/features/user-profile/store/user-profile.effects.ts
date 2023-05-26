import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { UserProfileActions } from './user-profile.actions';
import { AbstractEffects } from '../../../common/abstracts';
import { UserService } from '../../../common/services';
import { User } from '../../../common/models';
import { AuthActions, AuthState, selectProfile } from '../../../common/stores';
import { Store } from '@ngrx/store';
import { selectRouteParams, selectRouterParam } from '../../../common/stores/router';
import { clearToken, getDeviceId } from '../../../common/utilities';
import { RO_LOGIN_FULL } from '../../../common/constants';
import { Router } from '@angular/router';
import { UserProfileState } from './user-profile.reducer';


@Injectable()
export class UserProfileEffects extends AbstractEffects {

    private readonly authStore = inject(Store<AuthState>);
    private readonly userService = inject(UserService);
    private readonly router = inject(Router);
    private readonly store = inject(Store<UserProfileState>);

    loadUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.loadUser),
            concatLatestFrom(_ => this.routerStore.select(selectRouteParams)),
            mergeMap(([_, params]) => {
                const id = params && !isNaN(params['id']) ? +params['id'] : null;
                return (id ? this.userService.getUser(id) : this.userService.getProfile()).pipe(
                    map((response: User) => {
                        !id && this.authStore.dispatch(AuthActions.updateProfile({ profile: response }));
                        return UserProfileActions.loadUserSuccess({ response });
                    }),
                    catchError(errors => of(UserProfileActions.loadUserFailure({ errors })))
                )
            })
        )
    );

    updateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.updateUser),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.updateUser(payload).pipe(
                    map(response => UserProfileActions.updateUserSuccess({ response })),
                    catchError(errors => of(UserProfileActions.updateUserFailure({ errors })))
                )
            )
        )
    );

    updateUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.updateUserSuccess),
            concatLatestFrom(_ => this.authStore.select(selectProfile)),
            tap(([res, profile]) => {
                this.raiseSuccess('Cập nhật người dùng thành công.');
                if (profile && res.response && res.response.id === profile.id) {
                    this.authStore.dispatch(AuthActions.updateProfile({ profile: res.response }));
                }
            })
        ),
        { dispatch: false }
    );

    verifyNewEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.verifyNewEmail),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.verifyNewEmail(payload).pipe(
                    map(response => UserProfileActions.verifyNewEmailSuccess()),
                    catchError(errors => of(UserProfileActions.verifyNewEmailFailure({ errors })))
                )
            )
        )
    );

    changeEmail$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.changeEmail),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.changeEmail(payload).pipe(
                    map(response => UserProfileActions.changeEmailSuccess()),
                    catchError(errors => of(UserProfileActions.changeEmailFailure({ errors })))
                )
            )
        )
    );

    changeEmailSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.changeEmailSuccess),
                tap((res) => {
                    this.raiseSuccess('Thay đổi Email thành công! Vui lòng đăng nhập lại.');
                    this.logout();
                })
            ),
        { dispatch: false }
    );

    changePassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.changePassword),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.changePassword(payload).pipe(
                    map(response => UserProfileActions.changePasswordSuccess()),
                    catchError(errors => of(UserProfileActions.changePasswordFailure({ errors })))
                )
            )
        )
    );

    changePasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.changePasswordSuccess),
                tap((res) => {
                    this.raiseSuccess('Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                    this.logout();
            })
        ),
        { dispatch: false }
    );

    change2FA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.change2FA),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.change2FA(payload.twoFactory).pipe(
                    map(response => UserProfileActions.change2FASuccess({ isSelf: payload.isSelf })),
                    catchError(errors => of(UserProfileActions.change2FAFailure({ errors })))
                )
            )
        )
    );

    change2FASuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.change2FASuccess),
                tap((res) => {
                    if (res.isSelf) {
                        this.raiseSuccess('Thay đổi phương thức xác thành công! Vui lòng đăng nhập lại.');
                        this.logout();
                        return;
                    }
                    this.raiseSuccess('Thay đổi phương thức xác thành công!');
                })
            ),
        { dispatch: false }
    );

    deleteSession$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.deleteSession),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.deleteSession(payload.id).pipe(
                    map(response => UserProfileActions.deleteSessionSuccess({ deviceId: payload.deviceId })),
                    catchError(errors => of(UserProfileActions.deleteSessionFailure({ errors })))
                )
            )
        )
    );

    deleteSessionSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.deleteSessionSuccess),
            concatLatestFrom(_ => this.routerStore.select(selectRouterParam('id'))),
            tap(([res, id]) => {
                if (res.deviceId === getDeviceId()) {
                    this.raiseSuccess('Xoá phiên đăng nhập thành công! Vui lòng đăng nhập lại.');
                    this.logout();
                    return;
                }
                this.raiseSuccess('Xoá phiên đăng nhập thành công!');
                this.store.dispatch(UserProfileActions.loadSessions({ payload: { userId: id || '' } }))
            })
        ),
        { dispatch: false }
    );

    updateProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.updateProfile),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.updateProfile(payload).pipe(
                    map(response => UserProfileActions.updateProfileSuccess({ response })),
                    catchError(errors => of(UserProfileActions.updateProfileFailure({ errors })))
                )
            )
        )
    );

    updateProfileSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(UserProfileActions.updateProfileSuccess),
                tap(({ response }) => {
                    this.authStore.dispatch(AuthActions.updateProfile({ profile: response }));
                    this.raiseSuccess('Cập nhật thông tin thành công.');
                }),
            ),
        { dispatch: false }
    );

    loadSessions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.loadSessions),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.getSessions(payload).pipe(
                    map(response => UserProfileActions.loadSessionsSuccess({ response })),
                    catchError(errors => of(UserProfileActions.loadSessionsFailure({ errors })))
                )
            )
        )
    );

    loadEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserProfileActions.loadEvents),
            map(action => action.payload),
            mergeMap(payload =>
                this.userService.getEvents(payload).pipe(
                    map(response => UserProfileActions.loadEventsSuccess({ response })),
                    catchError(errors => of(UserProfileActions.loadSessionsFailure({ errors })))
                )
            )
        )
    );

    private logout() {
        clearToken();
        this.router.navigate([RO_LOGIN_FULL]).then();
    }
}
