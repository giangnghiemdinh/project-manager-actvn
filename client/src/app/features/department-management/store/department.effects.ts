import { inject, Injectable } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import * as departmentActions from './department.actions';
import { DepartmentService } from '../../../common/services';
import { Department } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { CommonActions, CommonState } from '../../../common/stores';
import { Store } from '@ngrx/store';


@Injectable()
export class DepartmentEffects extends AbstractEffects {
    private readonly departmentService = inject(DepartmentService);
    private readonly commonStore = inject(Store<CommonState>);

    loadDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(departmentActions.loadDepartment),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.departmentService.getDepartment(payload.id).pipe(
                    map((response: Department) => departmentActions.loadDepartmentSuccess({ response })),
                    catchError(errors => of(departmentActions.loadDepartmentFailure({ errors })))
                )
            )
        )
    );

    createDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(departmentActions.createDepartment),
            map(action => action.payload),
            mergeMap((payload: Department) =>
                this.departmentService.createDepartment(payload).pipe(
                    map((response: Department) => departmentActions.createDepartmentSuccess({ response })),
                    catchError(errors => of(departmentActions.createDepartmentFailure({ errors })))
                )
            )
        )
    );

    createDepartmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(departmentActions.createDepartmentSuccess),
                tap((res) => {
                    this.raiseSuccess('Thêm mới khoa thành công.');
                    this.commonStore.dispatch(CommonActions.loadDepartments());
                }),
            ),
        { dispatch: false }
    );

    updateDepartment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(departmentActions.updateDepartment),
            map(action => action.payload),
            mergeMap((payload: Department) =>
                this.departmentService.updateDepartment(payload).pipe(
                    map(_ => departmentActions.updateDepartmentSuccess()),
                    catchError(errors => of(departmentActions.updateDepartmentFailure({ errors })))
                )
            )
        )
    );

    updateDepartmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(departmentActions.updateDepartmentSuccess),
                tap((res) => {
                    this.raiseSuccess('Cập nhật khoa thành công.');
                    this.commonStore.dispatch(CommonActions.loadDepartments());
                }),
            ),
        { dispatch: false }
    );
}
