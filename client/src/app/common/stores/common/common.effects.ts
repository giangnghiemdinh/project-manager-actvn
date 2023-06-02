import { inject, Injectable } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CommonActions } from './common.actions';
import { Department, PaginationPayload, Semester } from '../../models';
import { CommonService, DepartmentService, SemesterService, StudentService, UserService } from '../../services';
import { AbstractEffects } from '../../abstracts';

@Injectable()
export class CommonEffects extends AbstractEffects {

    readonly #departmentService = inject(DepartmentService);
    readonly #commonService = inject(CommonService);
    readonly #studentService = inject(StudentService);
    readonly #semesterService = inject(SemesterService);
    readonly #userService = inject(UserService);

    loadDepartments$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CommonActions.loadDepartments),
            mergeMap(_ =>
                this.#departmentService.getDepartments().pipe(
                    map((response: Department[]) => CommonActions.loadDepartmentsSuccess({ response })),
                    catchError(errors => of(CommonActions.loadDepartmentsFailure({ errors })))
                )
            )
        )
    );

    loadSemesters$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CommonActions.loadSemesters),
            mergeMap(_ =>
                this.#semesterService.getSemesters().pipe(
                    map((response: Semester[]) => CommonActions.loadSemestersSuccess({ response })),
                    catchError(errors => of(CommonActions.loadSemestersFailure({ errors })))
                )
            )
        )
    );

    searchStudents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CommonActions.searchStudents),
            map(action => action.payload),
            mergeMap((payload: PaginationPayload) =>
                this.#studentService.getStudents(payload).pipe(
                    map((response) => CommonActions.searchStudentsSuccess({ response })),
                    catchError(errors => of(CommonActions.searchStudentsFailure({ errors })))
                )
            )
        )
    );

    searchUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CommonActions.searchUsers),
            map(action => action.payload),
            mergeMap((payload: PaginationPayload) =>
                this.#userService.getUsers(payload).pipe(
                    map((response) => CommonActions.searchUsersSuccess({ response })),
                    catchError(errors => of(CommonActions.searchUsersFailure({ errors })))
                )
            )
        )
    );
}
