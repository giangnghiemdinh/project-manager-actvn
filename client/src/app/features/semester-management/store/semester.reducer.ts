import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../../common/abstracts';
import { Semester } from '../../../common/models';
import { SemesterActions } from './semester.actions';

export interface SemesterState extends AbstractState {
    semester: Semester | null,
    isVisible: boolean;
}

export const initialState: SemesterState = {
    semester: null,
    isVisible: false,
    isLoading: false,
    errors: null
};

export const semesterFeature = createFeature({
    name: 'semester',
    reducer: createReducer(
        initialState,

        on(SemesterActions.updateVisible, (state, { isVisible }) => ({
            ...state,
            isVisible,
            semester: isVisible ? null : state.semester,
        })),

        on(SemesterActions.loadSemester, (state) => ({
            ...state,
            semester: null,
            errors: null,
            isVisible: false,
            isLoading: true,
        })),

        on(SemesterActions.loadSemesterSuccess, (state, { response }) => ({
            ...state,
            semester: response,
            errors: null,
            isVisible: true,
            isLoading: false,
        })),

        on(SemesterActions.loadSemesterFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(SemesterActions.createSemester, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(SemesterActions.createSemesterSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(SemesterActions.createSemesterFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(SemesterActions.updateSemester, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(SemesterActions.updateSemesterSuccess, (state) => ({
            ...state,
            errors: null,
            isVisible: false,
            isLoading: false,
        })),

        on(SemesterActions.updateSemesterFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),

        on(SemesterActions.deleteSemester, (state) => ({
            ...state,
            errors: null,
            isLoading: true,
        })),

        on(SemesterActions.deleteSemesterSuccess, (state) => ({
            ...state,
            errors: null,
            isLoading: false,
        })),

        on(SemesterActions.deleteSemesterFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    )
});

export const {
    selectSemester,
    selectIsVisible,
    selectIsLoading,
    selectErrors,
} = semesterFeature;
