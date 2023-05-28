import { inject, Injectable } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { DepartmentActions } from './department.actions';
import { DepartmentService } from '../../../common/services';
import { Department } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { CommonActions, CommonState } from '../../../common/stores';
import { Store } from '@ngrx/store';


@Injectable()
export class DepartmentEffects extends AbstractEffects {
    readonly #departmentService = inject(DepartmentService);
    readonly #commonStore = inject(Store<CommonState>);

    loadDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DepartmentActions.loadDepartment),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#departmentService.getDepartment(payload.id).pipe(
                    map((response: Department) => DepartmentActions.loadDepartmentSuccess({ response })),
                    catchError(errors => of(DepartmentActions.loadDepartmentFailure({ errors })))
                )
            )
        )
    );

    createDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DepartmentActions.createDepartment),
            map(action => action.payload),
            mergeMap((payload: Department) =>
                this.#departmentService.createDepartment(payload).pipe(
                    map((response: Department) => DepartmentActions.createDepartmentSuccess({ response })),
                    catchError(errors => of(DepartmentActions.createDepartmentFailure({ errors })))
                )
            )
        )
    );

    createDepartmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DepartmentActions.createDepartmentSuccess),
                tap((res) => {
                    this.raiseSuccess('Thêm mới khoa thành công.');
                    this.#commonStore.dispatch(CommonActions.loadDepartments());
                }),
            ),
        { dispatch: false }
    );

    updateDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DepartmentActions.updateDepartment),
            map(action => action.payload),
            mergeMap((payload: Department) =>
                this.#departmentService.updateDepartment(payload).pipe(
                    map(_ => DepartmentActions.updateDepartmentSuccess()),
                    catchError(errors => of(DepartmentActions.updateDepartmentFailure({ errors })))
                )
            )
        )
    );

    updateDepartmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DepartmentActions.updateDepartmentSuccess),
                tap((res) => {
                    this.raiseSuccess('Cập nhật khoa thành công.');
                    this.#commonStore.dispatch(CommonActions.loadDepartments());
                }),
            ),
        { dispatch: false }
    );

    deleteDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DepartmentActions.deleteDepartment),
            map(action => action.id),
            mergeMap((id) =>
                this.#departmentService.deleteDepartment(id).pipe(
                    map(_ => DepartmentActions.deleteDepartmentSuccess()),
                    catchError(errors => of(DepartmentActions.deleteDepartmentFailure({ errors })))
                )
            )
        )
    );

    deleteDepartmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DepartmentActions.deleteDepartmentSuccess),
                tap((res) => {
                    this.raiseSuccess('Xoá khoa thành công.');
                    this.#commonStore.dispatch(CommonActions.loadDepartments());
                }),
            ),
        { dispatch: false }
    );
}
