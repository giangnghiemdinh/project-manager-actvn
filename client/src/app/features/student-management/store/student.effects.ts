import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { StudentService } from '../../../common/services';
import * as studentActions from './student.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { Student } from '../../../common/models';
import { AbstractEffects } from '../../../common/abstracts';
import { selectQueryParams } from '../../../common/stores/router';

@Injectable()
export class StudentEffects extends AbstractEffects {
  private readonly studentService = inject(StudentService);

  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.loadStudents),
      concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
      mergeMap(([_, queryParams]) =>
        this.studentService.getStudents(queryParams).pipe(
          map((response) => studentActions.loadStudentsSuccess({ response })),
          catchError(errors => of(studentActions.loadStudentsFailure({ errors })))
        )
      )
    )
  );

  loadStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.loadStudent),
      map(action => action.payload),
      mergeMap((payload: { id: number }) =>
        this.studentService.getStudent(payload.id).pipe(
          map((response: Student) => studentActions.loadStudentSuccess({ response })),
          catchError(errors => of(studentActions.loadStudentFailure({ errors })))
        )
      )
    )
  );

  createStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.createStudent),
      map(action => action.payload),
      mergeMap((payload: Student) =>
        this.studentService.createStudent(payload).pipe(
          map((response: Student) => studentActions.createStudentSuccess({ response })),
          catchError(errors => of(studentActions.createStudentFailure({ errors })))
        )
      )
    )
  );

  createStudentSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.createStudentSuccess),
      map(_ => {
        this.raiseSuccess('Thêm mới sinh viên thành công.');
        return studentActions.loadStudents()
      }),
    )
  );

  updateStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.updateStudent),
      map(action => action.payload),
      mergeMap((payload: Student) =>
        this.studentService.updateStudent(payload).pipe(
          map(_ => studentActions.updateStudentSuccess()),
          catchError(errors => of(studentActions.updateStudentFailure({ errors })))
        )
      )
    )
  );

  updateStudentSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.updateStudentSuccess),
      map(_ => {
        this.raiseSuccess('Cập nhật sinh viên thành công.');
        return studentActions.loadStudents()
      }),
    ),
  );

  deleteStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.deleteStudent),
      map(action => action.payload),
      mergeMap((payload: { id: number }) =>
        this.studentService.deleteStudent(payload.id).pipe(
          map(_ => studentActions.deleteStudentSuccess()),
          catchError(errors => of(studentActions.deleteStudentFailure({ errors })))
        )
      )
    )
  );

  deleteStudentSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentActions.deleteStudentSuccess),
      map(_ => {
        this.raiseSuccess('Xoá sinh viên thành công.');
        return studentActions.loadStudents()
      }),
    ),
  );
}
