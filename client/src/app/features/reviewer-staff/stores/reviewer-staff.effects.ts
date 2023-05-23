import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mergeMap, of, tap } from 'rxjs';
import { ReviewerStaffActions } from './reviewer-staff.actions';
import { ProjectService } from '../../../common/services';
import { PaginationPayload, ReviewerStaff } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { selectQueryParams } from '../../../common/stores/router';
import { Router } from '@angular/router';
import { RO_REVIEWER_STAFF } from '../../../common/constants';
import { ReviewerStaffService } from '../services/reviewer-staff.service';


@Injectable()
export class ReviewerStaffEffects extends AbstractEffects {

    private readonly projectService = inject(ProjectService);
    private readonly reviewerStaffService = inject(ReviewerStaffService);
    private readonly router = inject(Router);

    loadAllProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.loadAllProjects),
            map(action => action.payload),
            switchMap((payload: PaginationPayload) =>
                this.projectService.getProjects(payload).pipe(
                    map(response => {
                        return response.meta.hasNextPage
                            ? ReviewerStaffActions.loadAllProjects({
                                payload: {...payload, page: response.meta.page! + 1},
                                response: response
                            })
                            : ReviewerStaffActions.loadAllProjectsSuccess({ response });
                    }),
                    catchError(errors => of(ReviewerStaffActions.loadAllProjectsFailure({ errors })))
                )
            )
        )
    );

    loadReviewerStaffs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.loadReviewerStaffs),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, params]) =>
                this.reviewerStaffService.getReviewerStaffs(params).pipe(
                    map((response) => ReviewerStaffActions.loadReviewerStaffsSuccess({ response })),
                    catchError(errors => of(ReviewerStaffActions.loadReviewerStaffsFailure({ errors })))
                )
            )
        )
    );

    loadReviewerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.loadReviewerStaff),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.reviewerStaffService.getReviewerStaff(payload.id).pipe(
                    map((response: ReviewerStaff) => ReviewerStaffActions.loadReviewerStaffSuccess({ response })),
                    catchError(errors => of(ReviewerStaffActions.loadReviewerStaffFailure({ errors })))
                )
            )
        )
    );

    createReviewerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.createReviewerStaff),
            map(action => action.payload),
            mergeMap((payload: ReviewerStaff) =>
                this.reviewerStaffService.createReviewerStaff(payload).pipe(
                    map((response: ReviewerStaff) => ReviewerStaffActions.createReviewerStaffSuccess({ response })),
                    catchError(errors => of(ReviewerStaffActions.createReviewerStaffFailure({ errors })))
                )
            )
        )
    );

    createReviewerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.createReviewerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới nhóm phản biện thành công.');
                return ReviewerStaffActions.loadReviewerStaffs()
            }),
        )
    );

    createMultipleReviewerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.createMultipleReviewerStaff),
            map(action => action.payload),
            mergeMap((payload: ReviewerStaff[]) =>
                this.reviewerStaffService.createMultipleReviewerStaff(payload).pipe(
                    map(_ => ReviewerStaffActions.createMultipleReviewerStaffSuccess()),
                    catchError(errors => of(ReviewerStaffActions.createMultipleReviewerStaffFailure({ errors })))
                )
            )
        )
    );

    createMultipleReviewerStaffSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(ReviewerStaffActions.createMultipleReviewerStaffSuccess),
                tap(_ => {
                    this.raiseSuccess('Thành lập danh sách phản biện thành công.');
                    this.router.navigate(['/' + RO_REVIEWER_STAFF]).then();
                }),
            ),
        { dispatch: false }
    );

    updateReviewerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.updateReviewerStaff),
            map(action => action.payload),
            mergeMap((payload: ReviewerStaff) =>
                this.reviewerStaffService.updateReviewerStaff(payload).pipe(
                    map(_ => ReviewerStaffActions.updateReviewerStaffSuccess()),
                    catchError(errors => of(ReviewerStaffActions.updateReviewerStaffFailure({ errors })))
                )
            )
        )
    );

    updateReviewerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.updateReviewerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật nhóm phản biện thành công.');
                return ReviewerStaffActions.loadReviewerStaffs();
            }),
        ),
    );

    deleteReviewerStaff$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.deleteReviewerStaff),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.reviewerStaffService.deleteReviewerStaff(payload.id).pipe(
                    map(_ => ReviewerStaffActions.deleteReviewerStaffSuccess()),
                    catchError(errors => of(ReviewerStaffActions.deleteReviewerStaffFailure({ errors })))
                )
            )
        )
    );

    deleteReviewerStaffSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewerStaffActions.deleteReviewerStaffSuccess),
            map(_ => {
                this.raiseSuccess('Xoá nhóm phản biện thành công.');
                return ReviewerStaffActions.loadReviewerStaffs();
            }),
        ),
    );
}
