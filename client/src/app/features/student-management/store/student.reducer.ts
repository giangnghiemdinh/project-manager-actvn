import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { MetaPagination, Student } from '../../../common/models';
import * as studentActions from './student.actions';

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

        on(studentActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            student: isVisible ? null : state.student,
        })),

        on(studentActions.updateVisibleImport, (state, { isVisible }) => ({
            ...state,
            isVisibleImport: isVisible,
        })),

        on(studentActions.loadStudents, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(studentActions.loadStudentsSuccess, (state, { response }) => ({
            ...state,
            students: response.data,
            pagination: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(studentActions.loadStudentsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(studentActions.loadStudent, (state) => ({
            ...state,
            student: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(studentActions.loadStudentSuccess, (state, { response }) => ({
            ...state,
            student: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(studentActions.loadStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(studentActions.createStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(studentActions.createStudentSuccess, (state, { response }) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(studentActions.createStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(studentActions.updateStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(studentActions.updateStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(studentActions.updateStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(studentActions.importStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(studentActions.importStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isVisibleImport: false,
            isLoading: false,
        })),

        on(studentActions.importStudentFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(studentActions.deleteStudent, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(studentActions.deleteStudentSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(studentActions.deleteStudentFailure, (state, { errors }) => ({
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
