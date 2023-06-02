import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of } from 'rxjs';
import { ProjectApproveActions } from './project-approve.actions';
import { PaginationResponse, Project } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { ProjectService } from '../../../common/services';
import { selectQueryParams } from '../../../common/stores/router';
import { ProjectStatus } from '../../../common/constants';


@Injectable()
export class ProjectApproveEffects extends AbstractEffects {
    readonly #projectService = inject(ProjectService);

    loadProjects$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectApproveActions.loadProjects),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, queryParams]) =>
                this.#projectService.getProjects({
                    ...queryParams,
                    status: queryParams['status'] || [ProjectStatus.PROPOSE, ProjectStatus.REFUSE, ProjectStatus.EXPIRED].join(',') }
                ).pipe(
                    map((response: PaginationResponse<Project>) => ProjectApproveActions.loadProjectsSuccess({ response })),
                    catchError(errors => of(ProjectApproveActions.loadProjectsFailure({ errors })))
                )
            )
        )
    );

    loadProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectApproveActions.loadProject),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#projectService.getProject(payload.id).pipe(
                    map((response: Project) => ProjectApproveActions.loadProjectSuccess({ response })),
                    catchError(errors => of(ProjectApproveActions.loadProjectFailure({ errors })))
                )
            )
        )
    );

    approveProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectApproveActions.approveProject),
            map(action => action.payload),
            switchMap((payload) =>
                this.#projectService.approveProject(payload).pipe(
                    map((response: Project) => ProjectApproveActions.approveProjectSuccess({ response })),
                    catchError(errors => of(ProjectApproveActions.approveProjectFailure({ errors })))
                )
            )
        )
    );

    approveProjectSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectApproveActions.approveProjectSuccess),
            map(_ => {
                this.raiseSuccess('Phê duyệt đề tài thành công.');
                return ProjectApproveActions.loadProjects()
            }),
        )
    );
}
