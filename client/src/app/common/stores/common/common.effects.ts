import { inject, Injectable } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CommonActions } from './common.actions';
import { Department, Semester } from '../../models';
import { DepartmentService, SemesterService } from '../../services';
import { AbstractEffects } from '../../abstracts';

@Injectable()
export class CommonEffects extends AbstractEffects {

    readonly #departmentService = inject(DepartmentService);
    readonly #semesterService = inject(SemesterService);

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
}
