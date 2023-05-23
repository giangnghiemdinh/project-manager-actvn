import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import * as progressActions from './progress.actions';
import { AbstractEffects } from '../../../common/abstracts';
import { PaginationResponse, Progress } from '../../../common/models';
import { ProgressService } from '../services/progress.service';
import { selectQueryParams } from '../../../common/stores/router';


@Injectable()
export class ProgressEffects extends AbstractEffects {
    private readonly progressService = inject(ProgressService);

    loadProgresses$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.loadProgresses),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, queryParams]) =>
                this.progressService.getProgresses(queryParams).pipe(
                    map((response: PaginationResponse<Progress>) => progressActions.loadProgressesSuccess({ response })),
                    catchError(errors => of(progressActions.loadProgressesFailure({ errors })))
                )
            )
        )
    );

    loadProgress$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.loadProgress),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.progressService.getProgress(payload.id).pipe(
                    map((response: Progress) => progressActions.loadProgressSuccess({ response })),
                    catchError(errors => of(progressActions.loadProgressFailure({ errors })))
                )
            )
        )
    );

    createProgress$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.createProgress),
            map(action => action.payload),
            mergeMap((payload: Progress) =>
                this.progressService.createProgress(payload).pipe(
                    map((response: Progress) => progressActions.createProgressSuccess({ response })),
                    catchError(errors => of(progressActions.createProgressFailure({ errors })))
                )
            )
        )
    );

    createProgressSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.createProgressSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới tiến độ thành công.', '');
                return progressActions.loadProgresses()
            }),
        )
    );

    createProgressFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.createProgressFailure),
            tap(({ errors }) => {
                this.raiseError(errors.message || '', '');
            }),
        ),
        { dispatch: false }
    );

    updateProgress$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.updateProgress),
            map(action => action.payload),
            mergeMap((payload: Progress) =>
                this.progressService.updateProgress(payload).pipe(
                    map(_ => progressActions.updateProgressSuccess()),
                    catchError(errors => of(progressActions.updateProgressFailure({ errors })))
                )
            )
        )
    );

    updateProgressSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.updateProgressSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật tiến độ thành công.', '');
                return progressActions.loadProgresses();
            }),
        )
    );

    updateProgressFailure$ = createEffect(() =>
            this.actions$.pipe(
                ofType(progressActions.updateProgressFailure),
                tap(({ errors }) => {
                    this.raiseError(errors.message || '', '');
                }),
            ),
        { dispatch: false }
    );

    deleteProgress$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.deleteProgress),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.progressService.deleteProgress(payload.id).pipe(
                    map(_ => progressActions.deleteProgressSuccess()),
                    catchError(errors => of(progressActions.deleteProgressFailure({ errors })))
                )
            )
        )
    );

    deleteProgressSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(progressActions.deleteProgressSuccess),
            map(_ => {
                this.raiseSuccess('Xoá tiến độ thành công.', '');
                return progressActions.loadProgresses();
            }),
        )
    );
}
