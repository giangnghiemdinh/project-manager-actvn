import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of } from 'rxjs';
import * as projectApproveActions from './project-approve.actions';
import { PaginationResponse, Project } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { ProjectService } from '../../../common/services';
import { selectQueryParams } from '../../../common/stores/router';
import { ProjectStatus } from '../../../common/constants/project.constant';


@Injectable()
export class ProjectApproveEffects extends AbstractEffects {
  private readonly projectService = inject(ProjectService);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectApproveActions.loadProjects),
      concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
      mergeMap(([_, queryParams]) =>
        this.projectService.getProjects({
            ...queryParams,
            status: queryParams['status'] || [ProjectStatus.PROPOSE, ProjectStatus.REFUSE].join(',') }
        ).pipe(
          map((response: PaginationResponse<Project>) => projectApproveActions.loadProjectsSuccess({ response })),
          catchError(errors => of(projectApproveActions.loadProjectsFailure({ errors })))
        )
      )
    )
  );

  loadProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectApproveActions.loadProject),
      map(action => action.payload),
      mergeMap((payload: { id: number }) =>
        this.projectService.getProject(payload.id).pipe(
          map((response: Project) => projectApproveActions.loadProjectSuccess({ response })),
          catchError(errors => of(projectApproveActions.loadProjectFailure({ errors })))
        )
      )
    )
  );

  approveProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectApproveActions.approveProject),
      map(action => action.payload),
      switchMap((payload) =>
        this.projectService.approveProject(payload).pipe(
          map((response: Project) => projectApproveActions.approveProjectSuccess({ response })),
          catchError(errors => of(projectApproveActions.approveProjectFailure({ errors })))
        )
      )
    )
  );

  approveProjectSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectApproveActions.approveProjectSuccess),
      map(_ => {
        this.raiseSuccess('Phê duyệt đề tài thành công.');
        return projectApproveActions.loadProjects()
      }),
    )
  );
}
