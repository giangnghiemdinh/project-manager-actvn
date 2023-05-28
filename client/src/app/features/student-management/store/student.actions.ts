import { createAction, props } from '@ngrx/store';
import { PaginationResponse, Student, StudentImport } from '../../../common/models';

export const loadStudents = createAction(
  '[Student] Load Students'
);

export const loadStudentsSuccess = createAction(
  '[Student/API] Load Students Success',
  props<{ response: PaginationResponse<Student> }>()
);

export const loadStudentsFailure = createAction(
  '[Student/API] Load Students Failure',
  props<{ errors: any }>()
);

export const loadStudent = createAction(
  '[Student] Load Student',
  props<{ payload: { id: number } }>()
);

export const loadStudentSuccess = createAction(
  '[Student/API] Load Student Success',
  props<{ response: Student }>()
);

export const loadStudentFailure = createAction(
  '[Student/API] Load Student Failure',
  props<{ errors: any }>()
);

export const createStudent = createAction(
  '[Student] Create Student',
  props<{ payload: Student }>()
);

export const createStudentSuccess = createAction(
  '[Student/API] Create Student Success',
  props<{ response: Student }>()
);

export const createStudentFailure = createAction(
  '[Student/API] Create Student Failure',
  props<{ errors: any }>()
);

export const updateStudent = createAction(
  '[Student] Update Student',
  props<{ payload: Student }>()
);

export const updateStudentSuccess = createAction(
  '[Student/API] Update Student Success'
);

export const updateStudentFailure = createAction(
  '[Student/API] Update Student Failure',
  props<{ errors: any }>()
);

export const deleteStudent = createAction(
  '[Student] Delete Student',
  props<{ payload: { id: number } }>()
);

export const deleteStudentSuccess = createAction(
  '[Student/API] Delete Student Success'
);

export const deleteStudentFailure = createAction(
  '[Student/API] Delete Student Failure',
  props<{ errors: any }>()
);

export const updateVisible = createAction(
  '[Student] Update Visible',
  props<{ isVisible: boolean }>()
);

export const updateVisibleImport = createAction(
    '[Student] Update Visible Import',
    props<{ isVisible: boolean }>()
);

export const importStudent = createAction(
    '[Student] Import Student',
    props<{ payload: StudentImport }>()
);

export const importStudentSuccess = createAction(
    '[Student/API] Import Student Success'
);

export const importStudentFailure = createAction(
    '[Student/API] Import Student Failure',
    props<{ errors: any }>()
);
