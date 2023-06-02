import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../../../common/services';
import { UserActions } from './user.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { User } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { selectQueryParams } from '../../../common/stores/router';
import { AuthActions, AuthState, selectProfile } from '../../../common/stores';
import { Store } from '@ngrx/store';

@Injectable()
export class UserEffects extends AbstractEffects {

    readonly #authStore = inject(Store<AuthState>);
    readonly #userService = inject(UserService);

    loadUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadUsers),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, queryParams]) =>
                this.#userService.getUsers(queryParams).pipe(
                    map((response) => UserActions.loadUsersSuccess({ response })),
                    catchError(errors => of(UserActions.loadUsersFailure({ errors })))
                )
            )
        )
    );

    loadUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadUser),
            map(action => action.payload),
            mergeMap((payload) =>
                this.#userService.getUser(payload.id).pipe(
                    map((response: User) => UserActions.loadUserSuccess({ response })),
                    catchError(errors => of(UserActions.loadUserFailure({ errors })))
                )
            )
        )
    );

    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            map(action => action.payload),
            mergeMap((payload: User) =>
                this.#userService.createUser(payload).pipe(
                    map((response: User) => UserActions.createUserSuccess({ response })),
                    catchError(errors => of(UserActions.createUserFailure({ errors })))
                )
            )
        )
    );

    createUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUserSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới người dùng thành công.');
                return UserActions.loadUsers();
            })
        )
    );

    updateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.updateUser),
            map(action => action.payload),
            mergeMap(payload =>
                this.#userService.updateUser(payload).pipe(
                    map(response => UserActions.updateUserSuccess({ response })),
                    catchError(errors => of(UserActions.updateUserFailure({ errors })))
                )
            )
        )
    );

    updateUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.updateUserSuccess),
            concatLatestFrom(_ => this.#authStore.select(selectProfile)),
            map(([res, profile]) => {
                this.raiseSuccess('Cập nhật người dùng thành công.');
                if (profile && res.response && res.response.id === profile.id) {
                    this.#authStore.dispatch(AuthActions.updateProfile({ profile: res.response }));
                }
                return UserActions.loadUsers();
            }),
        )
    );

    changeStatusUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.changeStatusUser),
            map(action => action.payload),
            mergeMap((payload) =>
                this.#userService.changeStatus(payload.id, payload.status).pipe(
                    map(_ => UserActions.changeStatusUserSuccess()),
                    catchError(errors => of(UserActions.changeStatusUserFailure({ errors })))
                )
            )
        )
    );

    changeStatusUser$Success$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.changeStatusUserSuccess),
            map(_ => {
                this.raiseSuccess('Thay đổi trạng thái người dùng thành công.');
                return UserActions.loadUsers();
            }),
        ),
    );

    importUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.importUser),
            map(action => action.payload),
            mergeMap((payload) =>
                this.#userService.importUser(payload).pipe(
                    map(_ => UserActions.importUserSuccess()),
                    catchError(errors => of(UserActions.importUserFailure({ errors })))
                )
            )
        )
    );

    importUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.importUserSuccess),
            map(_ => {
                this.raiseSuccess('Nhập danh sách người dùng thành công.');
                return UserActions.loadUsers();
            }),
        ),
    );
}
