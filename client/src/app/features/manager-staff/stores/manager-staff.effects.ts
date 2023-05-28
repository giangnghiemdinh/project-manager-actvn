import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { ManagerStaffActions } from './manager-staff.actions';
import { ProjectService } from '../../../common/services';
import { ManagerStaff, PaginationPayload } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { selectQueryParams } from '../../../common/stores/router';
import { Router } from '@angular/router';
import { RO_MANAGER_STAFF } from '../../../common/constants';
import { ManagerStaffService } from '../services/manager-staff.service';


@Injectable()
export class ManagerStaffEffects extends AbstractEffects {

    private readonly projectService = inject(ProjectService);
    private readonly managerStaffService = inject(ManagerStaffService);
    private readonly router = inject(Router);

    loadAllProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.loadAllProjects),
            map(action => action.payload),
            switchMap((payload: PaginationPayload) =>
                this.projectService.getProjects(payload).pipe(
                    map(response => {
                        return response.meta.hasNextPage
                            ? ManagerStaffActions.loadAllProjects({
                                payload: {...payload, page: response.meta.page! + 1},
                                response: response
                            })
                            : ManagerStaffActions.loadAllProjectsSuccess({ response });
                    }),
                    catchError(errors => of(ManagerStaffActions.loadAllProjectsFailure({ errors })))
                )
            )
        )
    );

    loadManagerStaffs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.loadManagerStaffs),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, params]) =>
                this.managerStaffService.getManagerStaffs(params).pipe(
                    map((response) => ManagerStaffActions.loadManagerStaffsSuccess({ response })),
                    catchError(errors => of(ManagerStaffActions.loadManagerStaffsFailure({ errors })))
                )
            )
        )
    );

    loadManagerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.loadManagerStaff),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.managerStaffService.getManagerStaff(payload.id).pipe(
                    map((response: ManagerStaff) => ManagerStaffActions.loadManagerStaffSuccess({ response })),
                    catchError(errors => of(ManagerStaffActions.loadManagerStaffFailure({ errors })))
                )
            )
        )
    );

    createManagerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.createManagerStaff),
            map(action => action.payload),
            mergeMap((payload: ManagerStaff) =>
                this.managerStaffService.createManagerStaff(payload).pipe(
                    map((response: ManagerStaff) => ManagerStaffActions.createManagerStaffSuccess({ response })),
                    catchError(errors => of(ManagerStaffActions.createManagerStaffFailure({ errors })))
                )
            )
        )
    );

    createManagerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.createManagerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới nhóm quản lý thành công.');
                return ManagerStaffActions.loadManagerStaffs()
            }),
        )
    );

    createMultipleManagerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.createMultipleManagerStaff),
            map(action => action.payload),
            mergeMap((payload: ManagerStaff[]) =>
                this.managerStaffService.createMultipleManagerStaff(payload).pipe(
                    map(_ => ManagerStaffActions.createMultipleManagerStaffSuccess()),
                    catchError(errors => of(ManagerStaffActions.createMultipleManagerStaffFailure({ errors })))
                )
            )
        )
    );

    createMultipleManagerStaffSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(ManagerStaffActions.createMultipleManagerStaffSuccess),
                tap(_ => {
                    this.raiseSuccess('Thành lập danh sách quản lý thành công.');
                    this.router.navigate(['/' + RO_MANAGER_STAFF]).then();
                }),
            ),
        { dispatch: false }
    );

    updateManagerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.updateManagerStaff),
            map(action => action.payload),
            mergeMap((payload: ManagerStaff) =>
                this.managerStaffService.updateManagerStaff(payload).pipe(
                    map(_ => ManagerStaffActions.updateManagerStaffSuccess()),
                    catchError(errors => of(ManagerStaffActions.updateManagerStaffFailure({ errors })))
                )
            )
        )
    );

    updateManagerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.updateManagerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật nhóm quản lý thành công.');
                return ManagerStaffActions.loadManagerStaffs();
            }),
        ),
    );

    deleteManagerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.deleteManagerStaff),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.managerStaffService.deleteManagerStaff(payload.id).pipe(
                    map(_ => ManagerStaffActions.deleteManagerStaffSuccess()),
                    catchError(errors => of(ManagerStaffActions.deleteManagerStaffFailure({ errors })))
                )
            )
        )
    );

    deleteManagerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ManagerStaffActions.deleteManagerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Xoá nhóm quản lý thành công.');
                return ManagerStaffActions.loadManagerStaffs();
            }),
        ),
    );
}
