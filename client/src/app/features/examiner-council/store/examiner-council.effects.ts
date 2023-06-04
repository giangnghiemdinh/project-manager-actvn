import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { ExaminerCouncilActions } from './examiner-council.actions';
import { ProjectService } from '../../../common/services';
import { ExaminerCouncil, PaginationPayload } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { ExaminerCouncilService } from '../services/examiner-council.service';
import { selectQueryParams } from '../../../common/stores/router';
import { Router } from '@angular/router';
import { RO_EXAMINER_COUNCIL } from '../../../common/constants';


@Injectable()
export class ExaminerCouncilEffects extends AbstractEffects {

    readonly #projectService = inject(ProjectService);
    readonly #examinerCouncilService = inject(ExaminerCouncilService);
    readonly #router = inject(Router);

    loadAllProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.loadAllProject),
            map(action => action.payload),
            switchMap((payload: PaginationPayload) =>
                this.#projectService.getProjects(payload).pipe(
                    map(response => {
                        return response.meta.hasNextPage
                            ? ExaminerCouncilActions.loadAllProject({
                                payload: {...payload, page: response.meta.page! + 1},
                                response: response
                            })
                            : ExaminerCouncilActions.loadAllProjectSuccess({ response });
                    }),
                    catchError(errors => of(ExaminerCouncilActions.loadAllProjectFailure({ errors })))
                )
            )
        )
    );

    loadExaminerCouncils$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.loadExaminerCouncils),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, params]) =>
                this.#examinerCouncilService.getExaminerCouncils(params).pipe(
                    map((response) => ExaminerCouncilActions.loadExaminerCouncilsSuccess({ response })),
                    catchError(errors => of(ExaminerCouncilActions.loadExaminerCouncilsFailure({ errors })))
                )
            )
        )
    );

    loadExaminerCouncil$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.loadExaminerCouncil),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#examinerCouncilService.getExaminerCouncil(payload.id).pipe(
                    map((response: ExaminerCouncil) => ExaminerCouncilActions.loadExaminerCouncilSuccess({ response })),
                    catchError(errors => of(ExaminerCouncilActions.loadExaminerCouncilFailure({ errors })))
                )
            )
        )
    );

    createExaminerCouncil$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.createExaminerCouncil),
            map(action => action.payload),
            mergeMap((payload: ExaminerCouncil) =>
                this.#examinerCouncilService.createExaminerCouncil(payload).pipe(
                    map((response: ExaminerCouncil) => ExaminerCouncilActions.createExaminerCouncilSuccess({ response })),
                    catchError(errors => of(ExaminerCouncilActions.createExaminerCouncilFailure({ errors })))
                )
            )
        )
    );

    createExaminerCouncilSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.createExaminerCouncilSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới hội đồng thành công.');
                return ExaminerCouncilActions.loadExaminerCouncils();
            }),
        )
    );

    createMultipleExaminerCouncil$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.createMultipleExaminerCouncil),
            map(action => action.payload),
            mergeMap((payload: ExaminerCouncil[]) =>
                this.#examinerCouncilService.createMultipleExaminerCouncil(payload).pipe(
                    map(_ => ExaminerCouncilActions.createMultipleExaminerCouncilSuccess()),
                    catchError(errors => of(ExaminerCouncilActions.createMultipleExaminerCouncilFailure({ errors })))
                )
            )
        )
    );

    createMultipleExaminerCouncilSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(ExaminerCouncilActions.createMultipleExaminerCouncilSuccess),
                tap(_ => {
                    this.raiseSuccess('Thành lập danh sách hội đồng thành công.');
                    this.#router.navigate(['/' + RO_EXAMINER_COUNCIL]).then();
                }),
            ),
        { dispatch: false }
    );

    updateExaminerCouncil$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.updateExaminerCouncil),
            map(action => action.payload),
            mergeMap((payload: ExaminerCouncil) =>
                this.#examinerCouncilService.updateExaminerCouncil(payload).pipe(
                    map(_ => ExaminerCouncilActions.updateExaminerCouncilSuccess()),
                    catchError(errors => of(ExaminerCouncilActions.updateExaminerCouncilFailure({ errors })))
                )
            )
        )
    );

    updateExaminerCouncilSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.updateExaminerCouncilSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật hội đồng thành công.');
                return ExaminerCouncilActions.loadExaminerCouncils();
            }),
        ),
    );

    deleteExaminerCouncil$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.deleteExaminerCouncil),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#examinerCouncilService.deleteExaminerCouncil(payload.id).pipe(
                    map(_ => ExaminerCouncilActions.deleteExaminerCouncilSuccess()),
                    catchError(errors => of(ExaminerCouncilActions.deleteExaminerCouncilFailure({ errors })))
                )
            )
        )
    );

    deleteExaminerCouncilSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ExaminerCouncilActions.deleteExaminerCouncilSuccess),
            map(_ => {
                this.raiseSuccess('Xoá hội đồng thành công.');
                return ExaminerCouncilActions.loadExaminerCouncils();
            }),
        ),
    );
}
