import { createFeature, createReducer, on } from '@ngrx/store';
import { CommonActions } from './common.actions';
import { AbstractState } from '../../abstracts';
import { Department, Semester } from '../../models';

export interface CommonState extends AbstractState {
    departments: Department[],
    semesters: Semester[],
}

export const initialCommonState: CommonState = {
    departments: [],
    semesters: [],
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
    )
});

export const {
    reducer: commonReducer,
    selectDepartments,
    selectSemesters,
    selectIsLoading: selectCommonLoading,
    selectErrors: selectCommonErrors
} = commonFeature;
