import { createFeature, createReducer, on } from '@ngrx/store';
import { CommonActions } from './common.actions';
import { AbstractState } from '../../abstracts';
import { Department, MetaPagination, Semester, Student, User } from '../../models';

export interface CommonState extends AbstractState {
    departments: Department[],
    semesters: Semester[],
    students: Student[],
    studentPage: MetaPagination | null;
    users: User[],
    userPage: MetaPagination | null;
}

export const initialCommonState: CommonState = {
    departments: [],
    semesters: [],
    students: [],
    studentPage: null,
    users: [],
    userPage: null,
    isLoading: false,
    errors: null
};

export const commonFeature = createFeature({
    name: 'common',
    reducer: createReducer(
        initialCommonState,

        on(CommonActions.loadDepartments, state => ({
            ...state,
            isLoading: true,
            errors: null
        })),
        on(CommonActions.loadDepartmentsSuccess, (state, { response }) => ({
            ...state,
            departments: response,
            isLoading: false,
            errors: null
        })),
        on(CommonActions.loadDepartmentsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(CommonActions.loadSemesters, state => ({
            ...state,
            isLoading: true,
            errors: null
        })),
        on(CommonActions.loadSemestersSuccess, (state, { response }) => ({
            ...state,
            semesters: response,
            isLoading: false,
            errors: null
        })),
        on(CommonActions.loadSemestersFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(CommonActions.searchStudents, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(CommonActions.searchStudentsSuccess, (state, { response }) => ({
            ...state,
            students: response.data,
            studentPage: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(CommonActions.searchStudentsFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(CommonActions.searchUsers, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(CommonActions.searchUsersSuccess, (state, { response }) => ({
            ...state,
            users: response.data,
            userPage: response.meta,
            errors: null,
            isLoading: false,
        })),

        on(CommonActions.searchUsersFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    reducer: commonReducer,
    selectDepartments,
    selectSemesters,
    selectStudents,
    selectStudentPage,
    selectUsers,
    selectUserPage,
    selectIsLoading: selectCommonLoading,
    selectErrors: selectCommonError
} = commonFeature;
