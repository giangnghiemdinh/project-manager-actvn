import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { StudentService } from '../../../common/services';
import { StudentActions } from './student.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { Student } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { selectQueryParams } from '../../../common/stores/router';

@Injectable()
export class StudentEffects extends AbstractEffects {
    readonly #studentService = inject(StudentService);

    loadStudents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.loadStudents),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, queryParams]) =>
                this.#studentService.getStudents(queryParams).pipe(
                    map((response) => StudentActions.loadStudentsSuccess({ response })),
                    catchError(errors => of(StudentActions.loadStudentsFailure({ errors })))
                )
            )
        )
    );

    loadStudent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.loadStudent),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#studentService.getStudent(payload.id).pipe(
                    map((response: Student) => StudentActions.loadStudentSuccess({ response })),
                    catchError(errors => of(StudentActions.loadStudentFailure({ errors })))
                )
            )
        )
    );

    createStudent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.createStudent),
            map(action => action.payload),
            mergeMap((payload: Student) =>
                this.#studentService.createStudent(payload).pipe(
                    map((response: Student) => StudentActions.createStudentSuccess({ response })),
                    catchError(errors => of(StudentActions.createStudentFailure({ errors })))
                )
            )
        )
    );

    createStudentSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.createStudentSuccess),
            map(_ => {
                this.raiseSuccess('Thêm mới sinh viên thành công.');
                return StudentActions.loadStudents()
            }),
        )
    );

    updateStudent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.updateStudent),
            map(action => action.payload),
            mergeMap((payload: Student) =>
                this.#studentService.updateStudent(payload).pipe(
                    map(_ => StudentActions.updateStudentSuccess()),
                    catchError(errors => of(StudentActions.updateStudentFailure({ errors })))
                )
            )
        )
    );

    updateStudentSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.updateStudentSuccess),
            map(_ => {
                this.raiseSuccess('Cập nhật sinh viên thành công.');
                return StudentActions.loadStudents()
            }),
        ),
    );

    deleteStudent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.deleteStudent),
            map(action => action.payload),
            mergeMap((payload: { id: number }) =>
                this.#studentService.deleteStudent(payload.id).pipe(
                    map(_ => StudentActions.deleteStudentSuccess()),
                    catchError(errors => of(StudentActions.deleteStudentFailure({ errors })))
                )
            )
        )
    );

    deleteStudentSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.deleteStudentSuccess),
            map(_ => {
                this.raiseSuccess('Xoá sinh viên thành công.');
                return StudentActions.loadStudents()
            }),
        ),
    );

    importStudent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.importStudent),
            map(action => action.payload),
            mergeMap((payload) =>
                this.#studentService.importStudent(payload).pipe(
                    map(_ => StudentActions.importStudentSuccess()),
                    catchError(errors => of(StudentActions.importStudentFailure({ errors })))
                )
            )
        )
    );

    importStudentSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StudentActions.importStudentSuccess),
            map(_ => {
                this.raiseSuccess('Nhập danh sách sinh viên thành công.');
                return StudentActions.loadStudents();
            }),
        ),
    );
}
