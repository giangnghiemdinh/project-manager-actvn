import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Student } from '../../../common/models';
import { StudentActions } from './student.actions';

export interface StudentState extends AbstractState {
    students: Student[],
    pagination: MetaPagination | null,
    student: Student | null,
    isVisible: boolean,
    isVisibleImport: boolean
}

export const initialState: StudentState = {
    students: [],
    pagination: null,
    student: null,
    isVisible: false,
    isVisibleImport: false,
    isLoading: false,
    errors: null
};

export const studentFeature = createFeature({
    name: 'student',
    reducer: createReducer(
        initialState,

        on(StudentActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            student: isVisible ? null : state.student,
        })),

        on(StudentActions.updateVisibleImport, (state, { isVisible }) => ({
            ...state,
            isVisibleImport: isVisible,
        })),

        on(StudentActions.loadStudents, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(StudentActions.loadStudentsSuccess, (state, { response }) => ({
            ...state,
            students: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(StudentActions.loadStudentsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(StudentActions.loadStudent, (state) => ({
            ...state,
            student: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(StudentActions.loadStudentSuccess, (state, { response }) => ({
            ...state,
            student: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(StudentActions.loadStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(StudentActions.createStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(StudentActions.createStudentSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(StudentActions.createStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(StudentActions.updateStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(StudentActions.updateStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(StudentActions.updateStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(StudentActions.importStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(StudentActions.importStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisibleImport: false,
            isLoading: false,
        })),

        on(StudentActions.importStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(StudentActions.deleteStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(StudentActions.deleteStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(StudentActions.deleteStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectStudents,
    selectPagination,
    selectStudent,
    selectIsVisible,
    selectIsVisibleImport,
    selectIsLoading,
    selectErrors,
} = studentFeature;
