import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import * as examinerCouncilActions from './examiner-council.actions';
import { ProjectService } from '../../../common/services';
import { ExaminerCouncil, PaginationPayload } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { ExaminerCouncilService } from '../services/examiner-council.service';
import { selectQueryParams } from '../../../common/stores/router';
import { Router } from '@angular/router';
import { RO_EXAMINER_COUNCIL } from '../../../common/constants';


@Injectable()
export class ExaminerCouncilEffects extends AbstractEffects {

  private readonly projectService = inject(ProjectService);
  private readonly examinerCouncilService = inject(ExaminerCouncilService);
  private readonly router = inject(Router);

  loadAllProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.loadAllProjects),
      map(action => action.payload),
      switchMap((payload: PaginationPayload) =>
        this.projectService.getProjects({ ...payload, extra: 'd' }).pipe(
          map(response => {
            return response.meta.hasNextPage
              ? examinerCouncilActions.loadAllProjects({
                payload: {...payload, page: response.meta.page! + 1},
                response: response
              })
              : examinerCouncilActions.loadAllProjectSuccess({ response });
          }),
          catchError(errors => of(examinerCouncilActions.loadAllProjectFailure({ errors })))
        )
      )
    )
  );

  loadExaminerCouncils$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.loadExaminerCouncils),
      concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
      mergeMap(([_, params]) =>
        this.examinerCouncilService.getExaminerCouncils(params).pipe(
          map((response) => examinerCouncilActions.loadExaminerCouncilsSuccess({ response })),
          catchError(errors => of(examinerCouncilActions.loadExaminerCouncilsFailure({ errors })))
        )
      )
    )
  );

  loadExaminerCouncil$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.loadExaminerCouncil),
      map(action => action.payload),
      mergeMap((payload: { id: number }) =>
        this.examinerCouncilService.getExaminerCouncil(payload.id).pipe(
          map((response: ExaminerCouncil) => examinerCouncilActions.loadExaminerCouncilSuccess({ response })),
          catchError(errors => of(examinerCouncilActions.loadExaminerCouncilFailure({ errors })))
        )
      )
    )
  );

  createExaminerCouncil$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.createExaminerCouncil),
      map(action => action.payload),
      mergeMap((payload: ExaminerCouncil) =>
        this.examinerCouncilService.createExaminerCouncil(payload).pipe(
          map((response: ExaminerCouncil) => examinerCouncilActions.createExaminerCouncilSuccess({ response })),
          catchError(errors => of(examinerCouncilActions.createExaminerCouncilFailure({ errors })))
        )
      )
    )
  );

  createExaminerCouncilSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.createExaminerCouncilSuccess),
      map(_ => {
        this.raiseSuccess('Thêm mới hội đồng thành công.');
        return examinerCouncilActions.loadExaminerCouncils();
      }),
    )
  );

  createMultipleExaminerCouncil$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.createMultipleExaminerCouncil),
      map(action => action.payload),
      mergeMap((payload: ExaminerCouncil[]) =>
        this.examinerCouncilService.createMultipleExaminerCouncil(payload).pipe(
          map(_ => examinerCouncilActions.createMultipleExaminerCouncilSuccess()),
          catchError(errors => of(examinerCouncilActions.createMultipleExaminerCouncilFailure({ errors })))
        )
      )
    )
  );

  createMultipleExaminerCouncilSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.createMultipleExaminerCouncilSuccess),
      tap(_ => {
        this.raiseSuccess('Thành lập hội đồng quản lý thành công.');
        this.router.navigate(['/' + RO_EXAMINER_COUNCIL]).then();
      }),
    ),
    { dispatch: false }
  );

  updateExaminerCouncil$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.updateExaminerCouncil),
      map(action => action.payload),
      mergeMap((payload: ExaminerCouncil) =>
        this.examinerCouncilService.updateExaminerCouncil(payload).pipe(
          map(_ => examinerCouncilActions.updateExaminerCouncilSuccess()),
          catchError(errors => of(examinerCouncilActions.updateExaminerCouncilFailure({ errors })))
        )
      )
    )
  );

  updateExaminerCouncilSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.updateExaminerCouncilSuccess),
      map(_ => {
        this.raiseSuccess('Cập nhật hội đồng thành công.');
        return examinerCouncilActions.loadExaminerCouncils();
      }),
    ),
  );

  deleteExaminerCouncil$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.deleteExaminerCouncil),
      map(action => action.payload),
      mergeMap((payload: { id: number }) =>
        this.examinerCouncilService.deleteExaminerCouncil(payload.id).pipe(
          map(_ => examinerCouncilActions.deleteExaminerCouncilSuccess()),
          catchError(errors => of(examinerCouncilActions.deleteExaminerCouncilFailure({ errors })))
        )
      )
    )
  );

  deleteExaminerCouncilSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(examinerCouncilActions.deleteExaminerCouncilSuccess),
      map(_ => {
        this.raiseSuccess('Xoá hội đồng thành công.');
        return examinerCouncilActions.loadExaminerCouncils();
      }),
    ),
  );
}
