import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { ProjectActions } from './project.actions';
import { Project, ProjectImportPayload } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { ProjectService } from '../../../common/services';
import { selectQueryParams } from '../../../common/stores/router';
import { ProjectStatus } from '../../../common/constants/project.constant';
import { AuthState, selectProfile } from '../../../common/stores';
import { Store } from '@ngrx/store';
import { ExaminerCouncilPosition, Role } from '../../../common/constants/user.constant';
import { ProjectProgress } from '../../../common/models/project-progress.model';


@Injectable()
export class ProjectEffects extends AbstractEffects {
    private readonly authStore = inject(Store<AuthState>);
    private readonly projectService = inject(ProjectService);

    loadProjects$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.loadProjects),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, queryParams]) =>
                this.projectService.getProjects(queryParams).pipe(
                    concatLatestFrom(() => this.authStore.select(selectProfile)),
                    map(([response, profile]) => {
                        const isAdministrator = profile?.role === Role.ADMINISTRATOR;
                        const data = response.data.map(d => {
                            d.isInstructor = d.status === ProjectStatus.IN_PROGRESS && (isAdministrator || profile?.id === d.instructor?.id);
                            d.isManager = d.status === ProjectStatus.IN_PROGRESS && (isAdministrator || profile?.id === d.managerStaff?.userId);
                            d.isReviewer = d.status === ProjectStatus.IN_REVIEW && (isAdministrator || profile?.id === d.reviewerStaff?.userId);
                            d.isCouncilManager = d.status === ProjectStatus.IN_PRESENTATION && (isAdministrator || d.examinerCouncil?.users?.some(u =>
                                u.position && [ExaminerCouncilPosition.CHAIRPERSON, ExaminerCouncilPosition.SECRETARY].includes(u.position)));
                            return d;
                        });
                        return ProjectActions.loadProjectsSuccess({
                            response: { data, meta: response.meta },
                            profile
                        });
                    }),
                    catchError(errors => of(ProjectActions.loadProjectsFailure({ errors })))
                )
            )
        )
    );

    loadProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.loadProject),
            map(action => action.payload),
            mergeMap((payload) =>
                this.projectService.getProject(payload.id, payload.extra).pipe(
                    map((response: Project) => ProjectActions.loadProjectSuccess({ response, modal: payload.modal })),
                    catchError(errors => of(ProjectActions.loadProjectFailure({ errors })))
                )
            )
        )
    );

    loadReport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.loadReport),
            map(action => action.payload),
            mergeMap((payload) =>
                this.projectService.getReport(payload).pipe(
                    map((response: Project) => ProjectActions.loadReportSuccess({ response })),
                    catchError(errors => of(ProjectActions.loadReportFailure({ errors })))
                )
            )
        )
    );

    createProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.createProject),
            map(action => action.payload),
            switchMap((payload: Project) =>
                this.projectService.createProject(payload).pipe(
                    map((response: Project) => ProjectActions.createProjectSuccess({ response })),
                    catchError(errors => of(ProjectActions.createProjectFailure({ errors })))
                )
            )
        )
    );

    createProjectSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.createProjectSuccess),
            map(res => {
                this.raiseSuccess(res.response.status == ProjectStatus.PROPOSE
                    ? 'Đề xuất đề tài thành công'
                    : 'Thêm mới đề tài thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );

    updateProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.updateProject),
            map(action => action.payload),
            mergeMap((payload: Project) =>
                this.projectService.updateProject(payload).pipe(
                    map(_ => ProjectActions.updateProjectSuccess()),
                    catchError(errors => of(ProjectActions.updateProjectFailure({ errors })))
                )
            )
        )
    );

    updateProjectSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.updateProjectSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật đề tài thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );

    deleteProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.deleteProject),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.projectService.deleteProject(payload.id).pipe(
                    map(_ => ProjectActions.deleteProjectSuccess()),
                    catchError(errors => of(ProjectActions.deleteProjectFailure({ errors })))
                )
            )
        )
    );

    deleteProjectSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.deleteProjectSuccess),
            map(_ => {
                this.raiseSuccess('Xoá đề tài thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );

    report$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.report),
            map(action => action.payload),
            switchMap((payload: ProjectProgress) => {
                return this.projectService.report(payload.id!, payload).pipe(
                    map(response => ProjectActions.reportSuccess({ response })),
                    catchError(errors => of(ProjectActions.reportFailure({ errors })))
                );
            })
        )
    );

    reportSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(ProjectActions.reportSuccess),
                tap(_ => {
                    this.raiseSuccess('Cập nhật báo cáo tiến độ thành công.');
                }),
            ),
        { dispatch: false }
    );

    review$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.review),
            map(action => action.payload),
            mergeMap(payload =>
                this.projectService.review(payload).pipe(
                    map(response => ProjectActions.reviewSuccess({ response })),
                    catchError(errors => of(ProjectActions.reviewFailure({ errors })))
                )
            )
        )
    );

    reviewSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.reviewSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật nhận xét thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );

    importProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.importProject),
            map(action => action.payload),
            mergeMap((payload: ProjectImportPayload) =>
                this.projectService.import(payload).pipe(
                    map(_ => ProjectActions.importProjectSuccess()),
                    catchError(errors => of(ProjectActions.importProjectFailure({ errors })))
                )
            )
        )
    );


    importProjectSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.importProjectSuccess),
            map(_ => {
                this.raiseSuccess('Nhập danh sách đề tài thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );

    councilReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.councilReview),
            map(action => action.payload),
            mergeMap((payload: Project) =>
                this.projectService.councilReview(payload).pipe(
                    map(_ => ProjectActions.councilReviewSuccess()),
                    catchError(errors => of(ProjectActions.createProjectFailure({ errors })))
                )
            )
        )
    );

    councilReviewSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.councilReviewSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật điểm đề tài thành công.');
                return ProjectActions.loadProjects()
            }),
        )
    );
}
