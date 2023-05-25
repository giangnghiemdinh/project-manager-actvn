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
import { selectRouteParams } from '../../../common/stores/router';


@Injectable()
export class UserProfileEffects extends AbstractEffects {

    private readonly authStore = inject(Store<AuthState>);
    private readonly userService = inject(UserService);

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
}
