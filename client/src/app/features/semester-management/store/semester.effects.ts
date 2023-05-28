import { inject, Injectable } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { SemesterActions } from './semester.actions';
import { SemesterService } from '../../../common/services';
import { Semester } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { CommonActions, CommonState } from '../../../common/stores';
import { Store } from '@ngrx/store';


@Injectable()
export class SemesterEffects extends AbstractEffects {
    readonly #semesterService = inject(SemesterService);
    readonly #commonStore = inject(Store<CommonState>);

    loadSemester$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SemesterActions.loadSemester),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#semesterService.getSemester(payload.id).pipe(
                    map((response: Semester) => SemesterActions.loadSemesterSuccess({ response })),
                    catchError(errors => of(SemesterActions.loadSemesterFailure({ errors })))
                )
            )
        )
    );

    createSemester$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SemesterActions.createSemester),
            map(action => action.payload),
            mergeMap((payload: Semester) =>
                this.#semesterService.createSemester(payload).pipe(
                    map((response: Semester) => SemesterActions.createSemesterSuccess({ response })),
                    catchError(errors => of(SemesterActions.createSemesterFailure({ errors })))
                )
            )
        )
    );

    createSemesterSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SemesterActions.createSemesterSuccess),
                tap((res) => {
                    this.raiseSuccess('Thêm mới học kỳ thành công.');
                    this.#commonStore.dispatch(CommonActions.loadSemesters());
                }),
            ),
        { dispatch: false }
    );

    updateSemester$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SemesterActions.updateSemester),
            map(action => action.payload),
            mergeMap((payload: Semester) =>
                this.#semesterService.updateSemester(payload).pipe(
                    map(_ => SemesterActions.updateSemesterSuccess()),
                    catchError(errors => of(SemesterActions.updateSemesterFailure({ errors })))
                )
            )
        )
    );

    updateSemesterSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SemesterActions.updateSemesterSuccess),
                tap((res) => {
                    this.raiseSuccess('Cập nhật học kỳ thành công.');
                    this.#commonStore.dispatch(CommonActions.loadSemesters());
                }),
            ),
        { dispatch: false }
    );

    deleteSemester$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SemesterActions.deleteSemester),
            map(action => action.id),
            mergeMap((id: number) =>
                this.#semesterService.deleteSemester(id).pipe(
                    map(_ => SemesterActions.deleteSemesterSuccess()),
                    catchError(errors => of(SemesterActions.deleteSemesterFailure({ errors })))
                )
            )
        )
    );

    deleteSemesterSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SemesterActions.deleteSemesterSuccess),
                tap((res) => {
                    this.raiseSuccess('Xoá học kỳ thành công.');
                    this.#commonStore.dispatch(CommonActions.loadSemesters());
                }),
            ),
        { dispatch: false }
    );

    lockSemester$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SemesterActions.lockSemester),
            map(action => action.id),
            mergeMap((id: number) =>
                this.#semesterService.lockSemester(id).pipe(
                    map(_ => SemesterActions.lockSemesterSuccess()),
                    catchError(errors => of(SemesterActions.lockSemesterFailure({ errors })))
                )
            )
        )
    );

    lockSemesterSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SemesterActions.lockSemesterSuccess),
                tap((res) => {
                    this.raiseSuccess('Khoá học kỳ thành công.');
                    this.#commonStore.dispatch(CommonActions.loadSemesters());
                }),
            ),
        { dispatch: false }
    );
}
